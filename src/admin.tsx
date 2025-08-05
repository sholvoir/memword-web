// deno-lint-ignore-file
import { // @ts-types="solid-js"
createResource, createSignal, For, Show } from "solid-js";
import { version } from "../lib/common.ts";
import type { IEntry, IDict } from "@sholvoir/memword-common/idict";
import type { IIssue } from "@sholvoir/memword-common/iissue";
import * as srv from '../lib/server.ts';
import * as mem from '../lib/mem.ts';
import TextInput from "../components/input-text.tsx";
import Button from "../components/button-ripple.tsx";
import Ecard from "./ecard.tsx";
import List from '../components/list.tsx';

export default function Admin() {
    const auth = createSignal(false);
    const vocabulary = createSignal<Iterable<string>>([]);
    const tips = createSignal('');
    const hideTips = () => tips[1]('');
    const showTips = (content: string, autohide = true) =>
        (tips[1](content), autohide && setTimeout(hideTips, 3000));

    const ignoreWords = createSignal('');
    const handleUploadIgnoreWordsClick = async () => {
        const result = await srv.postVocabulary(ignoreWords[0]());
        showTips(result ? '上传成功' : '上传失败');
    }

    const word = createSignal('');
    const currentWord = createSignal('_')
    const currentCardIndex = createSignal(0);
    const entries = createSignal<Array<IEntry>>([]);
    const handleSearchClick = async () => {
        const w = encodeURIComponent(word[0]());
        window.open(`https://www.merriam-webster.com/dictionary/${w}`, 'merriam-webster');
        window.open(`https://www.oxfordlearnersdictionaries.com/us/search/english/?q=${w}`, 'oxfordlearnersdictionaries');
        const dict = await srv.getDict(word[0]());
        if (!dict) return showTips('Not Found');
        currentWord[1](dict.word);
        currentCardIndex[1](0);
        if (dict.entries) for (const entry of dict.entries)
            if (entry.meanings) for (const means of Object.values(entry.meanings))
                if (means) for (const mean of means)
                    if (!mean.trans) mean.trans = '';
        entries[1](dict.entries ?? []);
        window.focus();
    };
    const handleAddCardClick = async () => {
        const card = await srv.getDefinition(word[0]());
        if (card) {
            if (card.meanings) for (const means of Object.values(card.meanings))
                if (means) for (const m of means)
                    if (!m.trans) m.trans = '';
            entries[1]([...entries[0](), card]);
        }
    };
    const handleDeleteCardClick = () => {
        if (entries[0]().length > 1) entries[1](entries[0]().toSpliced(currentCardIndex[0](), 1));
        if (currentCardIndex[0]() >= entries[0]().length) currentCardIndex[1](entries[0]().length - 1);
    }
    const handleUpdateClick = async () => {
        const dict: IDict = { word: word[0](), entries: entries[0]() };
        showTips((await srv.putDict(dict)) ? `success update word "${word[0]()}"!` : 'Error');
    };
    const handleDeleteClick = async () => {
        showTips((await srv.deleteDict(word[0]())) ? `success delete word "${word[0]()}"!` : 'Error')
    };

    const currentIssueIndex = createSignal(0);
    const issues = createSignal<Array<IIssue>>([]);
    const handleLoadIssueClick = async () => {
        const is = await srv.getIssues();
        if (is) {
            issues[1](is);
            handleIssueClick();
        }
    }
    const handleIssueClick = () => {
        const issue = issues[0]()[currentIssueIndex[0]()];
        if (issue) {
            word[1](issue.issue);
            handleSearchClick();
        }
    }
    const handleProcessIssueClick = async () => {
        const issue = issues[0]()[currentIssueIndex[0]()];
        if (!issue) return;
        const result = await srv.deleteIssue(issue._id) as any;
        if (result.acknowledged && result.deletedCount > 0) {
            issues[1]([
                ...issues[0]().slice(0, currentIssueIndex[0]()),
                ...issues[0]().slice(currentIssueIndex[0]() + 1)
            ]);
            if (issues[0]().length && currentIssueIndex[0]() >= issues[0]().length)
                currentIssueIndex[1](issues[0]().length - 1);
            if (issues[0]().length) handleIssueClick();
            else {
                word[1]('');
                currentWord[1]('_');
                entries[1]([]);
                currentCardIndex[1](0);
                handleLoadIssueClick();
            }
            showTips('处理成功!');
        } else showTips("处理失败");
    }
    createResource(async () => {
        if (auth[1]('hua' === await mem.getUser())) {
            vocabulary[1]((await mem.getVocabulary()) ?? []);
            await handleLoadIssueClick();
        }
    });
    return <Show when={auth[0]()}>
        <div class={`text-center p-2 ${tips[0]()?'bg-[var(--bg-button-prime)]':'bg-[var(--bg-title)]'}`}>
            {tips[0]() || `系统管理-${currentCardIndex[0]()}-${version} ˈʒɔɑɜæəɪʌʊʃˌ`}
        </div>
        <div class="body grow flex flex-col gap-2 p-2">
            <div class="h-4 grow-4 flex flex-col gap-2">
                <div class="flex gap-2">
                    <TextInput name="word" placeholder="word" class="grow"
                        binding={word} options={vocabulary} onChange={handleSearchClick} />
                    <Button class="button btn-normal"
                        disabled={!word[0]()} onClick={handleSearchClick}>Search</Button>
                </div>
                <div class="grow flex gap-2"><For each={entries[0]()}>{(card, i) =>
                    <Ecard class="grow" word={word} entry={card} onClick={()=>currentCardIndex[1](i())}/>}
                </For></div>
                <div class="flex justify-between gap-2">
                    <Button class="grow button btn-normal"
                        disabled={word[0]()!=currentWord[0]()} onClick={handleAddCardClick}>增卡</Button>
                    <Button class="grow button btn-normal"
                        disabled={(word[0]()!=currentWord[0]()) || entries[0]().length <= 1} onClick={handleDeleteCardClick}>删卡</Button>
                    <Button class="grow button btn-normal"
                        disabled={word[0]()!=currentWord[0]()} onClick={handleDeleteClick}>删除</Button>
                    <Button class="grow button btn-normal"
                        disabled={word[0]()!=currentWord[0]()} onClick={handleUpdateClick}>更新</Button>
                </div>
            </div>
            <div class="flex gap-2">
                <div class="w-1 grow flex flex-col gap-2">
                    <textarea class="grow" value={ignoreWords[0]()} onChange={e => ignoreWords[1](e.currentTarget.value)} />
                    <div class="flex justify-end">
                        <Button class="button btn-normal" onClick={handleUploadIgnoreWordsClick}>拼写忽略</Button>
                    </div>
                </div>
                <div class="w-1 grow flex flex-col gap-2">
                    <div class="grow border overflow-y-auto">
                        <List class="px-2" cindex={currentIssueIndex}
                            activeClass="bg-[var(--bg-title)]"
                            options={issues[0]}
                            func={is => `${is.reporter}: ${is.issue}`}
                            onClick={handleIssueClick} />
                    </div>
                    <div class="flex justify-end gap-2">
                        <Button class="button btn-normal" onClick={handleLoadIssueClick}>加载问题</Button>
                        <Button class="button btn-normal" onClick={handleProcessIssueClick}>处理问题</Button>
                    </div>
                </div>
            </div>
        </div>
    </Show>
}
