import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { type IWordList, compareWL } from "../../memword-server/lib/iwordlist.ts";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import Button from '../components/button-ripple.tsx';
import List from '../components/list.tsx';

export default () => {
    const cindex = useSignal(0);
    const wls = useSignal<Array<IWordList>>([]);
    const handleNewClick = () => {
        app.wl.value = undefined;
        app.go('#wordlist');
    }
    const handleDeleteClick = async () => {
        app.showTips(await mem.deleteWordList(wls.value[cindex.value].wlid) ?
            '删除成功': '删除失败');
        wls.value = [...wls.value.slice(0, cindex.value),
            ...wls.value.slice(cindex.value + 1)];
    }
    const handleUpdateClick = () => {
        app.wl.value = wls.value[cindex.value];
        app.go('#wordlist');
    }
    const init = async () => {
        wls.value = (await mem.getServerWordlist())
            .filter(wl => wl.wlid.startsWith(app.user.value))
            .sort(compareWL);
    }
    useEffect(() => {init()}, []);
    return <Dialog class="p-2 flex flex-col gap-2" title="我的词书">
        <div class="h-0 grow border overflow-y-auto">
            <List cindex={cindex} options={wls.value.map(wl=>wl.disc??wl.wlid)}
                class="px-2" activeClass="bg-[var(--bg-title)]"/>
        </div>
        <div class="pb-3 flex justify-end gap-2">
            <Button class="w-24 button btn-normal" name="cancel" onClick={()=>app.go()}>取消</Button>
            <Button class="w-24 button btn-normal" name="new" onClick={handleNewClick}>新建</Button>
            <Button class="w-24 button btn-normal" name="delete" disabled={!wls.value.length} onClick={handleDeleteClick}>删除</Button>
            <Button class="w-24 button btn-normal" name="update" disabled={!wls.value.length} onClick={handleUpdateClick}>更新</Button>
        </div>
    </Dialog>
}