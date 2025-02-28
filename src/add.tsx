import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { Options } from "@sholvoir/components/options";
import { addTasks } from "../lib/mem.ts";
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import Select from '@sholvoir/components/select-single';
import Button from '@sholvoir/components/button-ripple';

export default () => {
    const search = useSignal('');
    const wlid = useSignal('');
    const wordLists = useSignal<Options>([]);
    const handleOkClick = async () => {
        app.loading.value = true;
        await addTasks(wlid.peek());
        await app.totalStats();
        app.loading.value = false;
        app.go('#home');
    }
    const init = async () => {}; //todo: load system wlids.
    useEffect(() => {init()}, []);
    return <Dialog title="添加任务">
        <div class="p-2 h-full flex flex-col gap-2">
            <input value={search.value} onChange={(e)=>search.value=e.currentTarget.value}/>
            <fieldset>
                <legend>让我们选择一本词书开始学习吧"</legend>
                <Select binding={wlid} options={wordLists.value}/>
            </fieldset>
            <div class="flex gap-2 pb-2 justify-end">
                <Button class="button btn-normal w-32" onClick={()=>app.go('#home')}>取消</Button>
                <Button class="button btn-prime w-32" onClick={handleOkClick}>确定</Button>
            </div>
        </div>
    </Dialog>;
}