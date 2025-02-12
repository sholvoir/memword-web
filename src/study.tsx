import { JSX } from "preact/jsx-runtime";
import { useRef } from "preact/hooks";
import { signal } from "@preact/signals";
import { wait } from "@sholvoir/generic/wait";
import { FaExclamationCircle, FaPlay, FaDotCircle, FaRedoAlt, FaRegCheckCircle, FaRegTimesCircle } from "@preact-icons/fa";
import * as app from "../lib/app.ts";
import * as mem from '../lib/mem.ts';
import SButton from './button-base.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const finish = () => {
        app.closeDialog();
        mem.syncTasks();
        app.totalStats();
    }
    if (!app.citem.value) return (app.closeDialog(), <div />);
    const startY = signal(0);
    const endY = signal(0);
    const player = useRef<HTMLAudioElement>(null);
    const handleIKnown = (level?: number) => mem.studied(app.citem.value!.word, level ?? app.citem.value!.level);
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
        const item = await mem.getUpdatedDict(app.citem.value!.word);
        app.hideTips();
        if (!item) return app.showTips(`Not Found ${app.citem.value!.word}`);
        app.citem.value = item;
    };
    const handleReportIssue = async () => {
        app.showTips('Submiting...', false);
        if (!(await mem.submitIssue(app.citem.value!.word)))
            app.showTips('Submit Failed!');
        else app.showTips('Submit Success!');
    };
    const handleKeyPress = (e: JSX.TargetedKeyboardEvent<HTMLDivElement>) => {
        if (e.ctrlKey || e.altKey) return;
        if (app.dialogs.value.slice(-1)[0] == 'study') switch (e.key) {
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
    const splite = (w: string) => {
        const [word, n] = w.split('_');
        return <div className="text-4xl font-bold">{word}<sup className="text-lg">{n}</sup></div>;
    }
    return <Dialog title="学习" onCancel={finish}>
        <div className={`relative h-full flex flex-col outline-none`} tabIndex={-1} onKeyUp={handleKeyPress}
            style={{ top: `${endY.value - startY.value}px` }}>
            <div className="p-2 flex gap-2 text-lg">
                <SButton disabled={!app.isPhaseAnswer.value} onClick={() => handleIKnown().then(studyNext)} title="X/N">
                    <FaRegCheckCircle className="bg-round-6" />
                </SButton>
                <SButton disabled={!app.isPhaseAnswer.value} onClick={() => handleIKnown(0).then(studyNext)} title="Z/M">
                    <FaRegTimesCircle className="bg-round-6" />
                </SButton>
                <SButton disabled={!app.isPhaseAnswer.value} onClick={() => player.current?.play()}>
                    <FaPlay className="bg-round-6" />
                </SButton>
                <div className="grow text-center">{app.sprint.value > 0 ? app.sprint.value : ''}</div>
                <SButton disabled={!app.isPhaseAnswer.value} onClick={() => handleIKnown(13).then(studyNext)}>
                    <FaDotCircle className="bg-round-6" />
                </SButton>
                <SButton disabled={!app.isPhaseAnswer.value} onClick={handleReportIssue}>
                    <FaExclamationCircle className="bg-round-6" />
                </SButton>
                <SButton disabled={!app.isPhaseAnswer.value} onClick={handleRefresh}>
                    <FaRedoAlt className="bg-round-6" />
                </SButton>
                <div>{app.citem.value.level}</div>
            </div>
            <div className="grow px-2 flex flex-col" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel} onClick={handleClick}>
                <div className="pb-2 flex gap-2 flex-wrap justify-between">
                    {splite(app.citem.value.word)}
                    {app.isPhaseAnswer.value && <div className="text-2xl flex items-center">{app.citem.value.phonetic}</div>}
                </div>
                {app.isPhaseAnswer.value && <div className="grow h-0 overflow-y-auto [scrollbar-width:none]">
                    {app.citem.value.trans?.split('\n').map((t: string) => <p className="text-2xl">{t}</p>)}
                    {app.citem.value.def?.split('\n').map((t: string) => t.startsWith(' ') ? <p className="text-lg">&ensp;&bull;{t}</p> : <p className="text-xl font-bold">{t}</p>)}
                </div>}
            </div>
        </div>
        <audio ref={player} src={app.citem.value?.sound} />
    </Dialog>;
}