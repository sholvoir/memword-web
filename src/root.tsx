// deno-lint-ignore-file
import { JSX } from "preact";
import { useEffect } from "preact/hooks";
import * as app from "./app.tsx";
import Home from "./home.tsx";
import Waiting from './waiting.tsx';
import Help from './help.tsx';
import About from './about.tsx';
import Menu from './menu.tsx';
import Issue from './issue.tsx';
import Setting from './setting.tsx';
import Add from './add.tsx';
import Signup from './signup.tsx';
import Signin from './signin.tsx';
import Signout from './signout.tsx';
import Study from './study.tsx';
import Dict from './dict.tsx';

export default () => {
    const dialogs = new Map<app.TDial, JSX.Element>();
    dialogs.set('home', <Home />);
    dialogs.set("wait", <Waiting />);
    dialogs.set('help', <Help />);
    dialogs.set('about', <About />);
    dialogs.set('menu', <Menu />);
    dialogs.set('issue', <Issue />);
    dialogs.set('add', <Add />);
    dialogs.set('dict', <Dict />);
    dialogs.set('study', <Study />);
    dialogs.set('setting', <Setting  />);
    dialogs.set('signup', <Signup />);
    dialogs.set('signin', <Signin />);
    dialogs.set('signout', <Signout />);

    useEffect(() => { app.init() }, []);
    return dialogs.get(app.dial.value);
}