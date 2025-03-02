import { useSignal } from "@preact/signals";
import * as mem from '../lib/mem.ts';
import * as app from "./app.tsx";
import Button from "../components/button-ripple";
import Dialog from './dialog.tsx';

export default () => {
    const name = useSignal('');
    const disc = useSignal('');
    const words = useSignal('');
    const handleOKClick = async () => {
        const result = await mem.postSysWordList(name.value, words.value, disc.value);
        app.showTips(result ? '词书上传成功' : '词书上传失败');
    }
    return <Dialog title="系统词书" className="p-2" onBackClick={()=>app.go()}>
        <label for="name">名称</label>
        <input name="name" value={name} onChange={e=>name.value=e.currentTarget.value} />
        <label for='disc' class="mt-2">描述</label>
        <input name="disc" value={disc} onChange={e=>disc.value=e.currentTarget.value} />
        <label for='disc' class="mt-2">词表</label>
        <textarea class="grow" value={words} onChange={e=>words.value=e.currentTarget.value} />
        <div class="flex justify-end gap-2 mt-2">
            <Button class="w-32 button btn-normal" onClick={()=>app.go()}>取消</Button>
            <Button class="w-32 button btn-prime" onClick={handleOKClick}>上传</Button>
        </div>
    </Dialog>
}