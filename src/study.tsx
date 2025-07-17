// deno-lint-ignore-file no-explicit-any
import { Fragment, type JSX } from "preact";
import { splitID, type IWordList } from "@sholvoir/memword-common/iwordlist";
import { useEffect, useRef } from "preact/hooks";
import { STATUS_CODE } from "@sholvoir/generic/http";
import { useSignal } from "@preact/signals";
import { getClientWordlist } from "../lib/wordlists.ts";
import { wait } from "@sholvoir/generic/wait";
import * as app from "./app.tsx";
import * as mem from '../lib/mem.ts';
import Tab from '../components/tab.tsx';
import SButton from '../components/button-base.tsx';
import Dialog from './dialog.tsx';
import Scard from './scard.tsx';

export default () => {
    const finish = async () => {
        app.go(app.sprint.value < 0 ? '#search': undefined);
        await app.totalStats();
        await mem.syncTasks();
        app.totalStats();
    }
    if (!app.citem.value) return (app.go(), <div />);
    const cindex = useSignal(0);
    const startX = useSignal(0);
    const endX = useSignal(0);
    const max = globalThis.innerWidth;
    const mwls = useSignal<Array<IWordList>>([]);
    const showAddToBookMenu = useSignal(false);
    const player = useRef<HTMLAudioElement>(null);
    const handleIKnown = (level?: number) => mem.studied(app.citem.value!.word, level);
    const studyNext = async () => {
        if (app.sprint.value < 0) return finish();
        const item = await mem.getEpisode(app.wlid.value);
        if (!item) return finish();
        app.sprint.value++;
        app.citem.value = item;
        app.isPhaseAnswer.value = false;
        cindex.value = 0;
    };
    const continueMove = async (x: number) => {
        endX.value += x;
        const diff = Math.abs(endX.value - startX.value);
        if (diff < max) {
            await wait(30);
            await continueMove(x);
        };
    };
    const handleRefresh = async () => {
        app.showTips("Get Server Data...");
        const item = await mem.getUpdatedItem(app.citem.value!.word);
        if (!item) return app.showTips(`Not Found ${app.citem.value!.word}`);
        app.citem.value = item;
    };
    const handleReportIssue = async () => {
        app.showTips('Submiting...', false);
        await mem.submitIssue(app.citem.value!.word);
        app.showTips('Submit Success!')
    };
    const handleDelete = async () => {
        app.showTips((await mem.deleteItem(app.citem.value!.word)) ? '删除成功' : '删除失败');
        await studyNext();
    }
    const handleKeyPress = (e: JSX.TargetedKeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation()
        if (e.ctrlKey || e.altKey) return;
        switch (e.key) {
            case ' ': handleClick(e as any); break;
            case 'N': case 'X': case 'n': case 'x': if (app.isPhaseAnswer.value) handleIKnown().then(studyNext); break;
            case 'M': case 'Z': case 'm': case 'z': if (app.isPhaseAnswer.value) handleIKnown(0).then(studyNext); break;
        }
    };
    const handleTouchStart = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        app.isPhaseAnswer.value && (endX.value = startX.value = e.touches[0].clientX);
    }
    const handleTouchMove = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        app.isPhaseAnswer.value && (endX.value = e.touches[0].clientX);
    }
    const handleTouchCancel = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        app.isPhaseAnswer.value && (endX.value = startX.value = 0);
    }
    const handleTouchEnd = async (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (app.isPhaseAnswer.value) {
            const diff = endX.value - startX.value;
            if (Math.abs(diff) >= max / 4) {
                if (diff > 0) {
                    await handleIKnown(0);
                    await continueMove(30);
                } else {
                    await handleIKnown();
                    await continueMove(-30)
                }
                await studyNext();
            } else if (Math.abs(diff) < 5) handleClick();
        } else handleClick();
        endX.value = startX.value = 0;
    };
    const handleClick = (e?: JSX.TargetedMouseEvent<HTMLDivElement>) => {
        e?.stopPropagation();
        if (showAddToBookMenu.value) return showAddToBookMenu.value = false;
        const cardsN = app.citem.value?.cards?.length ?? 0;
        if (cardsN === 0) return;
        if (!app.isPhaseAnswer.value) (app.isPhaseAnswer.value = true) && player.current?.play();
        else if (cardsN === 1) player.current?.play();
        else if (cindex.value < cardsN - 1) cindex.value++;
        else cindex.value = 0;
    }
    const handleAddToBook = async (wl: IWordList) => {
        showAddToBookMenu.value = false;
        const word = app.citem.value!.word;
        const wordSet = (await getClientWordlist(wl.wlid))?.wordSet;
        if (wordSet?.has(word)) return app.showTips("已包含");
        const [_, bookName] = splitID(wl.wlid);
        const [status] = await mem.postMyWordList(bookName, word);
        app.showTips(status == STATUS_CODE.OK? "添加成功" : "添加失败");
        wordSet?.add(app.citem.value!.word);
    }
    const init = async () => {
        mwls.value = await mem.getWordlists(wl => wl.wlid.startsWith(app.user.value));
    }
    useEffect(() => { init() }, []);
    return <Dialog onBackClick={finish} class="flex flex-col p-2"
        title={`学习${app.sprint.value > 0 ? `(${app.sprint.value})` : ''}`}>
        <div class="relative flex gap-4 text-[150%] justify-between items-end">
            <SButton disabled={!app.isPhaseAnswer.value} title="X/N"
                onClick={() => handleIKnown().then(studyNext)}
                class="i-material-symbols-check-circle text-green" />
            <SButton disabled={!app.isPhaseAnswer.value} title="Z/M"
                onClick={() => handleIKnown(0).then(studyNext)}
                class="i-gridicons-cross-circle text-fuchsia" />
            <SButton disabled={!app.isPhaseAnswer.value}
                onClick={() => handleIKnown(13).then(studyNext)}
                class="i-material-symbols-light-family-star text-yellow" />
            <SButton disabled={!app.isPhaseAnswer.value} onClick={handleDelete}
                class="i-material-symbols-delete-outline text-orange" />
            <SButton onClick={() => player.current?.play()}
                class="i-material-symbols-volume-up text-blue" />
            <SButton disabled={!app.isPhaseAnswer.value} onClick={handleReportIssue}
                class="i-material-symbols-error text-red" />
            <SButton disabled={!app.isPhaseAnswer.value} onClick={handleRefresh}
                class="i-material-symbols-refresh text-purple" />
            <SButton disabled={!app.isPhaseAnswer.value}
                onClick={()=>showAddToBookMenu.value = !showAddToBookMenu.value}
                class="i-material-symbols-dictionary-outline text-cyan">
            </SButton>
            <div class="text-lg">{app.citem.value.level}</div>
            {showAddToBookMenu.value && <div class="menu absolute top-[100%] right-[36px] text-lg text-right bg-[var(--bg-body)] z-1">
                {mwls.value.map(wl => <Fragment key={wl}><div/><menu onClick={()=>handleAddToBook(wl)}>{wl.disc??wl.wlid}</menu></Fragment>)}
                {mwls.value.length && <div/>}
            </div>}
        </div>
        <div class="relative grow h-0 pb-4 flex flex-col outline-none overflow-y-auto" tabIndex={-1}
            style={{ left: `${endX.value - startX.value}px` }}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel}
            onClick={handleClick}  onKeyUp={handleKeyPress}>
            <div class="py-2 flex gap-2 flex-wrap justify-between">
                <div class="text-4xl font-bold">{app.citem.value.word}</div>
                {app.isPhaseAnswer.value &&
                    <div class="text-2xl flex items-center">
                        {app.citem.value.cards?.[cindex.value].phonetic}
                    </div>
                }
            </div>
            {app.isPhaseAnswer.value && ((app.citem.value.cards?.length ?? 0) > 1 ?
                <Tab class="bg-[var(--bg-tab)]" cindex={cindex}>
                    {app.citem.value.cards?.map((card, i) => <Scard key={`${app.citem.value?.word}${i}`} card={card} />)}
                </Tab> :
                <div class="grow"><Scard card={app.citem.value.cards?.[0]} /></div>)
            }
            <audio ref={player} autoPlay src={app.citem.value.cards?.at(cindex.value)?.sound??''} />
        </div>
    </Dialog>;
}
