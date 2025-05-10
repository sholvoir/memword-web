import type { IStat } from "../lib/istat.ts";
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import Button from '../components/button-ripple.tsx';
import Stat from './stat.tsx';
import IconDict from "./icon-dict.tsx";
import IconStudy from "./icon-study.tsx";
import IconMe from "./icon-me.tsx";

export default () => <Dialog class="flex flex-col" title="学习进度">
    <div class="body grow overflow-y-auto">
        <div class="p-2 flex flex-wrap justify-between gap-4">
            {app.stats.value.stats.map((stat: IStat)=><Stat key={`${stat.time}${stat.wlid}`} stat={stat}/>)}
        </div>
    </div>
    <div class="tail shrink-0 px-4 pt-2 pb-5 flex gap-3 justify-between [&>button]:grow font-bold">
        <Button onClick={()=>app.go('#search')}><IconDict class="w-9 h-9 inline-block"/>词典</Button>
        <Button onClick={()=>app.startStudy()}><IconStudy  class="w-9 h-9 inline-block"/>学习</Button>
        <Button onClick={()=>app.go('#menu')}><IconMe class="w-9 h-9 inline-block"/>我</Button>
    </div>
</Dialog>