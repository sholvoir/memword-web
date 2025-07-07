import type { IStat } from "../lib/istat.ts";
import * as app from "./app.tsx";
import Button from '../components/button-ripple.tsx';
import Dialog from './dialog.tsx';
import Stat from './stat.tsx';

export default () => <Dialog class="flex flex-col" title="学习进度">
    <div class="body grow overflow-y-auto">
        <div class="p-2 flex flex-wrap justify-between gap-4">
            {app.stats.value.stats.map((stat: IStat) => <Stat key={`${stat.time}${stat.wlid}`} stat={stat} />)}
        </div>
    </div>
    <div class="tail shrink-0 px-4 pt-2 pb-5 flex gap-3 justify-between [&>button]:grow [&>button]:min-w-[80px] [&>button>i]:text-4xl font-bold overflow-x-auto [scrollbar-width:none]">
        <Button onClick={() => app.go('#search')}>
            <i class="i-material-symbols-dictionary-outline" /><br />词典
        </Button>
        <Button onClick={() => app.startStudy()}>
            <i class="i-hugeicons-online-learning-01" /><br />学习
        </Button>
        <Button onClick={() => app.go('#wordlists')}>
            <i class="i-material-symbols-book-3-rounded" /><br />词书
        </Button>
        <Button onClick={() => app.go('#setting')}>
            <i class="i-material-symbols-settings" /><br />设置
        </Button>
        <Button onClick={() => app.go('#issue')}>
            <i class="i-material-symbols-volume-up" /><br />问题
        </Button>
        <Button onClick={() => app.go('#about')}>
            <i class="i-arcticons-goabout" /><br />关于
        </Button>
        <Button onClick={() => app.go('#help')}>
            <i class="i-material-symbols-help-outline" /><br />帮助
        </Button>
    </div>
</Dialog>