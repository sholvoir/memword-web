// deno-lint-ignore-file
/** biome-ignore-all lint/suspicious/noExplicitAny: No */

import type { IDict, IEntry } from "@sholvoir/memword-common/idict";
import type { IIssue } from "@sholvoir/memword-common/iissue";
import { createResource, createSignal, For, Show, type Signal } from "solid-js";
import Button from "../components/button-ripple.tsx";
import TextInput from "../components/input-text.tsx";
import List from "../components/list.tsx";
import { version } from "../lib/common.ts";
import * as mem from "../lib/mem.ts";
import * as srv from "../lib/server.ts";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";
import Ecard from "./ecard.tsx";

export default () => {
	const [hide, setHide] = createSignal(false);

	const [auth, setAuth] = createSignal(false);
	const [vocabulary, setVocabulary] = createSignal<Iterable<string>>([]);

	const hideTips = () => app.setTips("");
	const showTips = (content: string, autohide = true) => {
		app.setTips(content);
		autohide && setTimeout(hideTips, 3000);
	};

	const [ignoreWords, setIgnoreWords] = createSignal("");
	const handleUploadIgnoreWordsClick = async () => {
		const result = await srv.postVocabulary(ignoreWords());
		showTips(result ? "上传成功" : "上传失败");
	};

	const [word, setWord] = createSignal("");
	const [currentWord, setCurrentWord] = createSignal("_");
	const [currentCardIndex, setCurrentCardIndex] = createSignal(0);
	const [entries, setEntries] = createSignal<Array<Signal<IEntry>>>([]);
	const handleSearchClick = async () => {
		const w = encodeURIComponent(word());
		window.open(
			`https://www.merriam-webster.com/dictionary/${w}`,
			"merriam-webster",
		);
		window.open(
			`https://www.oxfordlearnersdictionaries.com/us/search/english/?q=${w}`,
			"oxfordlearnersdictionaries",
		);
		const dict = await srv.getDict(word());
		if (!dict) return showTips("Not Found");
		setCurrentWord(dict.word);
		setCurrentCardIndex(0);
		if (dict.entries)
			for (const entry of dict.entries)
				if (entry.meanings)
					for (const means of Object.values(entry.meanings))
						if (means)
							for (const mean of means) if (!mean.trans) mean.trans = "";
		setEntries((dict.entries ?? []).map((e) => createSignal(e)));
		window.focus();
	};
	const handleAddCardClick = async () => {
		const entry = await srv.getDefinition(word());
		if (entry) {
			if (entry.meanings)
				for (const means of Object.values(entry.meanings))
					if (means) for (const m of means) if (!m.trans) m.trans = "";
			setEntries([...entries(), createSignal(entry)]);
		}
	};
	const handleDeleteCardClick = () => {
		if (entries().length > 1)
			setEntries(entries().toSpliced(currentCardIndex(), 1));
		if (currentCardIndex() >= entries().length)
			setCurrentCardIndex(entries().length - 1);
	};
	const handleUpdateClick = async () => {
		const dict: IDict = { word: word(), entries: entries().map((e) => e[0]()) };
		showTips(
			(await srv.putDict(dict)) ? `success update word "${word()}"!` : "Error",
		);
	};
	const handleDeleteClick = async () => {
		showTips(
			(await srv.deleteDict(word()))
				? `success delete word "${word()}"!`
				: "Error",
		);
	};

	const [currentIssueIndex, setCurrentIssueIndex] = createSignal(0);
	const [issues, setIssues] = createSignal<Array<IIssue>>([]);

	const handleECClick = async () => {
		const resp = await srv.getEcdictAsIssue();
		if (resp.ok) {
			showTips("EC导入成功");
			await handleLoadIssueClick();
		} else showTips("EC导入失败");
	};

	const handleLoadIssueClick = async () => {
		const issues = await srv.getIssues();
		if (issues) {
			setIssues(issues);
			handleIssueClick();
		}
	};
	const handleIssueClick = () => {
		const issue = issues()[currentIssueIndex()];
		if (issue) {
			setWord(issue.issue);
			handleSearchClick();
		}
	};
	const handleProcessIssueClick = async () => {
		const issue = issues()[currentIssueIndex()];
		if (!issue) return;
		const result = (await srv.deleteIssue(issue._id)) as any;
		if (result.acknowledged && result.deletedCount > 0) {
			setIssues((issues) => issues.filter((_, i) => i !== currentIssueIndex()));
			if (issues().length && currentIssueIndex() >= issues().length)
				setCurrentIssueIndex(issues().length - 1);
			if (issues().length) handleIssueClick();
			else {
				setWord("");
				setCurrentWord("_");
				setEntries([]);
				setCurrentCardIndex(0);
				handleLoadIssueClick();
			}
			showTips("处理成功!");
		} else showTips("处理失败");
	};
	createResource(async () => {
		if (setAuth("hua" === (await mem.getUser()))) {
			setVocabulary((await mem.getVocabulary()) ?? []);
			await handleLoadIssueClick();
		}
	});
	return (
		<Show when={auth()}>
			<Dialog
				left={version}
				title={<span class="font-mono">系统管理&nbsp;ˈʒɔɑɜæəɪʌʊʃˌ</span>}
				right={`${currentCardIndex()}`}
				class="flex flex-col gap-2 p-2"
			>
				<div class="h-4 grow-4 flex flex-col gap-2">
					<div class="grow flex gap-2">
						<For each={entries()}>
							{(entry, i) => (
								<Ecard
									class="grow"
									word={word()}
									entry={entry}
									onClick={() => setCurrentCardIndex(i())}
								/>
							)}
						</For>
					</div>
					<div class="flex justify-between gap-2">
						<TextInput
							name="word"
							placeholder="word"
							class="grow"
							binding={[word, setWord]}
							options={vocabulary()}
							onChange={handleSearchClick}
						/>
						<Button
							class="button btn-normal"
							disabled={!word()}
							onClick={handleSearchClick}
						>
							Search
						</Button>
						<Button
							class="button btn-normal"
							disabled={word() !== currentWord()}
							onClick={handleAddCardClick}
						>
							增卡
						</Button>
						<Button
							class="button btn-normal"
							disabled={word() !== currentWord() || entries().length <= 1}
							onClick={handleDeleteCardClick}
						>
							删卡
						</Button>
						<Button
							class="button btn-normal"
							disabled={word() !== currentWord()}
							onClick={handleDeleteClick}
						>
							删除
						</Button>
						<Button
							class="button btn-normal"
							disabled={word() !== currentWord()}
							onClick={handleUpdateClick}
						>
							更新
						</Button>
						<Button
							class="button btn-normal"
							onClick={() => setHide((h) => !h)}
						>
							<span
								class={`text-[150%] align-bottom ${
									hide() ? "icon-[mdi--chevron-up]" : "icon-[mdi--chevron-down]"
								}`}
							/>
						</Button>
					</div>
				</div>
				<Show when={!hide()}>
					<div class="flex gap-2 max-h-48">
						<textarea
							class="w-1 grow"
							value={ignoreWords()}
							onChange={(e) => setIgnoreWords(e.currentTarget.value)}
						/>
						<Button
							class="button btn-normal leading-tight"
							onClick={handleUploadIgnoreWordsClick}
						>
							拼写
							<br />
							忽略
						</Button>
						<div class="w-1 grow border overflow-y-auto [scrollbar-width:none]">
							<List
								class="px-2"
								cindex={[currentIssueIndex, setCurrentIssueIndex]}
								activeClass="bg-[var(--bg-title)]"
								options={issues()}
								func={(issue) => `${issue.reporter}: ${issue.issue}`}
								onClick={handleIssueClick}
							/>
						</div>
						<Button class="button btn-normal" onClick={handleECClick}>
							EC
						</Button>
						<Button
							class="button btn-normal leading-tight"
							onClick={handleLoadIssueClick}
						>
							加载
							<br />
							问题
						</Button>
						<Button
							class="button btn-normal leading-tight"
							onClick={handleProcessIssueClick}
						>
							处理
							<br />
							问题
						</Button>
					</div>
				</Show>
			</Dialog>
		</Show>
	);
};
