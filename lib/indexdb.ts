// deno-lint-ignore-file no-explicit-any
import { type IStat, addTaskToStat, initStat } from "./istat.ts";
import { type IItem, itemMergeDict, itemMergeTask, neverItem } from "./iitem.ts";
import { type ITask, studyTask } from "@sholvoir/memword-common/itask";
import type { IBook } from "@sholvoir/memword-common/ibook";
import type { IDict } from "@sholvoir/memword-common/idict";
import type { IIssue } from "@sholvoir/memword-common/iissue";
import { now } from "@sholvoir/memword-common/common";

export const tempItems = new Map<string, IItem>();
type kvKey = '_sync-time' | '_setting' | '_auth';
let db: IDBDatabase;

const run = (reject: (reason?: any) => void, func: (db: IDBDatabase) => void) => {
    if (db) return func(db);
    const request = indexedDB.open('memword', 1);
    request.onerror = reject;
    request.onsuccess = () => func(db = request.result);
    request.onupgradeneeded = () => {
        const d = request.result;
        d.createObjectStore('mata', { keyPath: 'key' });
        d.createObjectStore('book', { keyPath: 'bid' });
        d.createObjectStore('issue', { keyPath: 'iid', autoIncrement: true });
        const iStore = d.createObjectStore('item', { keyPath: 'word' });
        iStore.createIndex('last', 'last');
        iStore.createIndex('next', 'next');
    }
};

export const clear = () =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        db.close();
        const request = indexedDB.deleteDatabase('memword');
        request.onerror = reject;
        request.onsuccess = () => resolve();
    }))

export const getMeta = (key: kvKey) =>
    new Promise<any>((resolve, reject) => run(reject, db => {
        const request = db.transaction('mata', 'readonly').objectStore('mata').get(key);
        request.onerror = reject;
        request.onsuccess = () => resolve(request.result?.value);
    }));

export const setMeta = (key: kvKey, value: any) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const request = db.transaction('mata', 'readwrite').objectStore('mata').put({ key, value });
        request.onerror = reject;
        request.onsuccess = () => resolve();
    }));

export const getIssues = () =>
    new Promise<Array<IIssue>>((resolve, reject) => run(reject, db => {
        const request = db.transaction('issue', 'readonly').objectStore('issue').getAll();
        request.onerror = reject;
        request.onsuccess = () => resolve(request.result);
    }));

export const addIssue = (issue: string) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const request = db.transaction('issue', 'readwrite').objectStore('issue').add({ issue });
        request.onerror = reject;
        request.onsuccess = () => resolve();
    }));

export const deleteIssue = (iid: number) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const request = db.transaction('issue', 'readwrite').objectStore('issue').delete(iid);
        request.onerror = reject;
        request.onsuccess = () => resolve();
    }));

export const getBook = (bid: string) =>
    new Promise<IBook | undefined>((resolve, reject) => run(reject, db => {
        const request = db.transaction('book', 'readonly').objectStore('book').get(bid);
        request.onerror = reject;
        request.onsuccess = () => {
            const book = request.result as IBook;
            if (!book) return resolve(undefined)
            //if (book.content) book.content = new Set<string>(book.content);
            resolve(book);
        }
    }));

export const putBook = (book: IBook) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        // const nbook: IBook = { ...book }
        // if (nbook.content) book.content = Array.from(nbook.content);
        const request = db.transaction('book', 'readwrite').objectStore('book').put(book);
        request.onerror = reject;
        request.onsuccess = () => resolve();
    }));

export const deleteBook = (bid: string) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const request = db.transaction('book', 'readwrite').objectStore('book').delete(bid);
        request.onerror = reject;
        request.onsuccess = () => resolve();
    }));

export const getBooks = (filter: (book: IBook) => unknown) =>
    new Promise<Array<IBook>>((resolve, reject) => run(reject, db => {
        const books: Array<IBook> = [];
        const transaction = db.transaction('book', 'readonly');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve(books);
        transaction.objectStore('book').openCursor().onsuccess = e => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (!cursor) return;
            const wl = cursor.value as IBook;
            if (filter(wl)) books.push(wl);
            cursor.continue();
        };
    }))

export const syncBooks = (books: Array<IBook>) =>
    new Promise<Set<string>>((resolve, reject) => run(reject, db => {
        const bookMap = new Map<string, IBook>();
        for (const book of books) bookMap.set(book.bid, book);
        const deleted = new Set<string>();
        const transaction = db.transaction('book', 'readwrite');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve(deleted);
        const bStore = transaction.objectStore('book');
        bStore.openCursor().onsuccess = e => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (!cursor) {
                for (const [_, book] of bookMap)
                    bStore.add(book);
                return;
            }
            const cbook = cursor.value as IBook;
            if (bookMap.has(cbook.bid)) {
                const sbook = bookMap.get(cbook.bid)!;
                if (sbook.version > cbook.version) cursor.update(sbook);
                bookMap.delete(cbook.bid);
            } else {
                deleted.add(cbook.bid);
                cursor.delete();
            }
            cursor.continue();
        }
    }));

