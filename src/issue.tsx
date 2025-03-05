import { useSignal } from "@preact/signals";
import { submitIssue } from '../lib/mem.ts';
import Button from '../components/button-ripple.tsx';
import TAInput from '../components/input-textarea.tsx';
import Dialog from './dialog.tsx';
import * as app from "./app.tsx";

export default () => {
    const issue = useSignal('');
    const handleSubmitClick = async () => {
        await submitIssue(issue.value);
        app.showTips('提交成功!');
        app.go();
    }
    return <Dialog class="p-2 flex flex-col" title="提交问题"
        onBackClick={()=>app.go()}>
        <label>请在这里描述你的问题:</label>
        <TAInput name="issue" class="grow" binding={issue}>{issue.value}</TAInput>
        <div class="flex gap-2 mt-2 pb-4 justify-end">
            <Button class="w-24 button btn-normal" onClick={()=>app.go()}>取消</Button>
            <Button class="w-24 button btn-prime" onClick={handleSubmitClick}>提交</Button>
        </div>
    </Dialog>
}