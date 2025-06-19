// deno-lint-ignore-file
import { useEffect } from 'preact/hooks';
import { useSignal } from "@preact/signals";
import type { ICard, IDict } from "../../memword-server/lib/idict.ts";
import type { IIssue } from "../../memword-server/lib/iissue.ts";
import * as mem from '../lib/mem.ts';
import TextInput from "../components/input-text.tsx";
import Button from "../components/button-ripple.tsx";
import Tab from "../components/tab.tsx";
import Ecard from "./ecard.tsx";
import List from '../components/list.tsx';

export default function Lookup() {
    const vocabulary = useSignal<Array<string>>([]);
    const tips = useSignal('');
    const hideTips = () => tips.value = '';
    const showTips = (content: string, autohide = true) =>
        (tips.value = content, autohide && setTimeout(hideTips, 3000));

    const ignoreWords = useSignal('');
    const handleUploadIgnoreWordsClick = async () => {
        const result = await mem.postVocabulary(ignoreWords.value);
        showTips(result ? '上传成功' : '上传失败');
    }

    const word = useSignal('');
    const currentWord = useSignal('_')
    const currentCardIndex = useSignal(0);
    const cards = useSignal<Array<ICard>>([]);
    const handleSearchClick = async () => {
        const w = encodeURIComponent(word.value);
        window.open(`https://www.merriam-webster.com/dictionary/${w}`, 'merriam-webster');
        window.open(`https://www.oxfordlearnersdictionaries.com/us/definition/english/${w}`, 'oxfordlearnersdictionaries');
        const dict = await mem.getDict(word.value);
        if (!dict) return showTips('Not Found');
        currentWord.value = dict.word;
        currentCardIndex.value = 0;
        cards.value = dict?.cards ?? [];
    };
    const handleAddCardClick = () => {
        cards.value = [...cards.value, {}];
    };
    const handleDeleteCardClick = () => {
        if (cards.value.length > 1) cards.value = cards.value.toSpliced(currentCardIndex.value, 1);
    }
    const handleUpdateClick = async () => {
        const dict: IDict = { word: word.value, cards: cards.value };
        showTips((await mem.putDict(dict)) ? `success update word "${word.value}"!` : 'Error');
    };
    const handleDeleteClick = async () => {
        showTips((await mem.deleteDict(word.value)) ? `success delete word "${word.value}"!` : 'Error')
    };

    const currentIssueIndex = useSignal(0);
    const issues = useSignal<Array<IIssue>>([]);
    const handleLoadIssueClick = async () => {
        const is = await mem.getServerIssues();
        if (is) issues.value = is;
        handleIssueClick();
    }
    const handleIssueClick = () => {
        if (issues.value.length) {
            const issue = issues.value[currentIssueIndex.value];
            word.value = issue.issue;
            handleSearchClick();
        }
    }
    const handleProcessIssueClick = async () => {
        const issue = issues.value[currentIssueIndex.value];
        const result = await mem.deleteServerIssue(issue._id) as any;
        if (result.acknowledged && result.deletedCount > 0) {
            issues.value = [
                ...issues.value.slice(0, currentIssueIndex.value),
                ...issues.value.slice(currentIssueIndex.value + 1)
            ];
            if (currentIssueIndex.value >= issues.value.length)
                currentIssueIndex.value = issues.value.length - 1;
            handleIssueClick();
            showTips('处理成功!');
        } else showTips("处理失败");
    }

    const init = async () => {
        const v = await mem.getVocabulary();
        if (v) vocabulary.value = v;
        await mem.getUser();
        await handleLoadIssueClick();
    }
    useEffect(() => { init() }, []);
    return <>
        <div class="text-center bg-[var(--bg-title)] p-1">{tips.value || "系统管理ˈʒɑɜæəɪʌʊʃˌ"}</div>
        <div class="body grow flex flex-col gap-2 p-2">
            <div class="h-4 grow-4 flex flex-col gap-2">
                <div class="flex gap-2">
                    <TextInput name="word" placeholder="word" class="grow"
                        binding={word} options={vocabulary.value} onChange={handleSearchClick} />
                    <Button class="button btn-normal"
                        disabled={!word.value} onClick={handleSearchClick}>Search</Button>
                </div>
                <div class="flex flex-col grow"><Tab class="bg-[var(--bg-tab)]" cindex={currentCardIndex}>
                    {cards.value.map((card) => <Ecard key={card} card={card} />)}
                </Tab></div>
                <div class="flex justify-between gap-2">
                    <Button class="grow button btn-normal"
                        disabled={word.value!=currentWord.value} onClick={handleAddCardClick}>增卡</Button>
                    <Button class="grow button btn-normal"
                        disabled={(word.value!=currentWord.value) || cards.value.length <= 1} onClick={handleDeleteCardClick}>删卡</Button>
                    <Button class="grow button btn-normal"
                        disabled={word.value!=currentWord.value} onClick={handleDeleteClick}>删除</Button>
                    <Button class="grow button btn-normal"
                        disabled={word.value!=currentWord.value} onClick={handleUpdateClick}>更新</Button>
                </div>
            </div>
            <div class="h-1 grow flex gap-2">
                <div class="w-1 grow flex flex-col gap-2">
                    <textarea class="grow" value={ignoreWords} onChange={e => ignoreWords.value = e.currentTarget.value} />
                    <div class="flex justify-end">
                        <Button class="w-24 button btn-normal" onClick={handleUploadIgnoreWordsClick}>拼写忽略</Button>
                    </div>
                </div>
                <div class="w-1 grow flex flex-col gap-2">
                    <div class="grow border">
                        <List class="px-2" cindex={currentIssueIndex}
                            activeClass="bg-[var(--bg-title)]"
                            options={issues.value.map(is => `${is.reporter}: ${is.issue}`)}
                            onClick={handleIssueClick} />
                    </div>
                    <div class="flex justify-end gap-2">
                        <Button class="w-24 button btn-normal" onClick={handleLoadIssueClick}>加载问题</Button>
                        <Button class="w-24 button btn-normal" onClick={handleProcessIssueClick}>处理问题</Button>
                    </div>
                </div>
            </div>
        </div>
    </>;
}
