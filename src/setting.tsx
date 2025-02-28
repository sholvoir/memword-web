import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import { settingFormat } from "../../memword-server/lib/isetting.ts";
import { now } from "../../memword-server/lib/common.ts";
import { IWordList } from "../../memword-server/lib/iwordlist.ts";
import { Option } from "@sholvoir/components/options";
import Dialog from './dialog.tsx';
import Button from '@sholvoir/components/button-ripple';
import List from '@sholvoir/components/list';

const wl2option = (wl: IWordList): Option => ({ value:wl.wlid, label: wl.disc??wl.wlid });
export default () => {
    const myCIndex = useSignal(0);
    const sysCIndex = useSignal(0);
    const books = useSignal<Array<string>>([]);
    const serverWls = useSignal<Array<IWordList>>([]);
    const myWls = useSignal<Array<IWordList>>([]);
    const handleOKClick = () => {
        mem.setSetting({format: settingFormat, version: now(), books: books.value});
        app.go();
    }
    const init = async () => {
        const setting = await mem.getSetting();
        //await mem.getServerWordlist()
        books.value = setting.books;
    }
    useEffect(() => {init()}, []);
    return <Dialog className="p-2 gap-2" title="设置">
        <List class="grow border" cindex={sysCIndex}
            options={serverWls.value.map(wl2option)}/>
        <div class="flex justify-end gap-2 pb-2">
            <Button class="w-24 button btn-normal" onClick={()=>app.go()}>取消</Button>
            <Button class="w-24 button btn-prime" onClick={handleOKClick}>确定</Button>
        </div>
        <label>我订阅的词书</label>
        <List class="grow border" cindex={myCIndex}
            options={myWls.value.map(wl2option)}/>
    </Dialog>
}