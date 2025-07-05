import type { IStat } from "../lib/istat.ts";
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import Stat from './stat.tsx';

export default () => <Dialog title="学习进度"
    class="body overflow-y-auto p-2 flex flex-wrap justify-between content-start gap-4">
    {app.stats.value.stats.map((stat: IStat)=>
        <Stat key={`${stat.time}${stat.wlid}`} stat={stat}/>)}
</Dialog>