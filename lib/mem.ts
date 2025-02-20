// deno-lint-ignore-file no-empty
import { requestInit, getRes, getJson } from '@sholvoir/generic/http';
import { blobToBase64 } from "@sholvoir/generic/blob";
import { JWT } from "@sholvoir/generic/jwt";
import { defaultSetting, ISetting } from "../../memword-server/lib/isetting.ts";
import { IWordList } from "../../memword-server/lib/iwordlist.ts";
import { IDict } from "../../memword-server/lib/idict.ts";
import { B2_BASE_URL, now } from "../../memword-server/lib/common.ts";
import { IClientWordlist, getClientWordlist } from "./wordlists.ts";
import { IStats, initStats, statsFormat } from './istat.ts';
import { IItem, item2task, newItem } from "./iitem.ts";
import { API_URL } from "./common.ts";
import { version } from '../deno.json' with { type: "json" };
import * as idb from './indexdb.ts';
import { ITask } from "../../memword-server/lib/itask.ts";

const dictExpire = 7 * 24 * 60 * 60;

export { version }
export const setStats = (stats: IStats) =>
    localStorage.setItem('_stats', JSON.stringify(stats));

export const getStats = () => {
    const result = localStorage.getItem('_stats');
    if (result) {
        const stats = JSON.parse(result) as IStats;
        if (stats.format == statsFormat) return stats;
    }
    return initStats();
};

let auth: string;
const authHead = () => ({ "Authorization": `Bearer ${auth}` });
const getAuth = async () => auth ?? (auth = await idb.getMeta('_auth'));

const getServerDict = (word: string) => {
    return getJson<IDict>(`${API_URL}/pub/dict?q=${encodeURIComponent(word)}`, undefined, { cache: 'reload' });
}
const updateLocalDict = async (dict: IDict): Promise<IItem | undefined> => {
    if (dict.cards) {
        for (const card of dict.cards) if (card.sound) {
            const resp = await fetch(`${API_URL}/sound?q=${encodeURIComponent(card.sound)}`, { cache: 'force-cache' });
            if (resp.ok) card.sound = await blobToBase64(await resp.blob());
        }
        return await idb.updateDict(dict);
    }
}
const getServerAndUpdateLocalDict = async (word: string) => {
    const dict = await getServerDict(word);
    if (dict) return await updateLocalDict(dict);
}
const itemUpdateDict = async (item: IItem) => {
    if (!item.dversion) return (await getServerAndUpdateLocalDict(item.word!)) ?? item;
    if (item.dversion + dictExpire < now()) getServerAndUpdateLocalDict(item.word!);
    return item;
}

const submitIssues = async () => {
    const issues = await idb.getIssues();
    for (const issue of issues) {
        const res = await fetch(`${API_URL}/api/issue`, requestInit(issue, 'POST', authHead()));
        if (!res.ok) break;
        await idb.deleteIssue(issue.id);
    }
};

export const getUser = async () => {
    if (!auth) await getAuth();
    if (auth) return JWT.decode(auth)[1]?.aud as string;
}

export const getDict = async (word: string) => {
    const dict = await getServerDict(word);
    if (!dict) return;
    updateLocalDict(dict);
    return dict;
}

export const putDict = async (dict: IDict) => {
    updateLocalDict(dict);
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

export const getSetting = async () => {
    let setting: ISetting = await idb.getMeta('_setting');
    if (setting) return setting;
    setting = defaultSetting();
    try {
        const res = await fetch(`${API_URL}/api/setting`, requestInit(setting, 'POST', authHead()));
        if (!res.ok) return setting;
        setting = await res.json();
        idb.setMeta('_setting', setting);
    } catch { }
    return setting;
}

export const setSetting = async (cSetting: ISetting) => {
    const lSetting: ISetting = await idb.getMeta('_setting');
    if (!lSetting || cSetting.version > lSetting.version) {
        await idb.setMeta('_setting', cSetting);
        try {
            const res = await fetch(`${API_URL}/api/setting`, requestInit(cSetting, 'POST', authHead()));
            if (!res.ok) return;
            const serverSetting: ISetting = await res.json();
            if (serverSetting.version > cSetting.version)
                await idb.setMeta('_setting', serverSetting);
        } catch { }
    }
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

export const getEpisode = async (wlid?: string, blevel?: number) => {
    const item = await idb.getEpisode(wlid ? (await getClientWordlist(wlid))?.wordSet : undefined, blevel);
    if (item) return await itemUpdateDict(item);
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
        const resp = await fetch(`${API_URL}/api/task?lastgt=${lastTime}`, requestInit(tasks, 'POST', authHead()));
        if (!resp.ok) return console.error('Network Error: get sync task data error.');
        const ntasks = await resp.json();
        await idb.mergeTasks(ntasks);
        await idb.setMeta('_sync-time', thisTime);
        return true;
    } catch { return false }
}

export const downTasks = async () => {
    try {
        await idb.mergeTasks((await getJson<Array<ITask>>(`${API_URL}/api/task`,
            { lastgt: '0' }, requestInit([], 'POST', authHead())))!);
        return true;
    } catch { return false }
}

export const submitIssue = async (issue: string) => {
    await idb.addIssue(issue);
    submitIssues();
}

export const totalStats = async () => {
    const setting = ((await idb.getMeta('_setting')) as ISetting) ?? defaultSetting();
    const wls: Array<IClientWordlist | undefined> = [];
    for (const wlid of setting.books) wls.push(await getClientWordlist(wlid));
    const stats = await idb.getStats(wls);
    return { format: statsFormat, stats } as IStats;
}

export const getVocabulary = async () => {
    const wordlist = await getClientWordlist('system/vocabulary');
    if (wordlist) return Array.from(wordlist.wordSet).sort();
}

export const getServerWordlist = async (wlid: string) => {
    try {
        return await getJson<IWordList>(`${API_URL}/pub/wordlist`, {wlid});
    } catch { return undefined }
}

export const postSysWordList = async (name: string, words: string, disc?: string) => {
    try {
        const res = await getRes(`${API_URL}/admin/wordlist`, { name, disc },
            { body: words, method: 'POST', headers: authHead() });
        return res.ok
    } catch { return false }
}

export const postMyWordList = async (name: string, words: string, disc?: string) => {
    try {
        const res = await getRes(`${API_URL}/api/wordlist`, { name, disc },
            { body: words, method: 'POST', headers: authHead() });
        return res.ok
    } catch { return false }
}

export const getMyWordLists = async () => {
    try {
        const wls = await getJson<IWordList[]>(`${API_URL}/api/wordlist`, undefined, { headers: authHead() });
        if (!wls) return;
        idb.putWordlist(wls);
        return wls;
    } catch { return }
}

export const deleteWordList = async (wlid: string) => {
    try {
        await getRes('wordlist', { wlid }, { method: 'DELETE' });
        await idb.deleteWordlist(wlid);
        return true;
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
export const signout = async () => {
    localStorage.clear();
    await idb.clear();
}

export const getB2File = (fileName: string) => fetch(`${B2_BASE_URL}/${fileName}`);