// deno-lint-ignore-file no-explicit-any
import type { JSX } from "preact";
import { useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { wait } from "@sholvoir/generic/wait";
import * as app from "./app.tsx";
import * as mem from '../lib/mem.ts';
import Tab from '../components/tab.tsx';
import SButton from '../components/button-base.tsx';
import Dialog from './dialog.tsx';
import Scard from './scard.tsx';

export default () => {
    const finish = async () => {
        app.go();
        await mem.syncTasks();
        app.totalStats();
    }
    if (!app.citem.value) return (app.go(), <div />);
    const cindex = useSignal(0);
    const startY = useSignal(0);
    const endY = useSignal(0);
    const player = useRef<HTMLAudioElement>(null);
    const handleIKnown = (level?: number) => mem.studied(app.citem.value!.word, level);
    const studyNext = async () => {
        if (++app.sprint.value <= 0) return finish();
        const item = await mem.getEpisode(app.wlid.value, app.blevel.value);
        if (!item) return finish();
        app.citem.value = item;
        app.isPhaseAnswer.value = false;
        cindex.value = 0;
    };
    const continueMove = async (y: number, max: number) => {
        endY.value += y;
        const diff = Math.abs(endY.value - startY.value);
        if (diff < max) {
            await wait(30);
            await continueMove(y, max);
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
        e.stopPropagation();
        e.preventDefault();
        app.isPhaseAnswer.value && (endY.value = startY.value = e.touches[0].clientY);
    }
    const handleTouchMove = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        app.isPhaseAnswer.value && (endY.value = e.touches[0].clientY);
    }
    const handleTouchCancel = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        app.isPhaseAnswer.value && (endY.value = startY.value = 0);
    }
    const handleTouchEnd = async (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        if (app.isPhaseAnswer.value) {
            const h = e.currentTarget.scrollHeight + 60;
            const diff = endY.value - startY.value;
            const max = Math.max(globalThis.innerHeight, h);
            if (Math.abs(diff) >= globalThis.innerHeight / 6) {
                if (diff > 0) {
                    await handleIKnown(0);
                    await continueMove(60, max);
                } else {
                    await handleIKnown();
                    await continueMove(-60, max)
                }
                await studyNext();
            } else if (Math.abs(diff) < 5) handleClick();
        } else handleClick();
        endY.value = startY.value = 0;
    };
    const handleClick = (e?: JSX.TargetedMouseEvent<HTMLDivElement>) => {
        e?.stopPropagation();
        const cardsN = app.citem.value?.cards?.length ?? 0;
        if (cardsN == 0) return;
        if (!app.isPhaseAnswer.value) app.isPhaseAnswer.value = true;
        else if (cardsN == 1) player.current?.play();
        else if (cindex.value < cardsN - 1) cindex.value++;
        else cindex.value = 0;
    }
    return <Dialog title="学习" onBackClick={finish}>
        <div class={`relative h-full p-2 flex flex-col outline-none`}
            tabIndex={-1} onKeyUp={handleKeyPress}
            style={{ top: `${endY.value - startY.value}px` }}>
            <div class="flex gap-4 text-[150%] items-center">
                <SButton disabled={!app.isPhaseAnswer.value} title="X/N"
                    onClick={() => handleIKnown().then(studyNext)}
                    class="i-material-symbols-check-circle text-green" />
                <SButton disabled={!app.isPhaseAnswer.value} title="Z/M"
                    onClick={() => handleIKnown(0).then(studyNext)}
                    class="i-gridicons-cross-circle text-fuchsia" />
                <SButton disabled={!app.isPhaseAnswer.value}
                    onClick={() => player.current?.play()}
                    class="i-material-symbols-volume-up text-blue" />
                {app.isAdmin() && <SButton disabled={!app.isPhaseAnswer.value}
                    onClick={() => app.go('#lookup')}
                    class="i-material-symbols-dictionary-outline text-cyan" />}
                <div class="grow text-center text-lg">{app.sprint.value > 0 ? app.sprint.value : ''}</div>
                <SButton disabled={!app.isPhaseAnswer.value}
                    onClick={() => handleIKnown(13).then(studyNext)}
                    class="i-material-symbols-light-family-star text-yellow" />
                <SButton disabled={!app.isPhaseAnswer.value} onClick={handleReportIssue}
                    class="i-material-symbols-error text-red" />
                <SButton disabled={!app.isPhaseAnswer.value} onClick={handleRefresh}
                    class="i-material-symbols-refresh text-purple" />
                <div class="text-lg">{app.citem.value.level}</div>
            </div>
            <div class="grow h-0 pb-4 flex flex-col" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} onClick={handleClick}>
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
                    <div class="grow h-0 overflow-y-auto"><Scard card={app.citem.value.cards?.[0]} /></div>)
                }
                <audio ref={player} autoPlay src={(app.isPhaseAnswer.value && app.citem.value.cards?.at(cindex.value)?.sound) ?
                    app.citem.value.cards[cindex.value].sound : ''} />
            </div>
        </div>
    </Dialog>;
}
