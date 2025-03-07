// deno-lint-ignore-file no-explicit-any
import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { IIssue } from "../../memword-server/lib/iissue.ts";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import Button from '../components/button-ripple.tsx';
import List from '../components/list.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const cindex = useSignal(0);
    const issues = useSignal<Array<IIssue>>([]);
    const handleSubmitClick = async () => {
        const issue = issues.value[cindex.value];
        const result = await mem.deleteServerIssue(issue._id) as any;
        if (result.acknowledged) issues.value = [
            ...issues.value.slice(0, cindex.value),
            ...issues.value.slice(cindex.value + 1)
        ];
        app.showTips(result.acknowledged ? '处理成功!' : "处理失败");
        app.go();
    }
    useEffect(() => { mem.getServerIssues().then(is => is && (issues.value = is)) }, []);
    return <Dialog class="p-2 flex flex-col" title="处理问题"
        onBackClick={()=>app.go()}>
        <div class="grow border p-2">
            <List cindex={cindex} activeClass="bg-[var(--bg-title)]"
                options={issues.value.map(is => `${is.reporter}: ${is.issue}`)}/>
        </div>
        <div class="flex gap-2 mt-2 pb-4 justify-end">
            <Button class="w-24 button btn-normal" onClick={()=>app.go()}>取消</Button>
            <Button class="w-24 button btn-prime" onClick={handleSubmitClick}>处理</Button>
        </div>
    </Dialog>
}