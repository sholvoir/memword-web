import { createSignal } from "solid-js";
import { type IStats, initStats } from "../lib/istat.ts";
import type { IItem } from "../lib/iitem.ts";
import type { IBook } from "@sholvoir/memword-common/ibook";
import * as mem from "../lib/mem.ts";

const DIALS = ['', '#home', '#help', '#about', '#issue', '#setting',
    '#book', '#search', '#study', '#signup', '#signin'] as const;
export type TDial = typeof DIALS[number];

export const user = createSignal('');
export const stats = createSignal<IStats>(initStats());
export const tips = createSignal('');
export const isPhaseAnswer = createSignal(false);
export const citem = createSignal<IItem>();
export const bid = createSignal<string>();
export const sprint = createSignal(-1);
export const name = createSignal('');
export const book = createSignal<IBook>();
export const showLoading = createSignal(false);
export const loca = createSignal<TDial>('');
export const vocabulary = createSignal<Iterable<string>>([]);

export const totalStats = async () => stats[1](await mem.totalStats());
export const hideTips = () => tips[1]('');
export const go = (d?: TDial) => loca[1](d ?? (user[0]() ? '#home' : '#about'));
export const showTips = (content: string, autohide = true) =>
    (tips[1](content), autohide && setTimeout(hideTips, 3000));

export const startStudy = async (wl?: string) => {
    showLoading[1](true);
    const item = await mem.getEpisode(bid[1](wl));
    showLoading[1](false);
    if (item) {
        citem[1](item);
        isPhaseAnswer[1](false);
        sprint[1](0);
        go('#study');
    } else {
        showTips('No More Task');
        totalStats();
    }
};