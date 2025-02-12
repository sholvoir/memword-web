import { JSX } from "preact/jsx-runtime";
import { aggrToBAggr } from "../lib/istat.ts";
import * as app from "../lib/app.ts";
import Stat from './stat.tsx';

const sum = (s: number, b: number) => s + b;
const max = (a: number, b: number) => a > b ? a : b

export default (props: JSX.HTMLAttributes<HTMLDivElement>) => {
    const getResult = () => {
        const result = [] as Array<JSX.Element>;
        for (const stat of app.stats.value) {
            const width = stat.total.reduce(max) * 1.2;
            const totalSum = stat.total.reduce(sum);
            const taskSum = stat.task.reduce(sum);
            result.push(<Stat onTitleClick={() => app.startStudy(stat.wlid)}
                onItemClick={(blevel) => app.startStudy(stat.wlid, blevel)}
                title={`${stat.disc} - ${taskSum}|${totalSum}`} width={width}
                total={aggrToBAggr(stat.total)}
                task={aggrToBAggr(stat.task)} />)
        }
        return result;
    }
    return <div {...props}><div className="p-2 flex flex-wrap justify-between gap-4">{getResult()}</div></div>;
}