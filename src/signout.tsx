import * as app from "./app.tsx";
import * as mem from '../lib/mem.ts';
import Button from '../components/button-ripple.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const handleSignoutClick = () => {
        app.user.value = '';
        app.go();
        mem.signout();
    };
    return <Dialog class="p-2 flex flex-col" title="登出" onBackClick={()=>app.go()}>
        <div class="w-64 m-auto flex gap-2">
            <Button class="button btn-normal grow" onClick={()=>app.go()}>取消</Button>
            <Button class="button btn-prime grow" onClick={handleSignoutClick}>登出</Button>
        </div>
    </Dialog>;
}