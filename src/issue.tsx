import { signal } from "@preact/signals";
import { submitIssue } from '../lib/mem.ts';
import { closeDialog, showTips } from "../lib/app.ts";
import Button from './button-ripple.tsx';
import TAInput from './input-textarea.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const issue = signal('');
    const handleSubmitClick = async () => {
        if (!(await submitIssue(issue.value)))
            return showTips('网络错误，未提交成功!');
        showTips('提交成功!');
        closeDialog();
    }
    return <Dialog title="提交问题">
        <div className="p-2 h-full flex flex-col gap-2">
            <label>请在这里描述你的问题:</label>
            <TAInput name="issue" className="w-full grow" binding={issue}>{issue.value}</TAInput>
            <div className="flex gap-2 mt-2 pb-2 justify-end">
                <Button className="w-32 button btn-normal" onClick={closeDialog}>取消</Button>
                <Button className="w-32 button btn-prime" onClick={handleSubmitClick}>提交</Button>
            </div>
        </div>
    </Dialog>
}