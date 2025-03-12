import { useEffect } from 'preact/hooks';
import { useSignal } from "@preact/signals";
import { STATUS_CODE } from "@sholvoir/generic/http";
import * as mem from '../lib/mem.ts';
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import Button from "../components/button-ripple.tsx";
import SInput from "../components/input-simple.tsx";
import TaInput from "../components/input-textarea.tsx"
import { splitID } from "../../memword-server/lib/iwordlist.ts";

export default () => {
    const name = useSignal('');
    const disc = useSignal('');
    const words = useSignal('');
    const replace = useSignal('');
    const handleOKClick = async () => {
        name.value = name.value.replaceAll('/', '-');
        const [status, result] = await mem.postMyWordList(name.value, words.value, disc.value);
        switch (status) {
            case STATUS_CODE.BadRequest: return app.showTips('Error: 无名称或无内容');
            case STATUS_CODE.NotAcceptable:
                replace.value = Object.entries(result as Record<string, string[]>)
                    .map(([key, value]) => `${key}: ${value.join(',')}`)
                    .join('\n');
                return app.showTips('未通过拼写检查');
            case STATUS_CODE.OK: {
                app.showTips('词书上传成功');
                app.go();
            }
        }
    }
    useEffect(()=>{
        if (app.wl.value) {
            name.value = splitID(app.wl.value.wlid)[1];
            if (app.wl.value.disc) disc.value = app.wl.value.disc;
        }
    }, [])
    return <Dialog class="flex flex-col p-2" title="上传我的词书" onBackClick={()=>app.go()}>
        <label for="name">名称</label>
        <SInput name="name" binding={name} />
        <label for="disc" class="mt-2">描述</label>
        <SInput name="disc" binding={disc} />
        <label for='words' class="mt-2">词表</label>
        <TaInput name="words" class="grow" binding={words} />
        {replace.value.length ? <>
            <label for="replace" class="text-red-500 mt-2">请考虑用下面的词替换</label>
            <textarea name="replace" class="grow" value={replace} onChange={e=>replace.value=e.currentTarget.value} />
        </>:undefined}
        <div class="flex justify-end gap-2 my-2">
            <Button class="w-32 button btn-normal" onClick={()=>app.go()}>取消</Button>
            <Button class="w-32 button btn-prime" onClick={handleOKClick}>上传</Button>
        </div>
    </Dialog>
}