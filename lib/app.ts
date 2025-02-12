import { Signal, signal, computed } from "@preact/signals";
import { version } from "../deno.json" with { type: "json" };
import { wait } from "@sholvoir/generic/wait";
import { IStats } from "./istat.ts";
import { IItem } from "./iitem.ts";
import * as mem from "./mem.ts";

export type TDial = 'home'|'about'|'add'|'stats'|'dict'|'tasks'|'menu'|'help'|'wait'|'issue'|'study'|'setting'|'signup'|'signin'|'signout';

export { version };
export const user = signal('');
export const dialogs: Signal<Array<TDial>> = signal([]);
export const dialog = computed(() => dialogs.value.at(-1));
export const stats: Signal<IStats> = signal(mem.getStats());
export const tips = signal('');
export const vocabulary: Signal<Array<string>> = signal([]);

export const isPhaseAnswer = signal(false);
export const citem: Signal<IItem|undefined> = signal();
export const wlid: Signal<string|undefined> = signal();
export const blevel: Signal<number|undefined> = signal();
export const sprint: Signal<number> = signal(-1);

export const closeDialog = () => dialogs.value = dialogs.value.slice(0, -1);
export const showDialog = (d: TDial) => dialogs.value = [...dialogs.value, d];
export const hideTips = () => tips.value = '';
export const showTips = (content: string, autohide = true) => {
    tips.value = content;
    if (autohide) setTimeout(hideTips, 3000);
};

export const startStudy = async (wl?: string, bl?: number) => {
    showDialog('wait');
    const item = await mem.getEpisode(wlid.value = wl, blevel.value = bl);
    closeDialog();
    if (item) {
        citem.value = item;
        isPhaseAnswer.value = false;
        sprint.value = 0;
        showDialog('study');
    } else {
        showTips('Congratulations! There are no more task need to do.');
        totalStats();
        if (!wl && !bl) showDialog('add');
    }
};

const versionCompare = async () => {
    await wait(2000);
    const workerVersion = await mem.getWorkerVersion();
    if (!workerVersion) return console.error('Worker not work!');
    console.log(`Page Version: ${version}, Worker Version: ${workerVersion}.`);
    if (version != workerVersion) globalThis.location.reload();
};

export const totalStats = async () => {
    const a = await mem.totalStats();
    if (a) mem.setStats(stats.value = a);
}

export const init = async () => {
    if ("serviceWorker" in navigator)
        await navigator.serviceWorker.register('worker.js');
    const u = await mem.getUser();
    if (u) user.value = u.name;
    versionCompare();
    const v = await mem.getVocabulary();
    if (v) vocabulary.value = v;
    await mem.syncTasks();
    await totalStats();
};