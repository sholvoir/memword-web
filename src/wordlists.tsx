import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { IWordList } from "../../memword-server/lib/iwordlist.ts";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import Dialog from './dialog.tsx';
import Button from '@sholvoir/components/button-ripple';
import Select from '@sholvoir/components/select-single';

export default () => {
    const wlid = useSignal('');
    const wls = useSignal<Array<IWordList>>([]);
    const handleNewClick = () => {
        app.wlid.value = '';
        app.go('#wordlist');
    }
    const handleDeleteClick = async () => {
        await mem.deleteWordList(wlid.value);
        wls.value = wls.value.filter((wl: IWordList) => wlid.value != wl.wlid);
    }
    const handleUpdateClick = () => {
        app.wlid.value = wlid.value;
        app.go();
    }
    const init = async () => {
        wls.value = (await mem.getMyWordLists())!;
    }
    useEffect(() => {init()}, []);
    return <Dialog title="我的词书" onBackClick={()=>app.go()}>
        <div class="p-2 h-full flex flex-col gap-2">
            <div class="shrink grow">
                <Select binding={wlid} options={wls.value.map((wl: IWordList) => ({value: wl.wlid, label: `${wl.wlid} ${wl.disc??''}`}))}/>
            </div>
            <div class="flex justify-end gap-2 pb-2">
                <Button class="w-24 button btn-normal" name="new" onClick={handleNewClick}>新建</Button>
                <Button class="w-24 button btn-normal" name="delete" disabled={!wlid.value.length} onClick={handleDeleteClick}>删除</Button>
                <Button class="w-24 button btn-normal" name="update" disabled={!wlid.value.length} onClick={handleUpdateClick}>更新</Button>
            </div>
        </div>
    </Dialog>
}