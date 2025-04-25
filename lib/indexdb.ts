// deno-lint-ignore-file no-explicit-any
import { type IStat, addTaskToStat, isBLevelIncludesLevel, initStat } from "./istat.ts";
import { type IItem, itemMergeDict, itemMergeTask, neverItem } from "./iitem.ts";
import { type ITask, studyTask } from "../../memword-server/lib/itask.ts";
import type { IWordList } from "../../memword-server/lib/iwordlist.ts";
import type { IDict } from "../../memword-server/lib/idict.ts";
import type { IClientWordlist } from "./wordlists.ts";
import { now } from "../../memword-server/lib/common.ts";

export const tempItems = new Map<string, IItem>();
type kvKey = '_sync-time' | '_setting' | '_auth' | '_wl-time';
let db: IDBDatabase;

const run = (reject: (reason?: any) => void, func: (db: IDBDatabase) => void) => {
    if (db) return func(db);
    const request = indexedDB.open('memword', 1);
    request.onerror = reject;
    request.onsuccess = () => func(db = request.result);
    request.onupgradeneeded = () => {
        const d = request.result;
        d.createObjectStore('mata', { keyPath: 'key' });
        d.createObjectStore('wordlist', { keyPath: 'wlid' });
        d.createObjectStore('issue', { keyPath: 'id', autoIncrement: true });
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
    new Promise<Array<{ id: number, issue: string }>>((resolve, reject) => run(reject, db => {
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

export const deleteIssue = (id: number) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const request = db.transaction('issue', 'readwrite').objectStore('issue').delete(id);
        request.onerror = reject;
        request.onsuccess = () => resolve();
    }));

export const getWordlist = (wlid: string) =>
    new Promise<IWordList | undefined>((resolve, reject) => run(reject, db => {
        const request = db.transaction('wordlist', 'readonly').objectStore('wordlist').get(wlid);
        request.onerror = reject;
        request.onsuccess = () => resolve(request.result);
    }));

export const putWordlist = (wl: IWordList) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const request = db.transaction('wordlist', 'readwrite').objectStore('wordlist').put(wl);
        request.onerror = reject;
        request.onsuccess = () => resolve();
    }));

export const getWordlists = (filter: (wl: IWordList) => unknown) =>
    new Promise<Array<IWordList>>((resolve, reject) => run(reject, db => {
        const wls: Array<IWordList> = [];
        const transaction = db.transaction('wordlist', 'readonly');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve(wls);
        transaction.objectStore('wordlist').openCursor().onsuccess = e => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (!cursor) return;
            const wl = cursor.value as IWordList;
            if (filter(wl)) wls.push(wl);
            cursor.continue();
        };
    }))

export const syncWordlists = (wls: Array<IWordList>) =>
    new Promise<Set<string>>((resolve, reject) => run(reject, db => {
        const wlMap = new Map<string, IWordList>();
        for (const wl of wls) wlMap.set(wl.wlid, wl);
        const deleted = new Set<string>();
        const transaction = db.transaction('wordlist', 'readwrite');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve(deleted);
        const wStore = transaction.objectStore('wordlist');
        wStore.openCursor().onsuccess = e => {
            const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
            if (!cursor) {
                for (const [_, wl] of wlMap)
                    wStore.add(wl);
                return;
            }
            const cwl = cursor.value as IWordList;
            if (wlMap.has(cwl.wlid)) {
                const swl = wlMap.get(cwl.wlid)!;
                if (swl.version !== cwl.version)
                    wStore.put(swl);
                wlMap.delete(cwl.wlid);
            } else {
                deleted.add(cwl.wlid);
                cursor.delete();
            }
            cursor.continue();
        }
    }));

export const deleteWordlist = (wlid: string) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const request = db.transaction('wordlist', 'readwrite').objectStore('wordlist').delete(wlid);
        request.onerror = reject;
        request.onsuccess = () => resolve();
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

export const getItems = (last: number) =>
    new Promise<Array<IItem>>((resolve, reject) => run(reject, db => {
        const request = db.transaction('item', 'readonly').objectStore('item').index('last').getAll(IDBKeyRange.lowerBound(last));
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

export const mergeTasks = (tasks: Array<ITask>) =>
    new Promise<void>((resolve, reject) => run(reject, db => {
        const transaction = db.transaction('item', 'readwrite');
        transaction.onerror = reject;
        transaction.oncomplete = () => resolve();
        const iStore = transaction.objectStore('item');
        for (const task of tasks) iStore.get(task.word).onsuccess = (e) => {
            const item = (e.target as IDBRequest<IItem>).result;
            if (!item) iStore.add(task);
            else if (task.last > item.last) iStore.put(itemMergeTask(item, task));
        };
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
            if (item) iStore.put(itemMergeDict(item, dict));
        }
    }));

export const getEpisode = (wordList?: Set<string>, blevel?: number) =>
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
                if ((!wordList || wordList.has(item.word)) && ((blevel === undefined) || isBLevelIncludesLevel(blevel, item.level)))
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

export const getStats = (wls: Array<IClientWordlist | undefined>) =>
    new Promise<Array<IStat>>((resolve, reject) => run(reject, db => {
        const time = now();
        const tstat = initStat(time, undefined, '全部词汇');
        const stats: Array<IStat> = wls.map((wl) => initStat(time, wl?.wlid, wl?.disc));
        const wordSets = wls.map(wl => new Set<string>(wl?.wordSet));
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