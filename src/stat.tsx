import { BLevelName, TBAggr } from "../lib/istat.ts";

interface IStatProps {
    onTitleClick: () => void;
    onItemClick: (blevel: number) => void
    title: string;
    width: number;
    total: TBAggr;
    task: TBAggr;
}
export default ({onTitleClick, onItemClick, title, width, total, task}: IStatProps) =>
    <div className="grow min-w-80 grid gap-x-1 grid-cols-[max-content_1fr] items-center">
        <div className="col-span-2 text-center font-bold">
            <a className="hover:cursor-pointer hover:underline" onClick={onTitleClick}>{title}</a>
        </div>
        {[0,1,2,3,4,5].map(blevel => {
            const value = total[blevel];
            const t = task[blevel];
            return <>
                <div className="text-left">{BLevelName[blevel]}</div>
                <div className="relative bg-slate-300 dark:bg-slate-700 h-6 py-1 w-full hover:cursor-pointer"
                    onClick={(ev) => (ev.stopPropagation(), onItemClick(blevel))}>
                    <div className="my-auto h-4 bg-slate-400" style={{width: `${width ? (value * 100 / width) : 100}%`}}>
                        <div className="ml-auto h-full bg-orange-500" style={{width: `${value ? (t * 100 / value) : 0}%`}}/>
                    </div>
                    <div className="absolute top-0 right-1">{task}|{value}</div>
                </div>
            </>
        })}
    </div>