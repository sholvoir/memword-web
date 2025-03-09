import { useEffect } from "preact/hooks";
import { useSignal, useSignalEffect } from "@preact/signals";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import { settingFormat } from "../../memword-server/lib/isetting.ts";
import { now } from "../../memword-server/lib/common.ts";
import { compareWL, IWordList } from "../../memword-server/lib/iwordlist.ts";
import Dialog from './dialog.tsx';
import Input from '../components/input-simple.tsx';
import Button from '../components/button-ripple.tsx';
import List from '../components/list.tsx';

export default () => {
    const filter = useSignal('^common');
    const mindex = useSignal(0);
    const wls = useSignal<Array<IWordList>>([]);
    const cindex = useSignal(0);
    const mwls = useSignal<Array<IWordList>>([]);
    const handleAddSubClick = () => {
        mwls.value = [...mwls.value, wls.value[cindex.value]];
    }
    const handleDeleteSubClick = () => {
        mwls.value = [...mwls.value.slice(0, mindex.value),
        ...mwls.value.slice(mindex.value + 1)];
    }
    const handleAddTaskClick = async () => {
        app.loading.value = true;
        await mem.addTasks(mwls.value[mindex.value].wlid);
        await app.totalStats();
        app.loading.value = false;
        app.go('#home');
    }
    const handleOKClick = async () => {
        await mem.syncSetting({
            format: settingFormat,
            version: now(),
            books: mwls.value.map(wl => wl.wlid)
        });
        await app.totalStats();
        app.go();
    }
    const init = async () => {
        wls.value = (await mem.getServerWordlist())
            .filter(wl => wl.wlid.startsWith('common'))
            .sort(compareWL);
        mwls.value = await mem.getWordlists(wl =>
            mem.setting.books.includes(wl.wlid));
    }
    useSignalEffect(() => {
        (async () => {
            const regex = new RegExp(filter.value);
            wls.value = (await mem.getWordlists(wl => regex.test(wl.wlid) ||
                (wl.disc && regex.test(wl.disc)))).sort(compareWL);
        })()
    });
    useEffect(() => { init() }, []);
    return <Dialog class="p-2 gap-2 flex flex-col" title="设置"
        onBackClick={() => app.go()}>
        <div class="flex gap-2">
            <label for="filter">设置过滤</label>
            <Input class="grow" name="filter" binding={filter} />
        </div>
        <fieldset class="border rounded max-h-[50%] grow overflow-y-auto">
            <legend>可用的词书</legend>
            <List class="px-2" cindex={cindex}
                options={wls.value.map(wl => wl.disc ?? wl.wlid)}
                activeClass="bg-[var(--bg-title)]" />
        </fieldset>
        <div class="flex justify-between gap-2">
            <Button class="button btn-normal grow"
                onClick={handleAddSubClick}>添加订阅</Button>
            <Button class="button btn-normal grow"
                onClick={handleDeleteSubClick}>删除订阅</Button>
        </div>
        <fieldset class="border rounded max-h-[50%] grow overflow-y-auto">
            <legend>我订阅的词书</legend>
            <List class="px-2" cindex={mindex}
                options={mwls.value.map(wl => wl.disc ?? wl.wlid)}
                activeClass="bg-[var(--bg-title)]" />
        </fieldset>
        <div class="pb-3 flex justify-between gap-2">
            <Button class="button btn-normal grow"
                onClick={handleAddTaskClick}>添加任务</Button>
            <Button class="button btn-normal grow"
                onClick={() => app.go()}>取消</Button>
            <Button class="button btn-prime grow"
                onClick={handleOKClick}>保存</Button>
        </div>
    </Dialog>
}