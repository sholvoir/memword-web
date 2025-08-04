// deno-lint-ignore-file no-explicit-any
import { For, Show, createResource } from "solid-js";
import { splitID, type IBook } from "@sholvoir/memword-common/ibook";
import { STATUS_CODE } from "@sholvoir/generic/http";
import { createSignal } from "solid-js";
import { wait } from "@sholvoir/generic/wait";
import * as app from "./app.tsx";
import * as idb from "../lib/indexdb.ts";
import * as mem from '../lib/mem.ts';
import Tab from '../components/tab.tsx';
import SButton from '../components/button-base.tsx';
import Dialog from './dialog.tsx';
import Scard from './scard.tsx';
import { type DivTargeted } from "../components/targeted.ts";

export default () => {
    const finish = async () => {
        app.go(app.sprint[0]() < 0 ? '#search': undefined);
        await app.totalStats();
        await mem.syncTasks();
        app.totalStats();
    }
    let mainDiv!: HTMLDivElement;
    const cindex = createSignal(0);
    const touchPos = { startY: 0, endY: 0, cScrollTop: 0, moveTop: 0 }
    const mwls = createSignal<Array<IBook>>([]);
    const showAddToBookMenu = createSignal(false);
    let player!: HTMLAudioElement;
    const handleIKnown = async (level?: number) => {
        if (app.citem[0]()) await idb.studied(app.citem[0]()!.word, level);
    }
    const studyNext = async () => {
        if (app.sprint[0]() < 0) return finish();
        app.sprint[1](s=>s+1);
        app.citem[1](undefined);
        app.isPhaseAnswer[1](false);
        const item = await mem.getEpisode(app.bid[0]());
        if (!item) return finish();
        app.citem[1](item);
        cindex[1](0);
    };
    const continueMove = async (x: number, max: number) => {
        const diff = Math.abs(touchPos.moveTop += x);
        mainDiv.style.top = `${touchPos.moveTop}px`;
        if (diff < max) {
            await wait(30);
            await continueMove(x, max);
        };
    };
    const handleRefresh = async () => {
        app.showTips("Get Server Data...", false);
        const item = await mem.updateDict(app.citem[0]()!);
        app.hideTips();
        app.citem[1]({ ...item });
    };
    const handleReportIssue = async () => {
        app.showTips('Submiting...', false);
        await mem.submitIssue(app.citem[0]()!.word);
        app.showTips('Submit Success!')
    };
    const handleDelete = async () => {
        app.showTips((await mem.deleteItem(app.citem[0]()!.word)) ? '删除成功' : '删除失败');
        await studyNext();
    }
    const handleKeyPress = (e: KeyboardEvent & DivTargeted) => {
        e.stopPropagation()
        if (e.ctrlKey || e.altKey) return;
        switch (e.key) {
            case ' ': handleClick(e as any); break;
            case 'N': case 'X': case 'n': case 'x': if (app.isPhaseAnswer[0]()) handleIKnown().then(studyNext); break;
            case 'M': case 'Z': case 'm': case 'z': if (app.isPhaseAnswer[0]()) handleIKnown(0).then(studyNext); break;
        }
    };
    const handleTouchStart = (e: TouchEvent & DivTargeted) => {
        if (e.stopPropagation(), e.preventDefault(), !app.isPhaseAnswer[0]()) return;
        touchPos.endY = touchPos.startY = e.touches[0].clientY;
        touchPos.cScrollTop = e.currentTarget.scrollTop;
    }
    const handleTouchMove = (e: TouchEvent & DivTargeted) => {
        if (e.stopPropagation(), e.preventDefault(), !app.isPhaseAnswer[0]()) return;
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
        mainDiv.style.top = `${touchPos.moveTop}px`;
        console.log(div.scrollTop, touchPos.moveTop);
    }
    const handleTouchCancel = (e: TouchEvent & DivTargeted) => {
        if (e.stopPropagation(), e.preventDefault(), !app.isPhaseAnswer[0]()) return;
        touchPos.moveTop = 0;
        touchPos.cScrollTop = e.currentTarget.scrollTop;
        mainDiv.style.top = `${touchPos.moveTop}px`;
    }
    const handleTouchEnd = async (e: TouchEvent & DivTargeted) => {
        if (e.stopPropagation(), e.preventDefault(), !app.isPhaseAnswer[0]()) {
            touchPos.moveTop = 0;
            touchPos.cScrollTop = e.currentTarget.scrollTop;
            mainDiv.style.top = `${touchPos.moveTop}px`;
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
        mainDiv.style.top = `${touchPos.moveTop}px`;
    };
    const handleClick = (e?: MouseEvent & DivTargeted) => {
        e?.stopPropagation();
        if (showAddToBookMenu[0]()) return showAddToBookMenu[1](false);
        const cardsN = app.citem[0]()?.entries?.length ?? 0;
        if (cardsN === 0) return;
        if (!app.isPhaseAnswer[0]()) (app.isPhaseAnswer[1](true), player.play());
        else if (cardsN === 1) player.play();
        else if (cindex[0]() < cardsN - 1) cindex[1](c=>c+1);
        else cindex[1](0);
    }
    const handleAddToBook = async (book: IBook) => {
        showAddToBookMenu[1](false);
        const word = app.citem[0]()!.word;
        const wordSet = (await mem.getBook(book.bid))?.content as Set<string>;
        if (wordSet?.has(word)) return app.showTips("已包含");
        const [_, bookName] = splitID(book.bid);
        const [status] = await mem.uploadBook(bookName, word);
        app.showTips(status == STATUS_CODE.OK? "添加成功" : "添加失败");
        wordSet?.add(app.citem[0]()!.word);
    }
    createResource(async () => {
        mwls[1](await idb.getBooks(wl => wl.bid.startsWith(app.user[0]())));
    });
    return <Dialog onBackClick={finish} onKeyUp={handleKeyPress}
        tabIndex={-1} class="flex flex-col p-2 outline-none"
        title={`学习${app.sprint[0]() > 0 ? `(${app.sprint[0]()})` : ''}`}>
        <Show when={app.citem[0]()}>
            <div class="relative flex gap-4 text-[150%] justify-between items-end">
                <SButton onClick={() => handleIKnown().then(studyNext)} title="X/N"
                    class="iconify icon-[material-symbols--check-circle] text-green-500" />
                <SButton onClick={() => handleIKnown(0).then(studyNext)} title="Z/M"
                    class="iconify icon-[mdi--cross-circle] text-fuchsia-500" />
                <SButton onClick={() => handleIKnown(13).then(studyNext)}
                    class="iconify icon-[material-symbols--family-star] text-yellow-500" />
                <SButton onClick={handleDelete}
                    class="iconify icon-[material-symbols--delete-outline] text-orange-500" />
                <SButton onClick={() => player.play()}
                    class="iconify icon-[material-symbols--volume-up] text-blue-500" />
                <SButton onClick={handleReportIssue}
                    class="iconify icon-[material-symbols--error] text-red-500" />
                <SButton onClick={handleRefresh}
                    class="iconify icon-[material-symbols--refresh] text-purple-500" />
                <SButton onClick={()=>showAddToBookMenu[1](s=>!s)}
                    class="iconify icon-[material-symbols--dictionary-outline] text-cyan-500">
                </SButton>
                <div class="text-lg">{app.citem[0]()?.level}</div>
                <Show when={showAddToBookMenu[0]()}>
                    <div class="menu absolute top-[100%] right-[36px] text-lg text-right bg-[var(--bg-body)] z-1">
                        <For each={mwls[0]()}>{(wl) => <>
                            <div/>
                            <menu onClick={()=>handleAddToBook(wl)}>{wl.disc??wl.bid}</menu>
                        </>}</For>
                        {mwls[0]().length && <div/>}
                    </div>
                </Show>
            </div>
            <div class="relative grow h-0 pb-4 flex flex-col overflow-y-auto" ref={mainDiv}
                onClick={handleClick} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd} onTouchCancel={handleTouchCancel}>
                <div class="py-2 flex gap-2 flex-wrap justify-between">
                    <div class="text-4xl font-bold">{app.citem[0]()?.word}</div>
                    {app.isPhaseAnswer[0]() &&
                        <div class="text-2xl flex items-center">
                            {app.citem[0]()?.entries?.[cindex[0]()].phonetic}
                        </div>
                    }
                </div>
                <Show when={app.isPhaseAnswer[0]()}>
                    <Show when={(app.citem[0]()?.entries?.length ?? 0) > 1}
                        fallback={<div class="grow"><Scard entry={app.citem[0]()?.entries?.[0]!} /></div>}>
                        <Tab class="bg-[var(--bg-tab)]" cindex={cindex}>
                            <For each={app.citem[0]()?.entries}>{(card) =>
                                <Scard entry={card} />
                            }</For>
                        </Tab>
                    </Show>
                </Show>
                <audio ref={player} autoplay src={app.citem[0]()?.entries?.at(cindex[0]())?.sound??''} />
            </div>
        </Show>
    </Dialog>;
}
