// deno-lint-ignore-file
import type { JSX } from "preact";
import { useEffect } from "preact/hooks";
import { wait } from "@sholvoir/generic/wait";
import * as app from "./app.tsx";
import * as mem from "../lib/mem.ts";
import * as idb from "../lib/indexdb.ts";
import Home from "./home.tsx";
import Help from './help.tsx';
import About from './about.tsx';
import Issue from './issue.tsx';
import Setting from './setting.tsx';
import Dict from './search.tsx';
import Study from './study.tsx';
import Signup from './signup.tsx';
import Signin from './signin.tsx';
import WordLists from './wordlists.tsx';
import WordList from './wordlist.tsx';

export default () => {
    const dialogs = new Map<app.TDial, JSX.Element>();
    dialogs.set('#home', <Home />);
    dialogs.set('#help', <Help />);
    dialogs.set('#about', <About />);
    dialogs.set('#issue', <Issue />);
    dialogs.set('#setting', <Setting  />);
    dialogs.set('#search', <Dict />);
    dialogs.set('#study', <Study />);
    dialogs.set('#signup', <Signup />);
    dialogs.set('#signin', <Signin />);
    dialogs.set('#wordlists', <WordLists />);
    dialogs.set('#wordlist', <WordList />);

    const init = async () => {
        if (app.user.value = (await mem.getUser()) ?? '') {
            app.go('#home');
            await mem.initSetting();
            await app.totalStats();
            const v = await mem.getVocabulary();
            if (v) app.vocabulary.value = v;
            (async () => {
                mem.getServerWordlist();
                await mem.syncSetting();
                await mem.syncTasks();
                await app.totalStats();
                for (const item of await idb.getPredict(3600, 500)) {
                    await mem.itemUpdateDict(item);
                    await wait(300);
                }
            })();
        } else app.go('#about');
    };

    useEffect(() => { init() }, []);
    return dialogs.get(app.loca.value);
}