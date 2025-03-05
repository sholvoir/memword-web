import { useSignal } from "@preact/signals";
import * as mem from '../lib/mem.ts';
import * as app from "./app.tsx";
import Button from "../components/button-ripple.tsx";
import Dialog from './dialog.tsx';

export default () => {
    const words = useSignal('');
    const handleOKClick = async () => {
        const result = await mem.postVocabulary(words.value);
        app.showTips(result ? '上传成功' : '上传失败');
    }
    return <Dialog class="flex flex-col p-2" title="拼写忽略" onBackClick={()=>app.go()}>
        <textarea class="grow" value={words} onChange={e=>words.value=e.currentTarget.value} />
        <div class="flex justify-end gap-2 my-2">
            <Button class="w-32 button btn-normal" onClick={()=>app.go()}>取消</Button>
            <Button class="w-32 button btn-prime" onClick={handleOKClick}>上传</Button>
        </div>
    </Dialog>
}