export const getItem = (word: string) =>
    new Promise<IItem | undefined>((resolve, reject) => run(reject, db => {
        const request = db.transaction('item', 'readonly').objectStore('item').get(word);
        request.onerror = reject;
        request.onsuccess = () => resolve(request.result);
    }));

export const putItem = (item: IItem) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const request = db.transaction('item', 'readwrite').objectStore('item').put(item);
        request.onerror = reject;
        request.onsuccess = () => resolve();
    }));

export const deleteItem = (word: string) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const request = db.transaction('item', 'readwrite').objectStore('item').delete(word);
        request.onerror = reject;
        request.onsuccess = () => resolve();
    }))

export const getItems = (lastgte: number) =>
    new Promise<Array<IItem>>((resolve, reject) => run(reject, db => {
        const request = db.transaction('item', 'readonly').objectStore('item').index('last')
            .getAll(IDBKeyRange.lowerBound(lastgte));
        request.onerror = reject;
        request.onsuccess = () => resolve(request.result);
    }));

export const addTasks = (words: Iterable<string>) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const time = now();
        const transaction = db.transaction('item', 'readwrite');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve();
        const iStore = transaction.objectStore('item');
        for (const word of words) iStore.get(word).onsuccess = (e) => {
            const item = (e.target as IDBRequest<IItem>).result;
            if (!item) iStore.add(neverItem(word, time));
        }
    }));

export const mergeTasks = (tasks: Iterable<ITask>) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const taskMap = new Map<string, ITask>();
        for (const task of tasks) taskMap.set(task.word, task);
        const transaction = db.transaction('item', 'readwrite');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve();
        const iStore = transaction.objectStore('item');
        iStore.openCursor().onsuccess = (e) => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (!cursor) {
                for (const [_, task] of taskMap) iStore.add(task);
                return;
            }
            const item = cursor.value as IItem;
            if (taskMap.has(item.word)) {
                const task = taskMap.get(item.word)!;
                if (task.last > item.last) cursor.update(itemMergeTask(item, task));
                taskMap.delete(item.word)
            } else cursor.delete();
            cursor.continue();
        }
    }));

export const updateDict = (dict: IDict) =>
    new Promise<IItem | undefined>((resolve, reject) => run(reject, db => {
        let item: IItem;
        const transaction = db.transaction('item', 'readwrite');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve(item);
        const iStore = transaction.objectStore('item');
        iStore.get(dict.word).onsuccess = (e1) => {
            item = (e1.target as IDBRequest<IItem>).result;
            item && (item.dictSync = now()) && iStore.put(itemMergeDict(item, dict));
        }
    }));

export const getEpisode = (filter?: (word: string) => boolean) =>
    new Promise<IItem | undefined>((resolve, reject) => run(reject, db => {
        let result: IItem;
        const transaction = db.transaction('item', 'readonly');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve(result);
        transaction.objectStore('item').index('next')
            .openCursor(IDBKeyRange.upperBound(now()), "prev")
            .onsuccess = (e) => {
                const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
                if (!cursor) return;
                const item = cursor.value as IItem;
                if (!filter || filter(item.word))
                    return result = item;
                cursor.continue();
            }
    }));

export const getPredict = (time: number, sprint: number) =>
    new Promise<Array<IItem>>((resolve, reject) => run(reject, db => {
        const result: Array<IItem> = [];
        const transaction = db.transaction('item', 'readonly');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve(result);
        transaction.objectStore('item').index('next')
            .openCursor(IDBKeyRange.upperBound(now()+time), "prev")
            .onsuccess = (e) => {
                const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
                if (!cursor) return;
                result.push(cursor.value);
                if (result.length >= sprint) return;
                cursor.continue();
            }
    }));

export const getStats = (books: Array<IBook>) =>
    new Promise<Array<IStat>>((resolve, reject) => run(reject, db => {
        const time = now();
        const tstat = initStat(time, undefined, '全部词汇');
        const stats: Array<IStat> = books.map((book) => initStat(time, book.bid, book.disc));
        const wordSets = books.map(book => new Set<string>(book.content));
        const transaction = db.transaction('item', 'readonly');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve([tstat, ...stats]);
        transaction.objectStore('item').openCursor().onsuccess = e => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (!cursor) return stats.forEach((stat, i) => stat.total[0] += wordSets[i].size);
            const item = cursor.value as IItem;
            addTaskToStat(tstat, item);
            stats.forEach((stat, i) => wordSets[i].has(item.word) && (addTaskToStat(stat, item), wordSets[i].delete(item.word)));
            cursor.continue();
        }
    }));

export const studied = (word: string, level?: number) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const transaction = db.transaction('item', 'readwrite');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve();
        const iStore = transaction.objectStore('item');
        if (tempItems.has(word)) {
            iStore.put(studyTask(tempItems.get(word)!, level));
            tempItems.delete(word);
        } else iStore.get(word).onsuccess = (e2) => {
            const item = (e2.target as IDBRequest<IItem>).result;
            if (item) iStore.put(studyTask(item, level));
        }
    }));