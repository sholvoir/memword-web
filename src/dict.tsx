import { signal } from "@preact/signals";
import * as app from "../lib/app.ts";
import * as mem from "../lib/mem.ts";
import TInput from './input-text.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const word = signal('');
    const handleSearchClick = async () => {
        const text = word.peek().trim();
        if (!text) return;
        const item = await mem.search(text);
        if (!item) return app.showTips('Not Found!');
        app.citem.value = item;
        app.isPhaseAnswer.value = true;
        app.sprint.value = -1;
        app.showDialog('study');
    }
    return <Dialog title="词典">
        <TInput autoCapitalize="none" type="search" name="word" placeholder="word" className="m-2 w-[calc(100%-16px)]"
            binding={word} onChange={handleSearchClick} options={app.vocabulary.value}/>
    </Dialog>;
}