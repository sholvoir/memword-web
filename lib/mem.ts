import { IStats, initStats, statsFormat } from './istat.ts';
import { requestInit } from '@sholvoir/generic/http';
import { ISetting } from "../../memword-server/lib/isetting.ts";
import { IItem } from "./iitem.ts";

export const setStats = (stats: IStats) =>
    localStorage.setItem('_stats', JSON.stringify(stats));

export const getStats = () => {
    const result = localStorage.getItem('_stats');
    if (result) {
        const stats = JSON.parse(result) as IStats;
        if (stats.format == statsFormat) return stats;
    }
    return initStats(0);
};

export const getUser = async () => {
    const res = await fetch('/user');
    if (!res.ok) return undefined;
    return (await res.json()) as {name: string}
};

export const getWorkerVersion = async () => {
    const res = await fetch(`/version`);
    if (!res.ok) return undefined;
    return (await res.json())?.version as string;
};

export const getSetting = async () => {
    const res = await fetch(`/setting`);
    if (!res.ok) return undefined;
    return (await res.json()) as ISetting;
};

export const setSetting = async (setting: ISetting) =>
    (await fetch(`/setting`, requestInit(setting))).ok;

export const search = async (word: string) => {
    const res = await fetch(`/search?word=${encodeURIComponent(word)}`);
    if (!res.ok) return undefined;
    return (await res.json()) as IItem;
};

export const getUpdatedDict = async (word: string) => {
    const res = await fetch(`/updict?word=${encodeURIComponent(word)}`);
    if (!res.ok) return undefined;
    return (await res.json()) as IItem;
};

export const getEpisode = async (wlid?: string, blevel?: number) => {
    const url = new URL(`/episode`, location.href);
    if (wlid) url.searchParams.append('wlid', wlid);
    if (blevel) url.searchParams.append('blevel', `${blevel}`);
    const res = await fetch(url);
    if (!res.ok) return undefined;
    return (await res.json()) as IItem;
};

export const studied = async (word: string, level?: number) => {
    const url = new URL('/studied', location.href);
    url.searchParams.append('word', word);
    if (level !== undefined) url.searchParams.append('level', `${level}`);
    return (await fetch(url)).ok;
};

export const addTasks = async (wlid: string) =>
    (await fetch(`/add-task?wlid=${encodeURIComponent(wlid)}`)).ok;

export const syncTasks = async () => (await fetch(`/sync-tasks`)).ok;

export const downTasks = async () => (await fetch(`/down-tasks`)).ok;

export const submitIssue = async (issue: string) =>
    (await fetch(`/issue`, requestInit({issue}))).ok;

export const totalStats = async () => {
    const res = await fetch(`/stats`);
    if (!res.ok) return undefined;
    return (await res.json()) as IStats;
};

export const getVocabulary = async () => {
    const res = await fetch(`/vocabulary`);
    if (!res.ok) return undefined;
    return (await res.json()) as Array<string>;
};

export const signup = async (phone: string, name: string) => {
    const url = new URL('/signup', location.href);
    url.searchParams.append('phone', phone);
    url.searchParams.append('name', name);
    return (await fetch(url)).status;
};

export const otp = async (name: string) =>
    (await fetch(`/otp?name=${encodeURIComponent(name)}`)).status;

export const signin = async (name: string, code: string) => {
    const url = new URL('/signin', location.href);
    url.searchParams.append('name', name);
    url.searchParams.append('code', code);
    return (await fetch(url)).status;
}

export const signout = async () =>
    (localStorage.clear(), (await fetch(`/signout`)).ok);