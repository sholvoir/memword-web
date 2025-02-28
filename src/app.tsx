// deno-lint-ignore-file no-cond-assign
import { signal } from "@preact/signals";
import { IStats } from "../lib/istat.ts";
import { IItem } from "../lib/iitem.ts";
import * as mem from "../lib/mem.ts";

const DIALS = ['#home', '#help', '#about', '#menu', '#issue', '#setting', '#syswordlist',
    '#wordlist', '#wordlists', '#add', '#lookup', '#search', '#study', '#signup', '#signin', '#signout'] as const;
export type TDial = typeof DIALS[number];

export const user = signal('');
export const stats = signal<IStats>(mem.getStats());
export const tips = signal('');
export const isPhaseAnswer = signal(false);
export const citem = signal<IItem>();
export const wlid = signal<string>();
export const blevel = signal<number>();
export const sprint = signal(-1);
export const name = signal('');
export const loading = signal(false);
export const loca = signal<TDial>('#about');
export let vocabulary: Array<string> = [];
const backs: Array<TDial> = [];

export const isAdmin = () => user.value == 'hua';
export const hideTips = () => tips.value = '';
export const go = (d?: TDial) => {
    if (d) {
        backs.push(loca.value);
        loca.value = d;
    } else {
        d = backs.pop();
        loca.value = d ?? (user.value ? '#home' : '#about');
    }
}

export const showTips = (content: string, autohide = true) => {
    tips.value = content;
    if (autohide) setTimeout(hideTips, 3000);
};
export const totalStats = async () => {
    const a = await mem.totalStats();
    if (a) stats.value = a;
}
export const startStudy = async (wl?: string, bl?: number) => {
    loading.value = true;
    const item = await mem.getEpisode(wlid.value = wl, blevel.value = bl);
    loading.value = false;
    if (item) {
        citem.value = item;
        isPhaseAnswer.value = false;
        sprint.value = 0;
        go('#study');
    } else {
        showTips('Congratulations! There are no more task need to do.');
        totalStats();
        if (!wl && !bl) go('#add');
    }
};

export const init = async () => {
    if (user.value = (await mem.getUser()) ?? '') {
        go('#home');
        const v = await mem.getVocabulary();
        if (v) vocabulary = v;
        await mem.syncTasks();
        await totalStats();
    } else go('#about');
};