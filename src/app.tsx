// deno-lint-ignore-file no-cond-assign
import { signal } from "@preact/signals";
import { wait } from "@sholvoir/generic/wait";
import { type IStats, initStats } from "../lib/istat.ts";
import type { IItem } from "../lib/iitem.ts";
import type { IWordList } from "../../memword-server/lib/iwordlist.ts";
import * as mem from "../lib/mem.ts";
import * as idb from "../lib/indexdb.ts";

const DIALS = ['', '#home', '#help', '#about', '#menu', '#issue',
    '#setting', '#wordlist', '#wordlists', '#search', '#study',
    '#signup', '#signin'] as const;
export type TDial = typeof DIALS[number];
const backs: Array<TDial> = [];

export const user = signal('');
export const stats = signal<IStats>(initStats());
export const tips = signal('');
export const isPhaseAnswer = signal(false);
export const citem = signal<IItem>();
export const wlid = signal<string>();
export const sprint = signal(-1);
export const name = signal('');
export const wl = signal<IWordList>();
export const loading = signal(false);
export const loca = signal<TDial>('');

export let vocabulary: Array<string> = [];
export const totalStats = async () => stats.value = await mem.totalStats();
export const isAdmin = () => user.value === 'hua';
export const hideTips = () => tips.value = '';
export const go = (d?: TDial) =>
    loca.value = d ? (backs.push(loca.value), d) :
        backs.pop() ?? (user.value ? '#home' : '#about');
export const showTips = (content: string, autohide = true) =>
    (tips.value = content, autohide && setTimeout(hideTips, 3000));

export const startStudy = async (wl?: string) => {
    loading.value = true;
    const item = await mem.getEpisode(wlid.value = wl);
    loading.value = false;
    if (item) {
        citem.value = item;
        isPhaseAnswer.value = false;
        sprint.value = 0;
        go('#study');
    } else {
        showTips('No More Task');
        totalStats();
    }
};

export const init = async () => {
    if (user.value = (await mem.getUser()) ?? '') {
        go('#home');
        await mem.initSetting();
        await totalStats();
        const v = await mem.getVocabulary();
        if (v) vocabulary = v;
        (async () => {
            mem.getServerWordlist();
            await mem.syncSetting();
            await mem.syncTasks();
            await totalStats();
            for (const item of await idb.getPredict(3600, 500)) {
                await mem.itemUpdateDict(item);
                await wait(300);
            }
        })();
    } else go('#about');
};