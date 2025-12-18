import { getJson, getRes, requestInit } from "@sholvoir/generic/http";
import type { IBook } from "@sholvoir/memword-common/ibook";
import type { IDict, IEntry } from "@sholvoir/memword-common/idict";
import type { IIssue } from "@sholvoir/memword-common/iissue";
import type { ISetting } from "@sholvoir/memword-common/isetting";
import type { ITask } from "@sholvoir/memword-common/itask";
import { API_URL } from "./common.ts";

export const otp = (name: string) => getRes(`${API_URL}/otp`, { name });

export const signup = (phone: string, name: string) =>
	getRes(`${API_URL}/signup`, { phone, name });
export const signin = (name: string, code: string) =>
	getRes(`${API_URL}/signin`, { name, code });

export const getDefinition = (word: string) =>
	getJson<IEntry>(`${API_URL}/definition`, { q: word });

export const getDict = (word: string) =>
	getJson<IDict>(`${API_URL}/dict`, { q: word }, { cache: "reload" });

export const putDict = (dict: IDict) =>
	fetch(`${API_URL}/dict`, requestInit(dict, "PUT"));

export const deleteDict = (word: string) =>
	getRes(`${API_URL}/dict`, { q: word }, { method: "DELETE" });

export const postTasks = (tasks: Array<ITask>) =>
	fetch(`${API_URL}/task`, requestInit(tasks));

export const deleteTasks = (words: Array<string>) =>
	fetch(`${API_URL}/task`, requestInit(words, "DELETE"));
export const putTask = (task: ITask) =>
	fetch(`${API_URL}/task`, requestInit(task, "PUT"));

export const getBooks = () => getJson<Array<IBook>>(`${API_URL}/book`);
export const getBook = (bid: string) => fetch(`${API_URL}/book/${bid}`);

export const postBook = (name: string, words: string, disc?: string) =>
	getRes(`${API_URL}/book`, { name, disc }, { body: words, method: "POST" });

export const putBook = (name: string, words: string, disc?: string) =>
	getRes(`${API_URL}/book`, { name, disc }, { body: words, method: "PUT" });

export const deleteBook = (name: string) =>
	getRes(`${API_URL}/wordlist`, { name }, { method: "DELETE" });

export const getVocabulary = () => getJson<Array<string>>(`${API_URL}/vocabulary`);
export const postVocabulary = (words: string) =>
	fetch(`${API_URL}/vocabulary`, { body: words, method: "POST" });
export const deleteVocabulary = (words: string) =>
	fetch(`${API_URL}/vocabulary`, { body: words, method: "DELETE"});

export const getSound = (url: string) =>
	getRes(`${API_URL}/sound`, { q: url }, { cache: "force-cache" });

export const postSetting = (setting: ISetting) =>
	fetch(`${API_URL}/setting`, requestInit(setting));

export const getIssues = () => getJson<Array<IIssue>>(`${API_URL}/issue`);

export const postIssue = (issue: string) =>
	fetch(`${API_URL}/issue`, requestInit({ issue }));

export const deleteIssue = (_id: string) =>
	getJson(`${API_URL}/issue`, { id: _id }, { method: "DELETE" });

export const getEcdictAsIssue = () => fetch(`${API_URL}/ecdict-as-issue`);