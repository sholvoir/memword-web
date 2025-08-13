import { getJson, getRes, requestInit } from "@sholvoir/generic/http";
import type { IBook } from "@sholvoir/memword-common/ibook";
import type { IDict, IEntry } from "@sholvoir/memword-common/idict";
import type { IIssue } from "@sholvoir/memword-common/iissue";
import type { ISetting } from "@sholvoir/memword-common/isetting";
import type { ITask } from "@sholvoir/memword-common/itask";
import { API_URL } from "./common.ts";

export const authHead = { Authorization: "" };
export const otp = (name: string) => getRes(`${API_URL}/pub/otp`, { name });
export const signup = (phone: string, name: string) =>
	getRes(`${API_URL}/pub/signup`, { phone, name });
export const signin = (name: string, code: string) =>
	getRes(`${API_URL}/pub/signin`, { name, code });

export const getDefinition = (word: string) =>
	getJson<IEntry>(`${API_URL}/pub/definition`, { q: word });

export const getDict = (word: string) =>
	getJson<IDict>(`${API_URL}/api/v2/dict`, { q: word }, { cache: "reload" });

export const putDict = (dict: IDict) =>
	fetch(`${API_URL}/api/v2/dict`, requestInit(dict, "PUT", authHead));

export const deleteDict = (word: string) =>
	getRes(
		`${API_URL}/api/v2/dict`,
		{ q: word },
		{ method: "DELETE", headers: authHead },
	);

export const postTasks = (tasks: Array<ITask>) =>
	fetch(`${API_URL}/api/v1/task`, requestInit(tasks, "POST", authHead));

export const deleteTask = (words: Array<string>) =>
	fetch(`${API_URL}/api/v1/task`, requestInit(words, "DELETE", authHead));


export const getBooks = () => getJson<Array<IBook>>(`${API_URL}/pub/book`);

export const getBook = (bid: string) => fetch(`${API_URL}/pub/book/${bid}`);

export const postBook = (name: string, words: string, disc?: string) =>
	getRes(
		`${API_URL}/api/v1/book`,
		{ name, disc },
		{ body: words, method: "POST", headers: authHead },
	);

export const putBook = (name: string, words: string, disc?: string) =>
	getRes(
		`${API_URL}/api/v1/book`,
		{ name, disc },
		{ body: words, method: "PUT", headers: authHead },
	);

export const deleteBook = (name: string) =>
	getRes(
		`${API_URL}/api/v1/wordlist`,
		{ name },
		{ method: "DELETE", headers: authHead },
	);

export const postVocabulary = (words: string) =>
	fetch(`${API_URL}/api/v2/vocabulary`, {
		body: words,
		method: "POST",
		headers: authHead,
	});

export const getSound = (url: string) =>
	getRes(`${API_URL}/pub/sound`, { q: url }, { cache: "force-cache" });

export const postSetting = (setting: ISetting) =>
	fetch(`${API_URL}/api/v1/setting`, requestInit(setting, "POST", authHead));

export const getIssues = () =>
	getJson<Array<IIssue>>(`${API_URL}/api/v2/issue`, undefined, {
		method: "GET",
		headers: authHead,
	});

export const postIssue = (issue: string) =>
	fetch(`${API_URL}/api/v2/issue`, requestInit({ issue }, "POST", authHead));

export const deleteIssue = (_id: string) =>
	getJson(
		`${API_URL}/api/v2/issue`,
		{ id: _id },
		{ method: "DELETE", headers: authHead },
	);

export const getEcdictAsIssue = () => getRes(`${API_URL}/api/v2/ecdict-as-issue`);