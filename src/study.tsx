import { useRef } from "react";
import { useSignal } from "@preact/signals-react";
import { wait } from "@sholvoir/generic/wait";
import { closeDialog, hideTips, showTips, signals, totalStats } from "../lib/signals.ts";
import { IItem } from "../lib/iitem.ts";
import * as mem from '../lib/mem.ts';
import SButton from './button-base.tsx';
import { IoMdAlert } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import { TbCircleLetterF } from "react-icons/tb";
import { IoMdRefresh } from "react-icons/io";
import { FaRegCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import Dialog from './dialog.tsx';

export default () => {
    const finish = () => {
        closeDialog();
        mem.syncTasks();
        totalStats();
    }
    if (!signals.item.value) return (closeDialog(), <div/>);
    const startY = useSignal(0);
    const endY = useSignal(0);
    const player = useRef<HTMLAudioElement>(null);
    const handleIKnown = (level?: number) => mem.studied(signals.item.value!.word, level ?? signals.item.value!.level);
    const studyNext = async () => {
        if (++signals.sprint.value <= 0) return finish();
        const res = await mem.getEpisode(signals.wlid.value, signals.blevel.value);
        if (!res.ok) return (showTips('Network Error!'), finish());
        const item = (await res.json()).item;
        if (!item) return finish();
        signals.item.value = item;
        signals.isPhaseAnswer.value = false;
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
        showTips("Get Server Data...");
        const res = await mem.updateDict(signals.item.value!.word);
        hideTips();
        if (!res.ok) return showTips(`Not Found ${signals.item.value!.word}`);
        signals.item.value = await res.json() as IItem;
    };
    const handleReportIssue = async () => {
        showTips('Submiting...', false);
        const resp = await mem.submitIssue(signals.item.value!.word);
        if (!resp.ok) showTips(await resp.text());
        else showTips('Submit Success!');
    };
    const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.ctrlKey || event.altKey) return;
        if (signals.dialogs.value.slice(-1)[0] == 'study') switch (event.key) {
            case ' ': handleClick(); break;
            case 'N': case 'X': case 'n': case 'x': if (signals.isPhaseAnswer.value) handleIKnown().then(studyNext); break;
            case 'M': case 'Z': case 'm': case 'z': if (signals.isPhaseAnswer.value) handleIKnown(0).then(studyNext); break;
        }
    };
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => signals.isPhaseAnswer.value && (endY.value = startY.value = e.touches[0].clientY);
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => signals.isPhaseAnswer.value && (endY.value = e.touches[0].clientY);
    const handleTouchCancel = () => signals.isPhaseAnswer.value && (endY.value = startY.value = 0);
    const handleTouchEnd = async (e: React.TouchEvent<HTMLDivElement>) => {
        if (signals.isPhaseAnswer.value) {
            const h = (e.currentTarget as HTMLDivElement).scrollHeight + 60;
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
            signals.isPhaseAnswer.value = true;
            player.current?.play();
        }
    };
    const handleClick = () => {
        if (!signals.isPhaseAnswer.value) signals.isPhaseAnswer.value = true;
        player.current?.play();
    }
    const splite = (w: string) => {
        const [word, n] = w.split('_');
        return <div className="text-4xl font-bold">{word}<sup className="text-lg">{n}</sup></div>;
    }
    return <Dialog title="学习" onCancel={finish}>
        <div className={`relative h-full flex flex-col [outline:none]`} tabIndex={-1} onKeyUp={handleKeyPress}
            style={{top: `${endY.value - startY.value}px`}}>
            <div className="p-2 flex gap-2 text-lg">
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown().then(studyNext)} title="X/N">
                    <FaRegCheckCircle className="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown(0).then(studyNext)} title="Z/M">
                    <RxCrossCircled className="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>player.current?.play()}>
                    <FaPlay className="bg-round-6"/>
                </SButton>
                <div className="grow text-center">{signals.sprint.value > 0 ? signals.sprint.value : ''}</div>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={()=>handleIKnown(13).then(studyNext)}>
                    <TbCircleLetterF className="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleReportIssue}>
                    <IoMdAlert className="bg-round-6"/>
                </SButton>
                <SButton disabled={!signals.isPhaseAnswer.value} onClick={handleRefresh}>
                    <IoMdRefresh className="bg-round-6"/>
                </SButton>
                <div>{signals.item.value.level}</div>
            </div>
            <div className="grow px-2 flex flex-col" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} onClick={handleClick}>
                <div className="pb-2 flex gap-2 flex-wrap justify-between">
                    {splite(signals.item.value.word)}
                    {signals.isPhaseAnswer.value && <div className="text-2xl flex items-center">{signals.item.value.phonetic}</div>}
                </div>
                {signals.isPhaseAnswer.value && <div className="grow h-0 overflow-y-auto [scrollbar-width:none]">
                    {signals.item.value.trans?.split('\n').map((t: string) => <p className="text-2xl">{t}</p>)}
                    {signals.item.value.def?.split('\n').map((t: string) => t.startsWith(' ')?<p className="text-lg">&ensp;&bull;{t}</p>:<p className="text-xl font-bold">{t}</p>)}
                </div>}
            </div>
        </div>
        <audio ref={player} src={signals.item.value?.sound}/>
    </Dialog>;
}