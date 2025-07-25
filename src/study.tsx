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
    const mainDiv = useRef<HTMLDivElement>(null);
    const cindex = useSignal(0);
    const touchPos = { startY: 0, endY: 0, cScrollTop: 0, moveTop: 0 }
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
    const continueMove = async (x: number, max: number) => {
        const diff = Math.abs(touchPos.moveTop += x);
        mainDiv.current!.style.top = `${touchPos.moveTop}px`;
        if (diff < max) {
            await wait(30);
            await continueMove(x, max);
        };
    };
    const handleRefresh = async () => {
        app.showTips("Get Server Data...", false);
        const item = await mem.getUpdatedItem(app.citem.value!.word);
        if (!item) return app.showTips(`Not Found ${app.citem.value!.word}`);
        app.hideTips();
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
        if (e.stopPropagation(), e.preventDefault(), !app.isPhaseAnswer.value) return;
        touchPos.endY = touchPos.startY = e.touches[0].clientY;
        touchPos.cScrollTop = e.currentTarget.scrollTop;
    }
    const handleTouchMove = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
        if (e.stopPropagation(), e.preventDefault(), !app.isPhaseAnswer.value) return;
        const diff = (touchPos.endY = e.touches[0].clientY) - touchPos.startY;
        const div = e.currentTarget;
        console.log('diff', touchPos.endY, touchPos.startY, diff);
        if (diff < 0) {
            const topMax = div.scrollHeight - div.clientHeight;
            if (touchPos.cScrollTop - diff < topMax) div.scrollTop = touchPos.cScrollTop - diff;
            else {
                div.scrollTop = topMax;
                touchPos.moveTop = topMax - (touchPos.cScrollTop - diff);
            }
        } else {
            if (touchPos.cScrollTop - diff > 0) div.scrollTop = touchPos.cScrollTop - diff;
            else {
                div.scrollTop = 0;
                touchPos.moveTop = diff - touchPos.cScrollTop;
            }
        }
        mainDiv.current!.style.top = `${touchPos.moveTop}px`;
        console.log(div.scrollTop, touchPos.moveTop);
    }
    const handleTouchCancel = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
        if (e.stopPropagation(), e.preventDefault(), !app.isPhaseAnswer.value) return;
        touchPos.moveTop = 0;
        touchPos.cScrollTop = e.currentTarget.scrollTop;
        mainDiv.current!.style.top = `${touchPos.moveTop}px`;
    }
    const handleTouchEnd = async (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
        if (e.stopPropagation(), e.preventDefault(), !app.isPhaseAnswer.value) {
            touchPos.moveTop = 0;
            touchPos.cScrollTop = e.currentTarget.scrollTop;
            mainDiv.current!.style.top = `${touchPos.moveTop}px`;
            return handleClick();
        }
        const h = e.currentTarget.scrollHeight + 60;
        const max = Math.max(globalThis.innerHeight, h);
        if (Math.abs(touchPos.moveTop) >= globalThis.innerHeight / 6) {
            if (touchPos.moveTop > 0) {
                await handleIKnown(0);
                await continueMove(60, max);
            } else {
                await handleIKnown();
                await continueMove(-60, max)
            }
            await studyNext();
        } else if (Math.abs(touchPos.moveTop) < 5) handleClick();
        touchPos.moveTop = 0;
        mainDiv.current!.style.top = `${touchPos.moveTop}px`;
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
    return <Dialog onBackClick={finish} onKeyUp={handleKeyPress}
        tabIndex={-1} class="flex flex-col p-2 outline-none"
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
        <div class="relative grow h-0 pb-4 flex flex-col overflow-y-auto" ref={mainDiv}
            onClick={handleClick} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel}>
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
                <div class="grow"><Scard card={app.citem.value.cards?.[0]!} /></div>)
            }
            <audio ref={player} autoPlay src={app.citem.value.cards?.at(cindex.value)?.sound??''} />
        </div>
    </Dialog>;
}
