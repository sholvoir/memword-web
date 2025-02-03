import type { Options } from "../lib/options.ts";
import { useEffect } from "react";
import { useSignal } from "@preact/signals-react";
import { getSetting, setSetting } from "../lib/mem.ts";
import { closeDialog, showTips } from "../lib/signals.ts";
import { ISetting, settingFormat } from "../lib/isetting.ts";
import { now } from "../lib/common.ts";
import Button from './button-ripple.tsx';
import MSelect from './select-multi.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const books = useSignal<Array<string>>([]);
    const handleOKClick = () => {
        setSetting({format: settingFormat, version: now(), books: books.value});
        closeDialog();
    }
    const options: Options = [];
    const init = async () => {
        const res = await getSetting();
        if (!res.ok) return showTips('ServiceWorker Error!');
        const setting: ISetting = await res.json();
        books.value = setting.books;
    }
    useEffect(() => {init()}, []);
    return <Dialog title="设置">
        <div className="p-2 h-full flex flex-col gap-2">
            <MSelect className="shrink grow select" binding={books} options={options} title="选择您关注的词书"/>
            <div className="flex justify-end gap-2 pb-2">
                <Button className="w-32 button btn-normal" onClick={closeDialog}>取消</Button>
                <Button className="w-32 button btn-prime" onClick={handleOKClick}>确定</Button>
            </div>
        </div>
    </Dialog>
}