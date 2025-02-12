import { JSX } from "preact/jsx-runtime";
import * as app from '../lib/app.ts';
import * as mem from "../lib/mem.ts";
import Dialog from './dialog.tsx';

export default () => {
    const open = (e: JSX.TargetedMouseEvent<HTMLMenuElement>) => app.showDialog(e.currentTarget.title as app.TDial);
    const down = async () => {
        await mem.downTasks();
        await app.totalStats();
        app.closeDialog();
    }
    return <Dialog title="菜单">
        <div className="p-2 [&>menu]:p-2 [&>menu]:cursor-pointer [&>div]:h-px [&>div]:bg-slate-500">
            <menu title="issue" onClick={open}>报告问题</menu>
            <div/>
            <menu title="add" onClick={open}>添加任务</menu>
            <div/>
            <menu onClick={down}>完全同步</menu>
            <div/>
            <menu title="setting" onClick={open}>设置</menu>
            <div/>
            <menu title="about" onClick={open}>关于</menu>
            <div/>
            <menu title="help" onClick={open}>帮助</menu>
            <div/>
            <menu title="logout" onClick={open}>登出</menu>
        </div>
    </Dialog>
}