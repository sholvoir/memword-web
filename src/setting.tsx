import type { Options } from "../lib/options.ts";
import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import { settingFormat } from "../../memword-server/lib/isetting.ts";
import { now } from "../../memword-server/lib/common.ts";
import Dialog from './dialog.tsx';
import Button from './button-ripple.tsx';
import MSelect from './select-multi.tsx';

export default () => {
    const books = useSignal<Array<string>>([]);
    const handleOKClick = () => {
        mem.setSetting({format: settingFormat, version: now(), books: books.value});
        app.go();
    }
    const options: Options = [];
    const init = async () => {
        const setting = await mem.getSetting();
        if (!setting) return app.showTips('ServiceWorker Error!');
        books.value = setting.books;
    }
    useEffect(() => {init()}, []);
    return <Dialog title="设置">
        <div class="p-2 h-full flex flex-col gap-2">
            <MSelect class="shrink grow select" binding={books} options={options} title="选择您关注的词书"/>
            <div class="flex justify-end gap-2 pb-2">
                <Button class="w-32 button btn-normal" onClick={()=>app.go()}>取消</Button>
                <Button class="w-32 button btn-prime" onClick={handleOKClick}>确定</Button>
            </div>
        </div>
    </Dialog>
}