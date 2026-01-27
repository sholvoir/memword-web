import type { IBook } from "@sholvoir/memword-common/ibook";
import type { IDict, IEntry } from "@sholvoir/memword-common/idict";
import type { IIssue } from "@sholvoir/memword-common/iissue";
import type { ISetting } from "@sholvoir/memword-common/isetting";
import type { ITask } from "@sholvoir/memword-common/itask";
import { API_URL } from "./common.ts";
import * as idb from "./indexdb.ts";

const token = await idb.getMeta("_auth");

const authHeader = { Authorization: `Bearer ${token}` };
const jsonHeader = { "Content-Type": "application/json" };
const textHeader = { "Content-Type": "text/plain" };

const url = (
   path: string,
   query?: Record<string, string | undefined | null>,
) => {
   const u = new URL(path, location.href);
   if (query)
      for (const [key, value] of Object.entries(query))
         if (key && value) u.searchParams.append(key, value);
   return u;
};

export const getJson = async <T>(
   input: string | URL | Request,
   init?: RequestInit,
): Promise<T | undefined> => {
   const res = await fetch(input, init);
   if (!res.ok) return undefined;
   return (await res.json()) as T;
};

export const otp = (name: string) => fetch(url(`${API_URL}/otp`, { name }));

export const signup = (phone: string, name: string) =>
   fetch(url(`${API_URL}/signup`, { phone, name }));
export const signin = (name: string, code: string) =>
   fetch(url(`${API_URL}/signin`, { name, code }));

export const getDefinition = (word: string) =>
   getJson<IEntry>(url(`${API_URL}/definition`, { q: word }));

export const getDict = (word: string) =>
   getJson<IDict>(url(`${API_URL}/dict`, { q: word }), { cache: "reload" });

export const putDict = (dict: IDict) =>
   fetch(`${API_URL}/dict`, {
      body: JSON.stringify(dict),
      headers: { ...jsonHeader, ...authHeader },
      method: "PUT",
   });

export const deleteDict = (word: string) =>
   fetch(url(`${API_URL}/dict`, { q: word }), {
      headers: authHeader,
      method: "DELETE",
   });

export const postTasks = (tasks: Array<ITask>) =>
   fetch(`${API_URL}/task`, {
      body: JSON.stringify(tasks),
      headers: { ...jsonHeader, ...authHeader },
      method: "POST",
   });

export const deleteTasks = (words: Array<string>) =>
   fetch(`${API_URL}/task`, {
      body: JSON.stringify(words),
      headers: { ...jsonHeader, ...authHeader },
      method: "DELETE",
   });

export const putTask = (task: ITask) =>
   fetch(`${API_URL}/task`, {
      body: JSON.stringify(task),
      headers: { ...jsonHeader, ...authHeader },
      method: "PUT",
   });

export const getBooks = () =>
   getJson<Array<IBook>>(`${API_URL}/book`, { headers: authHeader });

export const getBook = (bid: string) =>
   fetch(`${API_URL}/book/${bid}`, { headers: authHeader, redirect: "follow" });

export const postBook = (name: string, words: string, disc?: string) =>
   fetch(url(`${API_URL}/book`, { name, disc }), {
      body: words,
      headers: { ...textHeader, ...authHeader },
      method: "POST",
   });

export const putBook = (name: string, words: string, disc?: string) =>
   fetch(url(`${API_URL}/book`, { name, disc }), {
      body: words,
      headers: { ...textHeader, ...authHeader },
      method: "PUT",
   });

export const deleteBook = (name: string) =>
   fetch(url(`${API_URL}/wordlist`, { name }), {
      headers: authHeader,
      method: "DELETE",
   });

export const getVocabularyChecksum = () =>
   fetch(`${API_URL}/vocabulary/checksum`);
export const getVocabulary = () => fetch(`${API_URL}/vocabulary`);
export const postVocabulary = (words: string) =>
   fetch(`${API_URL}/vocabulary`, {
      body: words,
      headers: { ...textHeader, ...authHeader },
      method: "POST",
   });
export const deleteVocabulary = (words: string) =>
   fetch(`${API_URL}/vocabulary`, {
      body: words,
      headers: { ...textHeader, ...authHeader },
      method: "DELETE",
   });

export const getSound = (surl: string) =>
   fetch(url(`${API_URL}/sound`, { q: surl }), { cache: "force-cache" });

export const postSetting = (setting: ISetting) =>
   fetch(`${API_URL}/setting`, {
      body: JSON.stringify(setting),
      headers: { ...jsonHeader, ...authHeader },
      method: "POST",
   });

export const getIssues = () =>
   getJson<Array<IIssue>>(`${API_URL}/issue`, {
      headers: authHeader,
   });

export const postIssue = (issue: string) =>
   fetch(`${API_URL}/issue`, {
      body: JSON.stringify({ issue }),
      headers: { ...jsonHeader, ...authHeader },
      method: "POST",
   });

export const deleteIssue = (_id: string) =>
   getJson(url(`${API_URL}/issue`, { id: _id }), {
      headers: authHeader,
      method: "DELETE",
   });

export const getEcdictAsIssue = () =>
   fetch(`${API_URL}/ecdict-as-issue`, {
      headers: authHeader,
   });
