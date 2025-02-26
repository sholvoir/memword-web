import { useSignal } from "@preact/signals";
import * as mem from '../lib/mem.ts';
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import Button from "@sholvoir/components/button-ripple";
import { STATUS_CODE } from "@sholvoir/generic/http";

export default () => {
    const name = useSignal('');
    const disc = useSignal('');
    const words = useSignal('');
    const replace = useSignal('');
    const handleOKClick = async () => {
        const res = await mem.postMyWordList(name.value, words.value, disc.value);
        switch (res.status) {
            case STATUS_CODE.BadRequest: return app.showTips('Error: 无名称或无内容');
            case STATUS_CODE.NotAcceptable:
                replace.value = await res.text();
                return app.showTips('未通过拼写检查');
            case STATUS_CODE.OK: return app.showTips('词书上传成功');
        }
    }
    return <Dialog title="上传我的词书" className="p-2" onBackClick={()=>app.go()}>
        <label for="name">名称</label>
        <input name="name" value={name} onChange={e=>name.value=e.currentTarget.value} />
        <label for="disc" class="mt-2">描述</label>
        <input name="disc" value={disc} onChange={e=>disc.value=e.currentTarget.value} />
        <label for='words' class="mt-2">词表</label>
        <textarea name="words" class="grow" value={words} onChange={e=>words.value=e.currentTarget.value} />
        {replace.value.length ? <>
            <label for="replace" class="text-red-500 mt-2">请考虑用下面的词替换</label>
            <textarea name="replace" class="grow" value={replace} onChange={e=>replace.value=e.currentTarget.value} />
        </>:undefined}
        <div class="flex justify-end gap-2 mt-2">
            <Button class="w-32 button btn-normal" onClick={()=>app.go()}>取消</Button>
            <Button class="w-32 button btn-prime" onClick={handleOKClick}>上传</Button>
        </div>
    </Dialog>
}