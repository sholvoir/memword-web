// deno-lint-ignore-file no-explicit-any
/** biome-ignore-all lint/suspicious/noExplicitAny: <No> */

import { STATUS_CODE } from "@sholvoir/generic/http";
import { wait } from "@sholvoir/generic/wait";
import { type IBook, splitID } from "@sholvoir/memword-common/ibook";
import { createResource, createSignal, For, Show } from "solid-js";
import SButton from "../components/button-base.tsx";
import BButton from "../components/button-base.tsx";
import Tab from "../components/tab.tsx";
import type { DivTargeted } from "../components/targeted.ts";
import * as idb from "../lib/indexdb.ts";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";
import Scard from "./scard.tsx";

export default () => {
	const finish = async () => {
		app.go(app.sprint() < 0 ? "#search" : undefined);
		await app.totalStats();
		await mem.syncTasks();
		app.totalStats();
	};
	let mainDiv!: HTMLDivElement;
	const [cindex, setCIndex] = createSignal(0);
	const touchPos = { startY: 0, endY: 0, cScrollTop: 0, moveTop: 0, topMax: 0 };

	const [myBooks, setMyBooks] = createSignal<Array<IBook>>([]);
	const showAddToBookMenu = createSignal(false);
	let player!: HTMLAudioElement;
	const handleIKnown = async (level?: number) => {
		if (app.citem()) await idb.studied(app.citem()!.word, level);
	};
	const studyNext = async () => {
		if (app.sprint() < 0) return finish();
		app.setSprint((s) => s + 1);
		app.setCItem(undefined);
		app.setPhaseAnswer(false);
		const item = await mem.getEpisode(app.bid());
		if (!item) return finish();
		app.setCItem(item);
		setCIndex(0);
	};
	const continueMove = async (x: number) => {
		touchPos.moveTop += x;
		const diff = Math.abs(touchPos.moveTop);
		mainDiv.style.top = `${touchPos.moveTop}px`;
		if (diff < globalThis.innerHeight) {
			await wait(30);
			await continueMove(x);
		}
	};
	const handleRefresh = async () => {
		app.showTips("Get Server Data...", false);
		const item = await mem.updateDict(app.citem()!);
		app.hideTips();
		app.setCItem({ ...item });
	};
	const handleReportIssue = async () => {
		app.showTips("Submiting...", false);
		await mem.submitIssue(app.citem()!.word);
		app.showTips("Submit Success!");
	};
	const handleDelete = async () => {
		app.showTips(
			(await mem.deleteItem(app.citem()!.word)) ? "删除成功" : "删除失败",
		);
		await studyNext();
	};
	const handleKeyPress = (e: KeyboardEvent & DivTargeted) => {
		e.stopPropagation();
		if (e.ctrlKey || e.altKey) return;
		switch (e.key) {
			case " ":
				handleClick(e as any);
				break;
			case "N":
			case "X":
			case "n":
			case "x":
				if (app.isPhaseAnswer()) handleIKnown().then(studyNext);
				break;
			case "M":
			case "Z":
			case "m":
			case "z":
				if (app.isPhaseAnswer()) handleIKnown(0).then(studyNext);
				break;
		}
	};
	const handleTouchStart = (e: TouchEvent & DivTargeted) => {
		e.stopPropagation();
		e.preventDefault();
		if (!app.isPhaseAnswer()) return;
		const div = e.currentTarget;
		touchPos.endY = touchPos.startY = e.touches[0].clientY;
		touchPos.cScrollTop = e.currentTarget.scrollTop;
		touchPos.moveTop = 0;
		touchPos.topMax = div.scrollHeight - div.clientHeight;
	};
	const handleTouchMove = (e: TouchEvent & DivTargeted) => {
		e.stopPropagation();
		e.preventDefault();
		if (!app.isPhaseAnswer()) return;
		touchPos.endY = e.touches[0].clientY;
		const diff = touchPos.endY - touchPos.startY;
		const net = touchPos.cScrollTop - diff;
		const div = e.currentTarget;
		if (diff < 0) {
			if (net < touchPos.topMax) div.scrollTop = net;
			else {
				div.scrollTop = touchPos.topMax;
				touchPos.moveTop = touchPos.topMax - net;
			}
		} else {
			if (net > 0) div.scrollTop = net;
			else {
				div.scrollTop = 0;
				touchPos.moveTop = diff - touchPos.cScrollTop;
			}
		}
		mainDiv.style.top = `${touchPos.moveTop}px`;
	};
	const handleTouchCancel = (e: TouchEvent & DivTargeted) => {
		e.stopPropagation();
		e.preventDefault();
		if (!app.isPhaseAnswer()) return;
		touchPos.moveTop = 0;
		touchPos.cScrollTop = e.currentTarget.scrollTop;
		mainDiv.style.top = `${touchPos.moveTop}px`;
	};
	const handleTouchEnd = async (e: TouchEvent & DivTargeted) => {
		e.stopPropagation();
		e.preventDefault();
		const diff = touchPos.endY - touchPos.startY;
		if (!app.isPhaseAnswer() || diff < 5) handleClick();
		else if (Math.abs(touchPos.moveTop) >= globalThis.innerHeight / 6) {
			const down = touchPos.moveTop > 0;
			await handleIKnown(down ? 0 : undefined);
			await continueMove(down ? 60 : -60);
			await studyNext();
		}
		touchPos.moveTop = 0;
		mainDiv.style.top = `${touchPos.moveTop}px`;
	};
	const handleClick = (e?: MouseEvent & DivTargeted) => {
		e?.stopPropagation();
		if (showAddToBookMenu[0]()) return showAddToBookMenu[1](false);
		const cardsN = app.citem()?.entries?.length ?? 0;
		//if (cardsN === 0) return;
		if (!app.isPhaseAnswer()) {
			app.setPhaseAnswer(true);
			player.play();
		} else if (cardsN === 1) player.play();
		else if (cindex() < cardsN - 1) setCIndex((c) => c + 1);
		else setCIndex(0);
	};
	const handleAddToBook = async (book: IBook) => {
		showAddToBookMenu[1](false);
		const word = app.citem()!.word;
		const wordSet = (await mem.getBook(book.bid))?.content as Set<string>;
		if (wordSet?.has(word)) return app.showTips("已包含");
		const [_, bookName] = splitID(book.bid);
		const [status] = await mem.uploadBook(bookName, word);
		app.showTips(status === STATUS_CODE.OK ? "添加成功" : "添加失败");
		wordSet?.add(word);
		((await mem.getVocabulary()) as Set<string>).add(word);
	};
	createResource(async () => {
		setMyBooks(
			await idb.getBooks((book) => splitID(book.bid)[0] === app.user()),
		);
	});
	return (
		<Dialog
			left={
				<BButton
					class="text-[150%] icon-[material-symbols--chevron-left] align-bottom"
					onClick={finish}
				/>
			}
			onKeyUp={handleKeyPress}
			tabIndex={-1}
			class="flex flex-col p-2 outline-none"
			title={`学习${app.sprint() > 0 ? `(${app.sprint()})` : ""}`}
		>
			<Show when={app.citem()}>
				<div class="relative flex gap-4 text-[150%] justify-between items-end">
					<SButton
						onClick={() => handleIKnown().then(studyNext)}
						title="X/N"
						class="iconify icon-[material-symbols--check-circle] text-green-500"
						disabled={!app.isPhaseAnswer()}
					/>
					<SButton
						onClick={() => handleIKnown(0).then(studyNext)}
						title="Z/M"
						class="iconify icon-[mdi--cross-circle] text-fuchsia-500"
						disabled={!app.isPhaseAnswer()}
					/>
					<SButton
						onClick={() => handleIKnown(13).then(studyNext)}
						class="iconify icon-[material-symbols--family-star] text-yellow-500"
						disabled={!app.isPhaseAnswer()}
					/>
					<SButton
						onClick={handleDelete}
						class="iconify icon-[material-symbols--delete-outline] text-orange-500"
						disabled={!app.isPhaseAnswer()}
					/>
					<SButton
						onClick={() => player.play()}
						class="iconify icon-[material-symbols--volume-up] text-blue-500"
					/>
					<SButton
						onClick={handleReportIssue}
						class="iconify icon-[material-symbols--error] text-red-500"
						disabled={!app.isPhaseAnswer()}
					/>
					<SButton
						onClick={handleRefresh}
						class="iconify icon-[material-symbols--refresh] text-purple-500"
						disabled={!app.isPhaseAnswer()}
					/>
					<SButton
						onClick={() => showAddToBookMenu[1]((s) => !s)}
						class="iconify icon-[material-symbols--dictionary-outline] text-cyan-500"
						disabled={!app.isPhaseAnswer()}
					></SButton>
					<div class="text-lg">{app.citem()?.level}</div>
					<Show when={showAddToBookMenu[0]()}>
						<div class="menu absolute top-[100%] right-[36px] text-lg text-right bg-[var(--bg-body)] z-1">
							<For each={myBooks()}>
								{(wl) => (
									<>
										<div />
										<menu onClick={() => handleAddToBook(wl)}>
											{wl.disc ?? wl.bid}
										</menu>
									</>
								)}
							</For>
							{myBooks().length && <div />}
						</div>
					</Show>
				</div>
				<div
					class="relative grow h-0 pb-4 flex flex-col overflow-y-auto"
					ref={mainDiv}
					on:click={handleClick}
					on:touchstart={handleTouchStart}
					on:touchmove={handleTouchMove}
					on:touchend={handleTouchEnd}
					on:touchcancel={handleTouchCancel}
				>
					<div class="py-2 flex gap-2 flex-wrap justify-between">
						<div class="text-4xl font-bold">{app.citem()?.word}</div>
						{app.isPhaseAnswer() && (
							<div class="text-2xl flex items-center">
								{app.citem()?.entries?.[cindex()].phonetic}
							</div>
						)}
					</div>
					<Show when={app.isPhaseAnswer()}>
						<Show
							when={(app.citem()?.entries?.length ?? 0) > 1}
							fallback={
								<div class="grow">
									<Scard entry={app.citem()?.entries?.[0]!} />
								</div>
							}
						>
							<Tab class="bg-[var(--bg-tab)]" cindex={[cindex, setCIndex]}>
								<For each={app.citem()?.entries}>
									{(card) => (
										<div class="grow">
											<Scard entry={card} />
										</div>
									)}
								</For>
							</Tab>
						</Show>
					</Show>
					<audio
						ref={player}
						autoplay
						src={app.citem()?.entries?.at(cindex())?.sound ?? ""}
					/>
				</div>
			</Show>
		</Dialog>
	);
};
