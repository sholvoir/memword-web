import { signal } from "@preact/signals";
import { type IStats, initStats } from "../lib/istat.ts";
import type { IItem } from "../lib/iitem.ts";
import type { IBook } from "@sholvoir/memword-common/ibook";
import * as mem from "../lib/mem.ts";

const DIALS = ['', '#home', '#help', '#about', '#issue', '#setting',
    '#book', '#search', '#study', '#signup', '#signin'] as const;
export type TDial = typeof DIALS[number];

export const user = signal('');
export const stats = signal<IStats>(initStats());
export const tips = signal('');
export const isPhaseAnswer = signal(false);
export const citem = signal<IItem>();
export const bid = signal<string>();
export const sprint = signal(-1);
export const name = signal('');
export const book = signal<IBook>();
export const showLoading = signal(false);
export const loca = signal<TDial>('');
export const vocabulary = signal<Iterable<string>>([]);

export const totalStats = async () => stats.value = await mem.totalStats();
export const hideTips = () => tips.value = '';
export const go = (d?: TDial) => loca.value = d ?? (user.value ? '#home' : '#about');
export const showTips = (content: string, autohide = true) =>
    (tips.value = content, autohide && setTimeout(hideTips, 3000));

export const startStudy = async (wl?: string) => {
    showLoading.value = true;
    const item = await mem.getEpisode(bid.value = wl);
    showLoading.value = false;
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