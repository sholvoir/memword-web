// deno-lint-ignore-file no-cond-assign
/// <reference lib="webworker" />
import { emptyResponse, jsonResponse, requestInit, STATUS_CODE } from "@sholvoir/generic/http";
import { blobToBase64 } from "@sholvoir/generic/blob";
import { JWT } from "@sholvoir/generic/jwt";
import { defaultSetting, ISetting } from "../../memword-server/lib/isetting.ts";
import { B2_BASE_URL, now } from "../../memword-server/lib/common.ts";
import { IWordList } from "../../memword-server/lib/iwordlist.ts";
import { IDict } from "../../memword-server/lib/idict.ts";
import { version } from "../deno.json" with { type: "json" };
import { IItem, item2task, newItem } from "./iitem.ts";
import { statsFormat } from "./istat.ts";
import * as idb from "./indexdb.ts";

declare const self: ServiceWorkerGlobalScope;
self.oninstall = (e) => e.waitUntil(self.skipWaiting());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));

const route = new Map<string, (req: Request) => Response | Promise<Response>>();
const dictExpire = 7 * 24 * 60 * 60;
const cacheName = `MemWord-V${version}`;
const wordlists: Record<string, Set<string>> = {};

const handleActivate = async () => {
    for (const cacheKey of await caches.keys()) if (cacheKey !== cacheName) await caches.delete(cacheKey)
    await self.clients.claim();
};

// const putInCache = async (request: Request, response: Response) => {
//     await (await caches.open(cacheName)).put(request, response);
// };

const handleFetch = async (req: Request) => {
    const handlerKey = `${req.method.toUpperCase()} ${new URL(req.url).pathname.toLowerCase()}`;
    console.log(handlerKey);
    const handler = route.get(handlerKey);
    if (handler) return handler(req);
    //const respFromCache = await caches.match(req);
    //if (respFromCache) return respFromCache;
    const respFromNetwork = await fetch(req);
    //if (respFromNetwork.ok)
        //putInCache(req, respFromNetwork.clone());
    return respFromNetwork;
};

const getServerDict = async (word: string) => {
    const resp = await fetch(`/dict?q=${encodeURIComponent(word)}`, { cache: 'reload' });
    if (!resp.ok) return undefined;
    return (await resp.json()) as IDict;
}

const updateDict = async (word: string): Promise<IItem | undefined> => {
    const dict = await getServerDict(word);
    if (dict?.cards) {
        for (const card of dict.cards) if (card.sound) {
            const resp = await fetch(`/sound?q=${encodeURIComponent(card.sound)}`, { cache: 'force-cache' });
            if (resp.ok) card.sound = await blobToBase64(await resp.blob());
        }
        return await idb.updateDict(word, dict);
    }
}

const itemUpdateDict = async (item: IItem) => {
    if (!item.dversion) return (await updateDict(item.word!)) ?? item;
    if (item.dversion + dictExpire < now()) updateDict(item.word!);
    return item;
}

const syncTasks = async () => {
    const thisTime = now();
    const lastTime: number = (await idb.getMeta('_sync-time')) ?? 1;
    const tasks = (await idb.getItems(lastTime)).map(item2task);
    const resp = await fetch(`/api/task?lastgt=${lastTime}`, requestInit(tasks));
    if (!resp.ok) return console.error('Network Error: get sync task data error.');
    const ntasks = await resp.json();
    await idb.mergeTasks(ntasks);
    await idb.setMeta('_sync-time', thisTime);
};

const downTasks = async () => {
    const resp = await fetch(`/api/task?lastgt=0`, requestInit([]));
    if (!resp.ok) return console.error('Network Error: download task data error.');
    const ntasks = await resp.json();
    await idb.mergeTasks(ntasks);
}

const submitIssues = async () => {
    const issues = await idb.getIssues();
    for (const issue of issues) {
        const res = await fetch('/api/issue', requestInit(issue));
        if (!res.ok) break;
        await idb.deleteIssue(issue.id);
    }
};

const updateWordlist = async (wlid: string, download?: boolean) => {
    const res = await fetch(`/wordlist?wlid=${encodeURIComponent(wlid)}`);
    if (!res.ok && !download) return;
    const sversion = res.ok ? ((await res.json()) as IWordList)?.version : undefined;
    const cversion = await idb.getWordlistVersion(wlid);
    const [down, version] = (!cversion && !sversion) ? [false] :
        (!cversion && sversion) ? [true, sversion, idb.setWordlistVersion(wlid, sversion)] :
        (cversion && !sversion) ? [download, cversion] :
        (cversion == sversion) ? [download, sversion] :
        [true, sversion, idb.setWordlistVersion(wlid, sversion!)];
    if (down) {
        const req = new Request(`${B2_BASE_URL}/${wlid}-${version}.txt`);
        const res1 = await handleFetch(req);
        if (!res1.ok) return;
        const wl = new Set<string>();
        for (let word of (await res1.text()).split('\n')) if (word = word.trim()) wl.add(word);
        wordlists[wlid] = wl;
    }
}

const getWordlist = async (wlid: string): Promise<Set<string>|undefined> =>
    wordlists[wlid] ? (updateWordlist(wlid), wordlists[wlid]) :
        (await updateWordlist(wlid, true), wordlists[wlid]);

