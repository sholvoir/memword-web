/// <reference lib="webworker" />

import { API_URL } from "./common.ts";
import { version } from "../package.json";

const cacheName = `MemWord-V${version}`;
const apiServerRegex = new RegExp(`^${API_URL}/(pub|api|admin)/`);

const handleActivate = async () => {
    for (const cacheKey of await caches.keys()) if (cacheKey !== cacheName) await caches.delete(cacheKey)
    await self.clients.claim();
};

const putInCache = async (request: Request, response: Response) => {
    await (await caches.open(cacheName)).put(request, response);
};

const handleFetch = async (req: Request) => {
    console.log(req.url);
    if (apiServerRegex.test(req.url)) return await fetch(req)
    const respFromCache = await caches.match(req);
    if (respFromCache) return respFromCache;
    const respFromNetwork = await fetch(req);
    if (respFromNetwork.ok)
    putInCache(req, respFromNetwork.clone());
    return respFromNetwork;
};

declare const self: ServiceWorkerGlobalScope;
self.oninstall = (e) => e.waitUntil(self.skipWaiting());
self.onactivate = (e) => e.waitUntil(handleActivate());
self.onfetch = (e) => e.respondWith(handleFetch(e.request));
