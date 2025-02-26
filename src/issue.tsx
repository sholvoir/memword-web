import { useSignal } from "@preact/signals";
import { submitIssue } from '../lib/mem.ts';
import Button from '@sholvoir/components/button-ripple';
import TAInput from '@sholvoir/components/input-textarea';
import Dialog from './dialog.tsx';
import * as app from "./app.tsx";

export default () => {
    const issue = useSignal('');
    const handleSubmitClick = async () => {
        await submitIssue(issue.value);
        app.showTips('提交成功!');
        app.go();
    }
    return <Dialog title="提交问题">
        <div class="p-2 h-full flex flex-col gap-2">
            <label>请在这里描述你的问题:</label>
            <TAInput name="issue" class="w-full grow" binding={issue}>{issue.value}</TAInput>
            <div class="flex gap-2 mt-2 pb-2 justify-end">
                <Button class="w-32 button btn-normal" onClick={()=>app.go()}>取消</Button>
                <Button class="w-32 button btn-prime" onClick={handleSubmitClick}>提交</Button>
            </div>
        </div>
    </Dialog>
}