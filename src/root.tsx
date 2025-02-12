// deno-lint-ignore-file
import { JSX } from "preact";
import { useEffect } from "preact/hooks";
import * as app from "../lib/app.ts";
import Home from "./home.tsx";
import Add from './add.tsx';
import About from './about.tsx';
import Help from './help.tsx';
import Signin from './signin.tsx';
import Signout from './signout.tsx';
import Study from './study.tsx';
import Setting from './setting.tsx';
import Issue from './issue.tsx';
import Dict from './dict.tsx';
import Waiting from './waiting.tsx';
import Menu from './menu.tsx';

const dialog = new Map<app.TDial, JSX.Element>();
dialog.set('home', <Home/>);
dialog.set("wait", <Waiting/>);
dialog.set('add', <Add/>);
dialog.set('issue', <Issue/>);
dialog.set('study', <Study/>);
dialog.set('setting', <Setting/>);
dialog.set('signin', <Signin/>);
dialog.set('signout', <Signout/>);
dialog.set('about', <About/>);
dialog.set('help', <Help/>);
dialog.set('dict', <Dict/>);
dialog.set('menu', <Menu/>);

export default () => {
    useEffect(() => {app.init()}, []);
    return <div className="h-[100dvh]">
        {app.dialog.value ? dialog.get(app.dialog.value) : dialog.get('about')}
        {app.tips.value && <div className="tip" onClick={app.hideTips}>{app.tips.value}</div>}
    </div>;
}