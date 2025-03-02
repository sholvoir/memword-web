// deno-lint-ignore-file no-cond-assign
import { signal } from "@preact/signals";
import { initStats, IStats } from "../lib/istat.ts";
import { IItem } from "../lib/iitem.ts";
import * as mem from "../lib/mem.ts";

const DIALS = ['#home', '#help', '#about', '#menu', '#issue', '#setting', '#syswordlist',
    '#wordlist', '#wordlists', '#lookup', '#search', '#study', '#signup', '#signin', '#signout'] as const;
export type TDial = typeof DIALS[number];
const backs: Array<TDial> = [];

export const user = signal('');
export const stats = signal<IStats>(initStats());
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
export const totalStats = async () => stats.value = await mem.totalStats();
export const isAdmin = () => user.value == 'hua';
export const hideTips = () => tips.value = '';
export const go = (d?: TDial) =>
    loca.value = d ? (backs.push(loca.value), d) :
        backs.pop() ?? (user.value ? '#home' : '#about');
export const showTips = (content: string, autohide = true) =>
    (tips.value = content, autohide && setTimeout(hideTips, 3000));

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
    }
};

export const init = async () => {
    if (user.value = (await mem.getUser()) ?? '') {
        go('#home');
        await mem.syncSetting();
        const v = await mem.getVocabulary();
        if (v) vocabulary = v;
        await mem.syncTasks();
        await totalStats();
    } else go('#about');
};