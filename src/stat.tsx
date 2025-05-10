import { splitID } from "../../memword-server/lib/iwordlist.ts";
import { aggrToBAggr, BLevelName, type IStat } from "../lib/istat.ts";
import * as app from './app.tsx';

const sum = (s: number, b: number) => s + b;
const max = (a: number, b: number) => a > b ? a : b;

export default ({stat}: {stat: IStat}) => {
    const totals = aggrToBAggr(stat.total);
    const tasks = aggrToBAggr(stat.task);
    const width = totals.reduce(max) * 1.2;
    const totalSum = stat.total.reduce(sum);
    const taskSum = stat.task.reduce(sum);
    const wlname = stat.wlid ? splitID(stat.wlid)[1] : '';
    const title = `${stat.disc??wlname} - ${taskSum}|${totalSum}`;
    const blevelBar = (blevel: number) => {
        const total = totals[blevel];
        const task = tasks[blevel];
        return <>
            <div class="text-left">{BLevelName[blevel]}</div>
            <div class="relative bg-[var(--bg-title)] h-6 py-1 w-full hover:cursor-pointer">
                <div class="my-auto h-4 bg-slate-400" style={{width: `${width ? (total * 100 / width) : 100}%`}}>
                    <div class="ml-auto h-full bg-orange-500" style={{width: `${total ? (task * 100 / total) : 0}%`}}/>
                </div>
                <div class="absolute top-0 right-1">{task}|{total}</div>
            </div>
        </>
    }
    return <div class="grow min-w-80 grid gap-x-1 grid-cols-[max-content_1fr] items-center">
        <div class="col-span-2 text-center font-bold">
            <button type="button" class="hover:cursor-pointer hover:underline" onClick={()=>app.startStudy(stat.wlid)}>{title}</button>
        </div>
        {[0,1,2,3,4,5].map(blevelBar)}
    </div>
}
//onTitleClick, onItemClick, title, width, total, task