import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { IWordList } from "../../memword-server/lib/iwordlist.ts";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import Button from '../components/button-ripple';
import List from '../components/list';

export default () => {
    const cindex = useSignal(0);
    const wls = useSignal<Array<IWordList>>([]);
    const handleNewClick = () => {
        app.wlid.value = '';
        app.go('#wordlist');
    }
    const handleDeleteClick = async () => {
        await mem.deleteWordList(wls.value[cindex.value].wlid);
        wls.value = [...wls.value.slice(0, cindex.value), ...wls.value.slice(cindex.value + 1)];
    }
    const handleUpdateClick = () => {
        app.wlid.value = wls.value[cindex.value].wlid;
        app.go('#wordlist');
    }
    const init = async () => {
        wls.value = (await mem.getWordlists(wl => wl.wlid.startsWith(app.user.value)));
    }
    useEffect(() => {init()}, []);
    return <Dialog title="我的词书" onBackClick={()=>app.go()}>
        <div class="p-2 h-full flex flex-col gap-2">
            <div class="shrink grow border overflow-y-auto">
                <List cindex={cindex} options={wls.value.map(wl=>wl.disc??wl.wlid)}/>
            </div>
            <div class="flex justify-end gap-2 pb-2">
                <Button class="w-24 button btn-normal" name="new" onClick={handleNewClick}>新建</Button>
                <Button class="w-24 button btn-normal" name="delete" disabled={!wls.value.length} onClick={handleDeleteClick}>删除</Button>
                <Button class="w-24 button btn-normal" name="update" disabled={!wls.value.length} onClick={handleUpdateClick}>更新</Button>
            </div>
        </div>
    </Dialog>
}