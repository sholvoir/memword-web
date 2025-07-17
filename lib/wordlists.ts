// deno-lint-ignore-file no-cond-assign
import { IWordList } from "@sholvoir/memword-common/iwordlist";
import { getWordlists, getB2File } from "./mem.ts";

export interface IClientWordlist extends IWordList {
    wordSet: Set<string>;
}

const wordlists = new Map<string, IClientWordlist>();

const updateWordlist = async (wlid: string) => {
    const cwl = wordlists.get(wlid);
    const [swl] = await getWordlists((wl) => wl.wlid == wlid);
    if (!swl) return;
    if (!cwl || cwl.version != swl.version) {
        const res1 = await getB2File(`${wlid}-${swl.version}.txt`);
        if (!res1.ok) return;
        const wordSet = new Set<string>();
        for (let word of (await res1.text()).split('\n')) if (word = word.trim()) wordSet.add(word);
        wordlists.set(wlid, { wlid, version: swl.version!, disc: swl.disc, wordSet });
    }
}

export const getClientWordlist = async (wlid: string): Promise<IClientWordlist|undefined> =>
    wordlists.has(wlid) ? (updateWordlist(wlid), wordlists.get(wlid)) :
        (await updateWordlist(wlid), wordlists.get(wlid));