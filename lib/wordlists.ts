// deno-lint-ignore-file no-cond-assign
import * as idb from './indexdb.ts';
import { IWordList } from "../../memword-server/lib/iwordlist.ts";
import { getServerWordlist, getB2File } from "./mem.ts";

export interface IClientWordlist extends IWordList {
    wordSet: Set<string>;
}

const wordlists = new Map<string, IClientWordlist>();

const updateWordlist = async (wlid: string, download?: boolean) => {
    const swl = await getServerWordlist(wlid);
    if (!swl && !download) return;
    const cwl = await idb.getWordlist(wlid);
    const [down, { version, disc }] = (!cwl && !swl) ? [false, {}] :
        (!cwl && swl) ? [true, swl, idb.putWordlist([swl])] :
        (cwl && !swl) ? [download, cwl] :
        (cwl!.version == swl!.version) ? [download, swl!] :
        [true, swl!, idb.putWordlist([swl!])];
    if (down) {
        const res1 = await getB2File(`${wlid}-${version}.txt`);
        if (!res1.ok) return;
        const wordSet = new Set<string>();
        for (let word of (await res1.text()).split('\n')) if (word = word.trim()) wordSet.add(word);
        wordlists.set(wlid, { wlid, version: version!, disc, wordSet });
    }
}

export const getClientWordlist = async (wlid: string): Promise<IClientWordlist|undefined> =>
    wordlists.has(wlid) ? (updateWordlist(wlid), wordlists.get(wlid)) :
        (await updateWordlist(wlid, true), wordlists.get(wlid));