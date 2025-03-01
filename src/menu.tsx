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
    return <Dialog title="菜单" onBackClick={() => app.go()}>
        <div class="menu">
            {app.isAdmin() && <>
                <menu title="#lookup" onClick={open}>辞典编辑</menu>
                <div />
                <menu title="#syswordlist" onClick={open}>系统词书</menu>
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
            <menu title="#logout" onClick={open}>登出</menu>
        </div>
    </Dialog>
}