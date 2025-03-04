import { ICard, IDict } from "../../memword-server/lib/idict.ts";
import { useSignal } from "@preact/signals";
import * as mem from '../lib/mem.ts';
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import TextInput from "../components/input-text.tsx";
import Button from "../components/button-ripple.tsx";
import Tab from "../components/tab.tsx";
import Ecard from "./ecard.tsx";

export default function Lookup() {
    const word = useSignal('');
    const cindex = useSignal(0);
    const cards = useSignal<Array<ICard>>([]);
    const handleSearchClick = async () => {
        const dict = await mem.getDict(word.value);
        if (!dict) return app.showTips(`Error`);
        cindex.value = 0;
        cards.value = dict.cards ?? [];
    };
    const handleAddCardClick = () => {
        cards.value = [...cards.value, {}];
    };
    const handleDeleteCardClick = () => {
        if (cards.value.length > 1) cards.value = cards.value.toSpliced(cindex.value, 1);
    }
    const handleUpdateClick = async () => {
        const dict: IDict = {word: word.value, cards: cards.value};
        app.showTips((await mem.putDict(dict)) ? `success update word "${word.value}"!` : `Error`);
    };
    const handleDeleteClick = async () => {
        app.showTips((await mem.deleteDict(word.value)) ? `success delete word "${word.value}"!` : `Error`)
    };
    return <Dialog class="flex flex-col gap-2 p-2" title="辞典编辑æˌəˈɪ" onBackClick={()=>app.go()}>
        <div class="flex gap-2">
            <TextInput name="word" placeholder="word" class="grow"
                binding={word} options={app.vocabulary} onChange={handleSearchClick}/>
            <Button class="button btn-normal"
                disabled={!word.value} onClick={handleSearchClick}>Search</Button>
        </div>
        <div class="flex flex-col grow"><Tab class="bg-[var(--bg-tab)]" cindex={cindex}>
            {cards.value.map((card, i)=><Ecard key={`${word.value}${i}`} card={card} />)}
        </Tab></div>
        <div class="flex justify-between gap-2 pb-4">
            <Button class="grow button btn-normal"
                disabled = {!word.value} onClick={handleAddCardClick}>Add Card</Button>
            <Button class="grow button btn-normal"
                disabled = {!word.value || cards.value.length <= 1} onClick={handleDeleteCardClick}>Delete Card</Button>
            <Button class="grow button btn-normal"
                disabled = {!word.value} onClick={handleDeleteClick}>Delete</Button>
            <Button class="grow button btn-normal"
                disabled = {!word.value} onClick={handleUpdateClick}>Update</Button>
        </div>
    </Dialog>;
}
