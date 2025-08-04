import { For } from "solid-js";
import type { IStat } from "../lib/istat.ts";
import * as app from "./app.tsx";
import Button from '../components/button-ripple.tsx';
import Dialog from './dialog.tsx';
import Stat from './stat.tsx';

export default () => <Dialog class="flex flex-col" title="学习进度">
    <div class="body grow overflow-y-auto">
        <div class="p-2 flex flex-wrap justify-between gap-4">
            <For each={app.stats[0]().stats}>{(stat: IStat) =>
                <Stat stat={stat} />
            }</For>
        </div>
    </div>
    <div class="tail shrink-0 px-4 pt-2 pb-5 flex gap-3 justify-between [&>button]:grow [&>button>span]:align-[-30%] [&>button]:min-w-[110px] [&>button>span]:text-4xl font-bold overflow-x-auto [scrollbar-width:none]">
        <Button onClick={() => app.go('#search')}>
            <span class="icon-[material-symbols--dictionary]"></span> 词典
        </Button>
        <Button onClick={() => app.startStudy()}>
            <span class="icon-[hugeicons--online-learning-01]"></span> 学习
        </Button>
        <Button onClick={() => app.go('#setting')}>
            <span class="icon-[material-symbols--settings]"></span> 设置
        </Button>
        <Button onClick={() => app.go('#about')}>
            <span class="icon-[tabler--info-octagon]"></span> 关于
        </Button>
        <Button onClick={() => app.go('#issue')}>
            <span class="icon-[material-symbols--error-outline]"></span> 问题
        </Button>
        <Button onClick={() => app.go('#help')}>
            <span class="icon-[material-symbols--help-outline]"></span> 帮助
        </Button>
    </div>
</Dialog>