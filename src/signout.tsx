import * as app from "./app.tsx";
import * as mem from '../lib/mem.ts';
import Button from '../components/button-ripple';
import Dialog from './dialog.tsx';

export default () => {
    const handleSignoutClick = () => {
        app.user.value = '';
        app.go();
        mem.signout();
    };
    return <Dialog title="登出" onBackClick={()=>app.go()}>
        <div class="p-2 h-full w-64 mx-auto flex flex-col gap-4">
            <div class="flex gap-2">
                <Button class="button btn-normal grow" onClick={()=>app.go()}>取消</Button>
                <Button class="button btn-prime grow" onClick={handleSignoutClick}>登出</Button>
            </div>
        </div>
    </Dialog>;
}