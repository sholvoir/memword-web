import { useSignal } from "@preact/signals-react";
import { useEffect } from "react";
import { Options } from "../lib/options.ts";
import { addTasks } from "../lib/mem.ts";
import { closeDialog, showDialog, totalStats } from "../lib/signals.ts";
import { splitID } from "../lib/wordlist.ts";
import Dialog from './dialog.tsx';
import Select from './select-single.tsx';
import Button from './button-ripple.tsx';

export default () => {
    const search = useSignal('');
    const sTag = useSignal('');
    const wordLists = useSignal<Options>([]);
    const handleOkClick = async () => {
        closeDialog();
        showDialog('wait');
        const [user, name] = splitID(sTag.value)!
        await addTasks(user, name);
        await totalStats();
        closeDialog();
    }
    const init = async () => {};
    useEffect(() => {init()}, []);
    return <Dialog title="添加任务">
        <div className="p-2 h-full flex flex-col gap-2">
            <input value={search.value} onChange={(e)=>search.value=e.target.value}/>
            <Select className="shrink select" title="让我们选择一本词书开始学习吧"
                binding={sTag} options={wordLists.value}/>
            <div className="flex gap-2 pb-2 justify-end">
                <Button className="button btn-normal w-32" onClick={closeDialog}>取消</Button>
                <Button className="button btn-prime w-32" onClick={handleOkClick}>确定</Button>
            </div>
        </div>
    </Dialog>;
}