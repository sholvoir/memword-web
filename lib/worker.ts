/// <reference lib="webworker" />

import { API_URL } from "./common.ts";
import { version } from './version.ts';

const cacheVersionize = `MemWord-V${version}`;
const cachePermanent = 'MemWord'
const memwordApi = new RegExp(`^${API_URL}/(pub|api|admin)/`);
const apiSound = `${API_URL}/pub/sound`;
const memwordSound = 'https://www.micinfotech.com/sound'
const websterSound = 'https://media.merriam-webster.com'
const oxfordSound = 'https://www.oxfordlearnersdictionaries.com'
const dictionarySound = 'https://api.dictionaryapi.dev/media'
const ydlunacdnSound = 'https://ydlunacommon-cdn.nosdn.127.net'
const youdaoSound = 'https://dict.youdao.com/dictvoice'

const handleActivate = async () => {
    for (const cacheKey of await caches.keys())
        if (cacheKey !== cacheVersionize)
            await caches.delete(cacheKey)
    await self.clients.claim();
};

const putInCache = async (name: string, req: Request, res: Response) => {
    await (await caches.open(name)).put(req, res);
};

const handleFetch = async (req: Request) => {
    console.log(req.url);
    let name;
    switch (true) {
        case req.url.startsWith(apiSound):
        case req.url.startsWith(memwordSound):
        case req.url.startsWith(websterSound):
        case req.url.startsWith(oxfordSound):
        case req.url.startsWith(dictionarySound):
        case req.url.startsWith(ydlunacdnSound):
        case req.url.startsWith(youdaoSound):
            name = cachePermanent;
            break;
        case memwordApi.test(req.url): break;
        default:
            name = cacheVersionize;
    }
    if (!name) return await fetch(req);
    const cres = await caches.match(req);
    if (cres) return cres;
    const nresp = await fetch(req);
    if (nresp.ok) putInCache(name, req, nresp.clone());
    return nresp;
};

declare const self: ServiceWorkerGlobalScope;
self.oninstall = (e) => e.waitUntil(self.skipWaiting());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));
