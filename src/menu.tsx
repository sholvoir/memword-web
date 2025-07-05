import type { JSX } from "preact";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import './menu.css'

export default ({class: className}: JSX.HTMLAttributes<HTMLDivElement>) => {
    const open = (e: JSX.TargetedMouseEvent<HTMLMenuElement>) => {
        e.stopPropagation()
        app.showMainMenu.value = false;
        app.go(e.currentTarget.title as app.TDial);
    }
    const handleSignoutClick = () => {
        app.user.value = '';
        app.go('#about');
        mem.signout();
    };
    return <div class={`menu p-2 flex flex-col gap-1 ${className??''}`}>
        <menu title="#search" onClick={()=>{app.startStudy();app.showMainMenu.value = false;}}>学习</menu>
        <div />
        <menu title="#search" onClick={open}>辞典</menu>
        <div />
        <menu title="#issue" onClick={open}>报告问题</menu>
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
    </div>
}