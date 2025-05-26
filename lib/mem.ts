// deno-lint-ignore-file no-empty
import { requestInit, getRes, getJson, STATUS_CODE } from '@sholvoir/generic/http';
import { blobToBase64 } from "@sholvoir/generic/blob";
import { JWT } from "@sholvoir/generic/jwt";
import { defaultSetting, type ISetting } from "../../memword-server/lib/isetting.ts";
import type { IDict } from "../../memword-server/lib/idict.ts";
import type { IIssue } from "../../memword-server/lib/iissue.ts";
import { type IWordList, splitID } from "../../memword-server/lib/iwordlist.ts";
import { type IClientWordlist, getClientWordlist } from "./wordlists.ts";
import { type IStats, statsFormat } from './istat.ts';
import { type IItem, item2task, newItem } from "./iitem.ts";
import { B2_BASE_URL, now } from "../../memword-server/lib/common.ts";
import { API_URL } from "./common.ts";
import * as idb from './indexdb.ts';

const dictExpire = 7 * 24 * 60 * 60;
let auth: string;
const authHead = () => ({ "Authorization": `Bearer ${auth}` });
const getAuth = async () => auth ?? (auth = await idb.getMeta('_auth'));

const getServerDict = (word: string) =>
    getJson<IDict>(`${API_URL}/pub/dict?q=${encodeURIComponent(word)}`, undefined, { cache: 'reload' });

const getServerAndUpdateLocalDict = async (word: string) => {
    const item = await idb.getItem(word);
    const dict = await getServerDict(word);
    if (!dict) return item;
    if (!item) return newItem(dict);
    if (item.version !== undefined && dict.version !== undefined && item.version >= dict.version)
        return (await idb.updateDict(item));
    if (dict.cards) for (const card of dict.cards) if (card.sound) {
        const resp = await fetch(`${API_URL}/pub/sound?q=${encodeURIComponent(card.sound)}`,
            { cache: 'force-cache' });
        if (resp.ok) card.sound = await blobToBase64(await resp.blob());
    }
    return (await idb.updateDict(dict));
}

const submitIssues = async () => {
    const issues = await idb.getIssues();
    for (const issue of issues) {
        const res = await fetch(`${API_URL}/api/issue`, requestInit(issue, 'POST', authHead()));
        if (!res.ok) break;
        await idb.deleteIssue(issue.id);
    }
};

export let setting: ISetting = defaultSetting();

export const itemUpdateDict = async (item: IItem) => {
    if (!item.dictSync) return (await getServerAndUpdateLocalDict(item.word!)) ?? item;
    if (item.dictSync + dictExpire < now()) getServerAndUpdateLocalDict(item.word!);
    return item;
}

export const getUser = async () => {
    if (!auth) await getAuth();
    if (auth) return JWT.decode(auth)[1]?.aud as string;
}

export const getDict = async (word: string) => {
    try { return await getServerDict(word); } catch { }
}

export const putDict = async (dict: IDict) => {
    try {
        const res = await fetch(`${API_URL}/admin/dict`, requestInit(dict, 'PUT', authHead()));
        return res.ok;
    } catch { return false; }
}

export const deleteDict = async (word: string) => {
    try {
        const res = await getRes(`${API_URL}/admin/dict`, { q: word }, { method: 'DELETE', headers: authHead() });
        return res.ok;
    } catch { return false; }
}

export const initSetting = async () => {
    const s = await idb.getMeta('_setting');
    if (s) setting = s;
}

export const syncSetting = async (cSetting?: ISetting) => {
    if (cSetting && cSetting.version > setting.version) setting = cSetting;
    const lSetting: ISetting = await idb.getMeta('_setting');
    if (lSetting && lSetting.version > setting.version) setting = lSetting;
    else await idb.setMeta('_setting', setting);
    try {
        const res = await fetch(`${API_URL}/api/setting`, requestInit(setting, 'POST', authHead()));
        if (!res.ok) return;
        const sSetting: ISetting = await res.json();
        if (sSetting.version > setting.version)
            await idb.setMeta('_setting', setting = sSetting);
    } catch { }
}

export const search = async (word: string) => {
    if (idb.tempItems.has(word)) return idb.tempItems.get(word)!;
    const item = await idb.getItem(word);
    if (!item) {
        try {
            const dict = await getServerDict(word);
            if (!dict) return;
            const nitem = newItem(dict);
            idb.tempItems.set(word, nitem);
            return nitem;
        } catch { return }
    };
    return await itemUpdateDict(item);
}

export const getUpdatedItem = (word: string) => getServerAndUpdateLocalDict(word);

export const getEpisode = async (wlid?: string) => {
    const item = await idb.getEpisode(wlid ? (await getClientWordlist(wlid))?.wordSet : undefined);
    if (item) return await itemUpdateDict(item);
}

