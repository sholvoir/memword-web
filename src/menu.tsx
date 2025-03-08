import { JSX } from "preact";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import './menu.css'
import Dialog from './dialog.tsx';

export default () => {
    const open = (e: JSX.TargetedMouseEvent<HTMLMenuElement>) => {
        e.stopPropagation()
        app.go(e.currentTarget.title as app.TDial);
    }
    const down = async (e: JSX.TargetedMouseEvent<HTMLMenuElement>) => {
        e.stopPropagation();
        await mem.downTasks();
        await app.totalStats();
        app.go();
    }
    const handleSignoutClick = () => {
        app.user.value = '';
        app.go('#about');
        mem.signout();
    };
    return <Dialog class="menu p-2 flex flex-col gap-1"
        title="菜单" onBackClick={() => app.go()}>
        {app.isAdmin() && <>
            <menu title="#lookup" onClick={open}>辞典编辑</menu>
            <div />
            <menu title="#ignore" onClick={open}>拼写忽略</menu>
            <div />
            <menu title="#issues" onClick={open}>处理问题</menu>
            <div />
        </>}
        <menu title="#issue" onClick={open}>报告问题</menu>
        <div />
        <menu onClick={down}>完全同步</menu>
        <div />
        <menu title="#wordlists" onClick={open}>我的词书</menu>
        <div />
        <menu title="#setting" onClick={open}>设置</menu>
        <div />
        <menu title="#about" onClick={open}>关于</menu>
        <div />
        <menu title="#help" onClick={open}>帮助</menu>
        <div />
        <menu onClick={handleSignoutClick}>登出</menu>
    </Dialog>
}