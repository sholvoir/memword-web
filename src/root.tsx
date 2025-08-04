// deno-lint-ignore-file
import { // @ts-types="solid-js"
type Component, createEffect } from "solid-js";
import { Dynamic } from "solid-js/web";
import * as app from "./app.tsx";
import * as mem from "../lib/mem.ts";
import Home from "./home.tsx";
import Help from './help.tsx';
import About from './about.tsx';
import Issue from './issue.tsx';
import Setting from './setting.tsx';
import Dict from './search.tsx';
import Study from './study.tsx';
import Signup from './signup.tsx';
import Signin from './signin.tsx';
import Book from './book.tsx';

export default () => {
    const dialogs = new Map<app.TDial, Component>();
    dialogs.set('#home', Home);
    dialogs.set('#help', Help);
    dialogs.set('#about', About);
    dialogs.set('#issue', Issue);
    dialogs.set('#setting', Setting );
    dialogs.set('#search', Dict);
    dialogs.set('#study', Study);
    dialogs.set('#signup', Signup);
    dialogs.set('#signin', Signin);
    dialogs.set('#book', Book);

    const init = async () => {
        if (app.user[1]((await mem.getUser()) ?? '')) {
            app.go('#home');
            await mem.initSetting();
            await app.totalStats();
            (async () => {
                await mem.getServerBooks();
                app.vocabulary[1]((await mem.getVocabulary())??[]);
                await mem.syncSetting();
                await mem.syncTasks();
                await app.totalStats();
                // for (const item of await idb.getPredict(3600, 500)) {
                //     await mem.itemUpdateDict(item);
                //     await wait(300);
                // }
            })();
        } else app.go('#about');
    };

    createEffect(() => { init() });
    return <Dynamic component={dialogs.get(app.loca[0]())}></Dynamic> ;
}