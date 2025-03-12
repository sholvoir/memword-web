/// <reference lib="webworker" />

import { API_URL } from "./common.ts";
import { version } from './version.ts';

const cacheName = `MemWord-V${version}`;
const apiRegex = new RegExp(`^${API_URL}/(pub|api|admin)/`);

const handleActivate = async () => {
    for (const cacheKey of await caches.keys()) if (cacheKey !== cacheName) await caches.delete(cacheKey)
    await self.clients.claim();
};

const putInCache = async (request: Request, response: Response) => {
    await (await caches.open(cacheName)).put(request, response);
};

const handleFetch = async (req: Request) => {
    console.log(req.url);
    if (apiRegex.test(req.url)) return await fetch(req)
    const cres = await caches.match(req);
    if (cres) return cres;
    const nresp = await fetch(req);
    if (nresp.ok) putInCache(req, nresp.clone());
    return nresp;
};

declare const self: ServiceWorkerGlobalScope;
self.oninstall = (e) => e.waitUntil(self.skipWaiting());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));
