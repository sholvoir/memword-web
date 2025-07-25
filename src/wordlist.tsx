import { useEffect } from 'preact/hooks';
import { useSignal } from "@preact/signals";
import { STATUS_CODE } from "@sholvoir/generic/http";
import { splitID } from "@sholvoir/memword-common/iwordlist";
import { getClientWordlist } from "../lib/wordlists.ts";
import * as mem from '../lib/mem.ts';
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import Button from "../components/button-ripple.tsx";
import SInput from "../components/input-simple.tsx";
import TaInput from "../components/input-textarea.tsx"
import Checkbox from '../components/checkbox.tsx'

export default () => {
    const name = useSignal('');
    const disc = useSignal('');
    const words = useSignal('');
    const replace = useSignal(false);
    const revision = useSignal('');
    const handleDownloadClick = async () => {
        const wlid = `${app.user.value}/${name}`;
        const clientWl = await getClientWordlist(wlid);
        if (!clientWl) return;
        words.value = Array.from(clientWl.wordSet).sort().join('\n');
    }
    const handleOKClick = async () => {
        name.value = name.value.replaceAll('/', '-');
        const [status, result] = await mem.postMyWordList(
            name.value, words.value, disc.value, replace.value ? '1': undefined
        );
        switch (status) {
            case STATUS_CODE.BadRequest: return app.showTips('Error: 无名称或无内容');
            case STATUS_CODE.NotAcceptable:
                revision.value = Object.entries(result as Record<string, string[]>)
                    .map(([key, value]) => `${key}: ${value.join(',')}`)
                    .join('\n');
                return app.showTips('未通过拼写检查');
            case STATUS_CODE.OK: {
                app.showTips('词书上传成功');
                app.go("#setting");
            }
        }
    }
    useEffect(()=>{
        if (app.wl.value) {
            name.value = splitID(app.wl.value.wlid)[1];
            if (app.wl.value.disc) disc.value = app.wl.value.disc;
        }
    }, [])
    return <Dialog class="flex flex-col p-2" title="上传我的词书">
        <label for="name">名称</label>
        <SInput name="name" binding={name} />
        <label for="disc" class="mt-2">描述</label>
        <SInput name="disc" binding={disc} />
        <label for='words' class="mt-2">词表</label>
        <TaInput name="words" class="grow" binding={words} />
        {revision.value.length ? <>
            <label for="replace" class="text-red-500 mt-2">请考虑用下面的词替换</label>
            <textarea name="replace" class="grow" value={revision} onChange={e=>revision.value=e.currentTarget.value} />
        </>:undefined}
        <div class="flex gap-2 my-2">
            <Checkbox binding={replace} label="Replace"/>
            <div class="grow"></div>
            <Button class="w-24 button btn-normal" onClick={()=>app.go("#setting")}>取消</Button>
            <Button class="w-24 button btn-normal" onClick={handleDownloadClick}>下载</Button>
            <Button class="w-24 button btn-prime" onClick={handleOKClick}>上传</Button>
        </div>
    </Dialog>
}