export const deleteItem = async (word: string) => {
    try {
        const resp = await fetch(`${API_URL}/api/task`, requestInit([word], 'DELETE', authHead()));
        if (!resp.ok) return console.error('Network Error: get sync task data error.');
        await idb.deleteItem(word);
        return true;
    } catch { return false }
}

export const studied = (word: string, level?: number) => idb.studied(word, level);

export const addTasks = async (wlid: string) => {
    const wordlist = await getClientWordlist(wlid);
    if (!wordlist) return false;
    await idb.addTasks(wordlist.wordSet);
    return true;
}

export const syncTasks = async () => {
    try {
        const thisTime = now();
        const lastTime: number = (await idb.getMeta('_sync-time')) ?? 1;
        const tasks = (await idb.getItems(lastTime)).map(item2task);
        const resp = await fetch(`${API_URL}/api/task`, requestInit(tasks, 'POST', authHead()));
        if (!resp.ok) return console.error('Network Error: get sync task data error.');
        const ntasks = await resp.json();
        await idb.mergeTasks(ntasks);
        await idb.setMeta('_sync-time', thisTime);
        return true;
    } catch { return false }
}

export const submitIssue = async (issue: string) => {
    await idb.addIssue(issue);
    submitIssues();
}

export const getServerIssues = () =>
    getJson<Array<IIssue>>(`${API_URL}/admin/issue`, undefined, {
        method: 'GET',  headers: authHead()
    });

export const deleteServerIssue = (id: string) =>
    getJson(`${API_URL}/admin/issue`, {id}, {
        method: 'DELETE', headers: authHead()
    });

export const totalStats = async () => {
    const cwls: Array<IClientWordlist | undefined> = [];
    for (const wlid of setting.books) cwls.push(await getClientWordlist(wlid));
    return { format: statsFormat, stats: await idb.getStats(cwls) } as IStats;
}

export const getVocabulary = async () => {
    const wordlist = await getClientWordlist('system/vocabulary');
    if (wordlist) return Array.from(wordlist.wordSet).sort();
}

export const postVocabulary = async (words: string) => {
    try {
        const res = await getRes(`${API_URL}/admin/vocabulary`, undefined,
            { body: words, method: 'POST', headers: authHead() });
        return res.ok
    } catch { return false }
}

export const getServerWordlist = async () => {
    const wls = await getJson<Array<IWordList>>(`${API_URL}/pub/wordlist`);
    if (!wls) return [];
    (async () => {
        const time = now();
        await idb.setMeta('_wl-time', time);
        const deleted = await idb.syncWordlists(wls);
        const setting = await idb.getMeta('_setting') as ISetting;
        const nbooks = setting.books.filter(wlid => !deleted.has(wlid));
        if (nbooks.length !== setting.books.length) {
            setting.books = nbooks;
            setting.version = time;
            await idb.setMeta('_setting', setting);
        }
    })();
    return wls;
}

export const getWordlists = async (filter: (wl: IWordList) => unknown) => {
    try {
        const owlTime = await idb.getMeta('_wl-time') as number;
        const nwlTime = now();
        if (nwlTime - owlTime > 3600 * 24)
            return (await getServerWordlist()).filter(filter);
    } catch { }
    return idb.getWordlists(filter);
}

export const postMyWordList = async (name: string, words: string, disc?: string, replace?: '1') => {
    const res = await getRes(`${API_URL}/api/wordlist`, { name, disc, replace },
        { body: words, method: 'POST', headers: authHead() });
    switch (res.status) {
        case STATUS_CODE.NotAcceptable: return [res.status, await res.json()];
        case STATUS_CODE.OK: idb.putWordlist(await res.json()); return [res.status];
        default: return [res.status]
    }
}

export const deleteWordList = async (wlid: string) => {
    try {
        const name = splitID(wlid)[1];
        const res = await getRes(`${API_URL}/api/wordlist`, { name },
            { method: 'DELETE', headers: authHead() });
        if (res.ok) await idb.deleteWordlist(wlid);
        return res.ok;
    } catch { return false }
}

export const otp = async (name: string) => {
    try {
        const res = await getRes(`${API_URL}/pub/otp`, { name });
        return res.status;
    } catch { return -1 }
}

export const signup = async (phone: string, name: string) => {
    try {
        const res = await getRes(`${API_URL}/pub/signup`, { phone, name });
        return res.status;
    } catch { return -1 }
}

export const signin = async (name: string, code: string) => {
    try {
        const res = await getRes(`${API_URL}/pub/signin`, { name, code });
        if (res.ok) await idb.setMeta('_auth', (await res.json()).auth);
        console.log(`signin ${res.status}`);
        return res.status;
    } catch { return -1 }
}
export const signout = idb.clear;

export const getB2File = (fileName: string) => fetch(`${B2_BASE_URL}/${fileName}`);