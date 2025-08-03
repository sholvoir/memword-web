import { useEffect } from "preact/hooks";
import { useSignal, useSignalEffect } from "@preact/signals";
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
    const myBooks = useSignal<Array<IBook>>([]);
    const myIndex = useSignal(0);
    const subBooks = useSignal<Array<IBook>>([]);
    const subIndex = useSignal(0);
    const books = useSignal<Array<IBook>>([]);
    const cindex = useSignal(0);
    const bookFilter = useSignal('^common');
    const handleNewBookClick = () => {
        app.book.value = undefined;
        app.go('#book');
    }
    const handleUpdateBookClick = () => {
        app.book.value = myBooks.value[myIndex.value];
        app.go('#book');
    }
    const handleDeleteBookClick = async () => {
        const success = await mem.deleteBook(myBooks.value[myIndex.value].bid);
        app.showTips(success ? '删除成功': '删除失败');
        if (success) myBooks.value = myBooks.value.filter((_, i) => i != myIndex.value);
    }
    const handleAddSubClick = () => {
        subBooks.value = [...subBooks.value, books.value[cindex.value]];
    }
    const handleDeleteSubClick = () => {
        subBooks.value = [...subBooks.value.slice(0, subIndex.value),
        ...subBooks.value.slice(subIndex.value + 1)];
    }
    const handleAddTaskClick = async () => {
        app.showLoading.value = true;
        await mem.addTasks(subBooks.value[subIndex.value].bid);
        await app.totalStats();
        app.showLoading.value = false;
    }
    const handleOKClick = async () => {
        await mem.syncSetting({
            format: settingFormat,
            version: now(),
            books: subBooks.value.map(wl => wl.bid)
        });
        await app.totalStats();
        app.go();
    }
    const handleSignoutClick = () => {
        app.user.value = '';
        app.go('#about');
        idb.clear();
    };
    const init = async () => {
        books.value = (await idb.getBooks(wl => wl.bid.startsWith('common'))).sort(compareWL);
        subBooks.value = await idb.getBooks(wl =>mem.setting.books.includes(wl.bid));
        myBooks.value = (await idb.getBooks(wl => wl.bid.startsWith(app.user.value)));
    }
    useSignalEffect(() => {
        (async () => {
            const regex = new RegExp(bookFilter.value);
            books.value = (await idb.getBooks(wl => regex.test(wl.bid) ||
                (wl.disc && regex.test(wl.disc)))).sort(compareWL);
        })()
    });
    useEffect(() => { init() }, []);
    return <Dialog class="p-2 gap-2 flex flex-col" title="设置">
        <fieldset class="border rounded shrink-0 overflow-y-auto px-2">
            <legend>我的词书</legend>
            <List cindex={myIndex} options={myBooks.value.map(wl=>wl.disc??wl.bid)}
                class="px-2" activeClass="bg-[var(--bg-title)]"/>
        </fieldset>
        <div class="flex justify-between gap-2">
            <Button class="button btn-normal grow" name="new" onClick={handleNewBookClick}>新建</Button>
            <Button class="button btn-normal grow" name="delete" disabled={!myBooks.value.length} onClick={handleDeleteBookClick}>删除</Button>
            <Button class="button btn-normal grow" name="update" disabled={!myBooks.value.length} onClick={handleUpdateBookClick}>更新</Button>
        </div>
        <div class="flex gap-2">
            <label for="filter">设置过滤</label>
            <Input class="grow" name="filter" binding={bookFilter} />
        </div>
        <fieldset class="border rounded max-h-[70%] grow shrink overflow-y-auto px-2">
            <legend>可用的词书</legend>
            <List class="px-2" cindex={cindex}
                options={books.value.map(wl => wl.disc ?? wl.bid)}
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
                options={subBooks.value.map(wl => wl.disc ?? wl.bid)}
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