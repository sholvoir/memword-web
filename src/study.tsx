// deno-lint-ignore-file no-explicit-any
import { JSX } from "preact/jsx-runtime";
import { useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { wait } from "@sholvoir/generic/wait";
import { API_URL } from "../lib/common.ts";
import * as app from "./app.tsx";
import * as mem from '../lib/mem.ts';
import SButton from './button-base.tsx';
import Dialog from './dialog.tsx';
import Tab from './tab.tsx';
import Scard from './scard.tsx';
import IconRefresh from "./icon-refresh.tsx";

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
        if (e.ctrlKey || e.altKey) return;
        switch (e.key) {
            case ' ': handleClick(); break;
            case 'N': case 'X': case 'n': case 'x': if (app.isPhaseAnswer.value) handleIKnown().then(studyNext); break;
            case 'M': case 'Z': case 'm': case 'z': if (app.isPhaseAnswer.value) handleIKnown(0).then(studyNext); break;
        }
    };
    const handleTouchStart = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => app.isPhaseAnswer.value && (endY.value = startY.value = e.touches[0].clientY);
    const handleTouchMove = (e: JSX.TargetedTouchEvent<HTMLDivElement>) => app.isPhaseAnswer.value && (endY.value = e.touches[0].clientY);
    const handleTouchCancel = () => app.isPhaseAnswer.value && (endY.value = startY.value = 0);
    const handleTouchEnd = async (e: JSX.TargetedTouchEvent<HTMLDivElement>) => {
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
                endY.value = startY.value = 0;
            } else {
                endY.value = startY.value = 0;
                if (Math.abs(diff) < 5) player.current?.play();
            }
        } else {
            endY.value = startY.value = 0;
            app.isPhaseAnswer.value = true;
            player.current?.play();
        }
    };
    const handleClick = () => {
        if (!app.isPhaseAnswer.value) app.isPhaseAnswer.value = true;
        player.current?.play();
    }
    return <Dialog title="学习" onBackClick={finish}>
        <div class={`relative h-full flex flex-col outline-none`} tabIndex={-1} onKeyUp={handleKeyPress}
            style={{ top: `${endY.value - startY.value}px` }}>
            <div class="p-2 flex gap-2 text-lg">
                <SButton disabled={!app.isPhaseAnswer.value} onClick={() => handleIKnown().then(studyNext)} title="X/N">&#9989;</SButton>
                <SButton disabled={!app.isPhaseAnswer.value} onClick={() => handleIKnown(0).then(studyNext)} title="Z/M">&#10062;</SButton>
                <SButton disabled={!app.isPhaseAnswer.value} onClick={() => player.current?.play()}>&#128266;</SButton>
                <div class="grow text-center">{app.sprint.value > 0 ? app.sprint.value : ''}</div>
                <SButton disabled={!app.isPhaseAnswer.value} onClick={() => handleIKnown(13).then(studyNext)}>&#127775;</SButton>
                <SButton disabled={!app.isPhaseAnswer.value} onClick={handleReportIssue}>&#10071;</SButton>
                <SButton disabled={!app.isPhaseAnswer.value} onClick={handleRefresh}>
                    <IconRefresh class="w-5 h-5 fill-slate-400 stroke-slate-600 stoke-2"/></SButton>
                <div>{app.citem.value.level}</div>
            </div>
            <div class="grow px-2 flex flex-col" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} onClick={handleClick}>
                <div class="pb-2 flex gap-2 flex-wrap justify-between text-4xl font-bold">
                    {(console.log(app.citem.value), app.citem.value.word)}
                </div>
                {app.isPhaseAnswer.value && <div class="grow h-0 overflow-y-auto [scrollbar-width:none]">
                    <Tab className="grow" cindex={cindex} titles={app.citem.value.cards?.map((_: any, i: number)=>`${i}`)}>
                        <Scard card={app.citem.value.cards!.at(0)}/>
                    </Tab>
                    <audio ref={player} src={app.citem.value.cards?.at(cindex.value)?.sound?
                        `${API_URL}/sound?q=${encodeURIComponent(app.citem.value.cards[cindex.value].sound)}`:''} />
                </div>}
            </div>
        </div>
        
    </Dialog>;
}
