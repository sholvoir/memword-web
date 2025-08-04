import { createSignal, createResource } from "solid-js";
import * as mem from "../lib/mem.ts";
import * as idb from "../lib/indexdb.ts";
import * as app from "./app.tsx";
import { settingFormat } from "@sholvoir/memword-common/isetting";
import { now } from "@sholvoir/memword-common/common";
import { compareWL, type IBook } from "@sholvoir/memword-common/ibook";
import Dialog from './dialog.tsx';
import Input from '../components/input-simple.tsx';
import Button from '../components/button-ripple.tsx';
import List from '../components/list.tsx';

export default () => {
    const myBooks = createSignal<Array<IBook>>([]);
    const myIndex = createSignal(0);
    const subBooks = createSignal<Array<IBook>>([]);
    const subIndex = createSignal(0);
    const books = createSignal<Array<IBook>>([]);
    const cindex = createSignal(0);
    const bookFilter = createSignal('^common');
    const handleNewBookClick = () => {
        app.book[1](undefined);
        app.go('#book');
    }
    const handleUpdateBookClick = () => {
        app.book[1](myBooks[0]()[myIndex[0]()]);
        app.go('#book');
    }
    const handleDeleteBookClick = async () => {
        const success = await mem.deleteBook(myBooks[0]()[myIndex[0]()].bid);
        app.showTips(success ? '删除成功': '删除失败');
        if (success) myBooks[1](myBooks[0]().filter((_, i) => i != myIndex[0]()));
    }
    const handleAddSubClick = () => {
        subBooks[1]([...subBooks[0](), books[0]()[cindex[0]()]]);
    }
    const handleDeleteSubClick = () => {
        subBooks[1]([...subBooks[0]().slice(0, subIndex[0]()),
        ...subBooks[0]().slice(subIndex[0]() + 1)]);
    }
    const handleAddTaskClick = async () => {
        app.showLoading[1](true);
        await mem.addTasks(subBooks[0]()[subIndex[0]()].bid);
        await app.totalStats();
        app.showLoading[1](false);
    }
    const handleOKClick = async () => {
        await mem.syncSetting({
            format: settingFormat,
            version: now(),
            books: subBooks[0]().map(wl => wl.bid)
        });
        await app.totalStats();
        app.go();
    }
    const handleSignoutClick = () => {
        app.user[1]('');
        app.go('#about');
        idb.clear();
    };
    createResource(bookFilter[0], async (filter) => {
        const regex = new RegExp(filter);
        books[1]((await idb.getBooks(wl => regex.test(wl.bid) ||
            (wl.disc && regex.test(wl.disc)))).sort(compareWL));
    });
    createResource(async () => {
        books[1]((await idb.getBooks(wl => wl.bid.startsWith('common'))).sort(compareWL));
        subBooks[1](await idb.getBooks(wl =>mem.setting.books.includes(wl.bid)));
        myBooks[1](await idb.getBooks(wl => wl.bid.startsWith(app.user[0]())));
    });
    return <Dialog class="p-2 gap-2 flex flex-col" title="设置">
        <fieldset class="border rounded shrink-0 overflow-y-auto px-2">
            <legend>我的词书</legend>
            <List cindex={myIndex} options={myBooks[0]().map(wl=>wl.disc??wl.bid)}
                class="px-2" activeClass="bg-[var(--bg-title)]"/>
        </fieldset>
        <div class="flex justify-between gap-2">
            <Button class="button btn-normal grow" name="new" onClick={handleNewBookClick}>新建</Button>
            <Button class="button btn-normal grow" name="delete" disabled={!myBooks[0]().length} onClick={handleDeleteBookClick}>删除</Button>
            <Button class="button btn-normal grow" name="update" disabled={!myBooks[0]().length} onClick={handleUpdateBookClick}>更新</Button>
        </div>
        <div class="flex gap-2">
            <label for="filter">设置过滤</label>
            <Input class="grow" name="filter" binding={bookFilter} />
        </div>
        <fieldset class="border rounded max-h-[70%] grow shrink overflow-y-auto px-2">
            <legend>可用的词书</legend>
            <List class="px-2" cindex={cindex}
                options={books[0]().map(wl => wl.disc ?? wl.bid)}
                activeClass="bg-[var(--bg-title)]" />
        </fieldset>
        <div class="flex justify-between gap-2">
            <Button class="button btn-normal grow"
                onClick={handleAddSubClick}>添加订阅</Button>
            <Button class="button btn-normal grow"
                onClick={handleDeleteSubClick}>删除订阅</Button>
        </div>
        <fieldset class="border rounded shrink-0 overflow-y-auto px-2">
            <legend>我订阅的词书</legend>
            <List class="px-2" cindex={subIndex}
                options={subBooks[0]().map(wl => wl.disc ?? wl.bid)}
                activeClass="bg-[var(--bg-title)]" />
        </fieldset>
        <div class="pb-3 flex justify-between gap-2">
            <Button class="button btn-normal grow" onClick={handleAddTaskClick}>添加任务</Button>
            <Button class="button btn-normal grow" onClick={() => app.go()}>取消</Button>
            <Button class="button btn-prime grow" onClick={handleOKClick}>保存</Button>
            <Button class="button btn-normal grow" onClick={handleSignoutClick}>登出</Button>
        </div>
    </Dialog>
}