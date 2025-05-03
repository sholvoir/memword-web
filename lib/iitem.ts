import { now } from "../../memword-server/lib/common.ts";
import type { IDict } from "../../memword-server/lib/idict.ts";
import type { ITask } from '../../memword-server/lib/itask.ts';

export interface IItem extends IDict, ITask {
    dictSync?: number
}

export const neverItem = (word: string, time: number): IItem =>
    ({ word, last: time, next: time, level: 0 });

export const newItem = (dict: IDict): IItem => {
    const time = now();
    return { word: dict.word, cards: dict.cards, level: 0,
        last: time, next: time, dictSync: time
    }
};

export const item2task = ({word, last, next, level}: IItem): ITask => ({word, last, next, level});

export const itemMergeTask = (item: IItem, task: ITask) => {
    item.last = task.last;
    item.next = task.next;
    item.level = task.level;
    return item;
};

export const itemMergeDict = (item: IItem, dict: IDict) => {
    item.cards = dict.cards;
    if (dict.version !== undefined) item.version = dict.version;
    return item;
}
