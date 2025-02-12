import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Options } from "../lib/options.ts";
import { addTasks } from "../lib/mem.ts";
import { closeDialog, showDialog, totalStats } from "../lib/app.ts";
import Dialog from './dialog.tsx';
import Select from './select-single.tsx';
import Button from './button-ripple.tsx';

export default () => {
    const search = signal('');
    const wlid = signal('');
    const wordLists = signal<Options>([]);
    const handleOkClick = async () => {
        closeDialog();
        showDialog('wait');
        await addTasks(wlid.peek());
        await totalStats();
        closeDialog();
    }
    const init = async () => {}; //todo: load system wlids.
    useEffect(() => {init()}, []);
    return <Dialog title="添加任务">
        <div className="p-2 h-full flex flex-col gap-2">
            <input value={search.value} onChange={(e)=>search.value=e.currentTarget.value}/>
            <Select className="shrink select" title="让我们选择一本词书开始学习吧"
                binding={wlid} options={wordLists.value}/>
            <div className="flex gap-2 pb-2 justify-end">
                <Button className="button btn-normal w-32" onClick={closeDialog}>取消</Button>
                <Button className="button btn-prime w-32" onClick={handleOkClick}>确定</Button>
            </div>
        </div>
    </Dialog>;
}