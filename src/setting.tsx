import type { Options } from "../lib/options.ts";
import { useEffect } from "preact/hooks";
import { signal } from "@preact/signals";
import { getSetting, setSetting } from "../lib/mem.ts";
import { closeDialog, showTips } from "../lib/app.ts";
import { settingFormat } from "../../memword-server/lib/isetting.ts";
import { now } from "../../memword-server/lib/common.ts";
import Button from './button-ripple.tsx';
import MSelect from './select-multi.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const books = signal<Array<string>>([]);
    const handleOKClick = () => {
        setSetting({format: settingFormat, version: now(), books: books.value});
        closeDialog();
    }
    const options: Options = [];
    const init = async () => {
        const setting = await getSetting();
        if (!setting) return showTips('ServiceWorker Error!');
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