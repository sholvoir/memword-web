import { useSignal } from "@preact/signals";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import TInput from './input-text.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const word = useSignal('');
    const handleSearchClick = async () => {
        const text = word.peek().trim();
        if (!text) return;
        const item = await mem.search(text);
        if (!item) return app.showTips('Not Found!');
        app.citem.value = item;
        app.isPhaseAnswer.value = true;
        app.sprint.value = -1;
        app.go('study');
    }
    return <Dialog title="词典" onBackClick={()=>app.go()}>
        <TInput autoCapitalize="none" type="search" name="word" placeholder="word" class="m-2 w-[calc(100%-16px)]"
            binding={word} onChange={handleSearchClick} options={app.vocabulary.value}/>
    </Dialog>;
}