route.set('GET /user', async () => {
    const auth: string = await idb.getMeta('_auth');
    if (auth) {
        const payload = JWT.decode(auth)[1];
        if (payload?.aud) return jsonResponse({name: payload.aud});
    }
    return emptyResponse(STATUS_CODE.NotFound);
});

route.set('GET /version', () => jsonResponse({version}));

route.set('GET /setting', async () => {
    let setting: ISetting = await idb.getMeta('_setting');
    if (setting) return jsonResponse(setting);
    setting = defaultSetting();
    const res = await fetch('/api/setting', requestInit(setting));
    if (!res.ok) return jsonResponse(setting);
    setting = await res.json();
    idb.setMeta('_setting', setting);
    return jsonResponse(setting);
});

route.set('POST /setting', (req) => {
    (async () => {
        const clientSetting: ISetting = await req.json();
        const workerSetting: ISetting = await idb.getMeta('_setting');
        if (!workerSetting || workerSetting.version < clientSetting.version) {
            await idb.setMeta('_setting', clientSetting);
            const res = await fetch('/api/setting', requestInit(clientSetting));
            if (!res.ok) return;
            const serverSetting: ISetting = await res.json();
            if (serverSetting.version > clientSetting.version)
                await idb.setMeta('_setting', serverSetting);
        }
    })();
    return emptyResponse();
});

route.set('GET /search', async (req) => {
    const word = new URL(req.url).searchParams.get('word');
    if (!word) return emptyResponse(STATUS_CODE.BadRequest);
    if (idb.tempItems.has(word)) return jsonResponse(idb.tempItems.get(word)!);
    const item = await idb.getItem(word);
    if (!item) {
        const dict = await getServerDict(word);
        if (!dict) return emptyResponse(STATUS_CODE.BadRequest);
        const nitem = newItem(dict);
        idb.tempItems.set(word, nitem);
        return jsonResponse(nitem);
    };
    return jsonResponse(await itemUpdateDict(item));
});

route.set('GET /updict', async (req) => {
    const word = new URL(req.url).searchParams.get('word');
    if (!word) return emptyResponse(STATUS_CODE.BadRequest);
    const item = await updateDict(word);
    return item ? jsonResponse(item) : emptyResponse(STATUS_CODE.NotFound);
});

route.set('GET /episode', async (req) => {
    const params = new URL(req.url).searchParams;
    const rblevel = params.get('blevel');
    const blevel = rblevel ? +rblevel : undefined;
    const wlid = params.get('wlid');
    const item = wlid ? await idb.getEpisode(await getWordlist(wlid), blevel) :
        await idb.getEpisode(undefined, blevel);
    if (!item) return emptyResponse(STATUS_CODE.NotFound);
    return jsonResponse(await itemUpdateDict(item));
});

route.set('GET /studied', async (req) => {
    const params = new URL(req.url).searchParams;
    const word = params.get('word');
    const rlevel = params.get('level');
    const level = rlevel ? +rlevel : undefined;
    if (!word) return emptyResponse(STATUS_CODE.BadRequest);
    await idb.studied(word, level);
    return emptyResponse();
});

route.set('GET /add-tasks', async (req) => {
    const wlid = new URL(req.url).searchParams.get('wlid');
    if (!wlid) return emptyResponse(STATUS_CODE.BadRequest);
    const words = await getWordlist(wlid);
    if (!words) return emptyResponse(STATUS_CODE.InternalServerError);
    await idb.addTasks(words);
    return emptyResponse();
});

route.set('GET /sync-tasks', () => (syncTasks(), emptyResponse()));

route.set('GET /down-tasks', () => (downTasks(), emptyResponse()));

route.set('POST /issue', async (req) => {
    const data = await req.json();
    if (!data) return emptyResponse(STATUS_CODE.BadRequest);
    await idb.addIssue(data.issue);
    submitIssues();
    return emptyResponse();
});

route.set('GET /stats', async ()=> {
    const setting = ((await idb.getMeta('_setting')) as ISetting) ?? defaultSetting();
    const wls = [];
    for (const wlid of setting.books) wls.push(new Set<string>(await getWordlist(wlid)));
    const [total, wlStats] = await idb.getStats(wls);
    setting.books.forEach((wlid, index) => wlStats[index].wlid = wlid);
    return jsonResponse({format: statsFormat, total, wlStats});
});

route.set('GET /vocabulary', async () => {
    const vocabulary = await getWordlist('system/vocabulary');
    if (!vocabulary) return emptyResponse(STATUS_CODE.InternalServerError);
    return jsonResponse(Array.from(vocabulary).sort());
});

route.set('GET /signin', async (req) => {
    const params = new URL(req.url).searchParams
    const name = params.get('name');
    const code = params.get('code');
    if (!name || !code) return emptyResponse(STATUS_CODE.BadRequest);
    const res = await fetch(req);
    if (!res.ok) return res;
    await idb.setMeta('_auth', (await res.json()).auth);
    return emptyResponse();
})

route.set('GET /signout', async () => (await idb.clear(), emptyResponse()));