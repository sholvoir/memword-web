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
import Lookup from './lookup.tsx';
import Dict from './search.tsx';
import Study from './study.tsx';
import Signup from './signup.tsx';
import Signin from './signin.tsx';
import Signout from './signout.tsx';
import SysWordList from './syswordlist.tsx';
import WordLists from './wordlists.tsx';
import WordList from './wordlist.tsx';

export default () => {
    const dialogs = new Map<app.TDial, JSX.Element>();
    dialogs.set('home', <Home />);
    dialogs.set("wait", <Waiting />);
    dialogs.set('help', <Help />);
    dialogs.set('about', <About />);
    dialogs.set('menu', <Menu />);
    dialogs.set('issue', <Issue />);
    dialogs.set('setting', <Setting  />);
    dialogs.set('add', <Add />);
    dialogs.set('lookup', <Lookup />);
    dialogs.set('search', <Dict />);
    dialogs.set('study', <Study />);
    dialogs.set('signup', <Signup />);
    dialogs.set('signin', <Signin />);
    dialogs.set('signout', <Signout />);
    dialogs.set('syswordlist', <SysWordList />);
    dialogs.set('wordlists', <WordLists />);
    dialogs.set('wordlist', <WordList />);

    useEffect(() => { app.init() }, []);
    return dialogs.get(app.dial.value);
}