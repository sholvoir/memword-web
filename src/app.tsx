// deno-lint-ignore-file no-cond-assign
import { signal } from "@preact/signals";
import { IStats } from "../lib/istat.ts";
import { IItem } from "../lib/iitem.ts";
import * as mem from "../lib/mem.ts";
import { wait } from "@sholvoir/generic/wait";

const DIALS = ['home', 'wait', 'help', 'about', 'menu', 'issue', 'setting',
    'add', 'dict', 'study', 'signup', 'signin', 'signout'] as const;
export type TDial = typeof DIALS[number];

export const user = signal('');
export const stats = signal<IStats>(mem.getStats());
export const tips = signal('');
export const vocabulary = signal<Array<string>>([]);
export const isPhaseAnswer = signal(false);
export const citem = signal<IItem>();
export const wlid = signal<string>();
export const blevel = signal<number>();
export const sprint = signal(-1);
export const name = signal('');
export const back = signal<TDial>();
export const dial = signal<TDial>('about');

export const hideTips = () => tips.value = '';
export const go = (d?: TDial) => dial.value = d ?? back.value ?? (user.value ? 'home' : 'about');
export const showTips = (content: string, autohide = true) => {
    tips.value = content;
    if (autohide) setTimeout(hideTips, 3000);
};
export const totalStats = async () => {
    const a = await mem.totalStats();
    if (a) mem.setStats(stats.value = a);
}
export const startStudy = async (wl?: string, bl?: number) => {
    go('wait');
    const item = await mem.getEpisode(wlid.value = wl, blevel.value = bl);
    if (item) {
        citem.value = item;
        isPhaseAnswer.value = false;
        sprint.value = 0;
        go('study');
    } else {
        showTips('Congratulations! There are no more task need to do.');
        totalStats();
        if (!wl && !bl) go('add');
    }
};

const versionCompare = async () => {
    await wait(2000);
    const workerVersion = await mem.getWorkerVersion();
    if (!workerVersion) return console.error('Worker not work!');
    console.log(`Page Version: ${mem.version}, Worker Version: ${workerVersion}.`);
    if (mem.version != workerVersion) globalThis.location.reload();
};

export const init = async () => {
    versionCompare();
    if (user.value = (await mem.getUser())?.name ?? '') {
        go('home');
        const v = await mem.getVocabulary();
        if (v) vocabulary.value = v;
        await mem.syncTasks();
        await totalStats();
    } else go('about');
};