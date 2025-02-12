import * as app from "../lib/app.ts";
import * as mem from '../lib/mem.ts';
import Button from './button-ripple.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const handleSignoutClick = () => {
        app.user.value = '';
        app.closeDialog();
        mem.signout();
    };
    return <Dialog title="登出">
        <div className="p-2 h-full w-64 mx-auto flex flex-col gap-4">
            <div className="flex gap-2">
                <Button className="button btn-normal grow" onClick={app.closeDialog}>取消</Button>
                <Button className="button btn-prime grow" onClick={handleSignoutClick}>登出</Button>
            </div>
        </div>
    </Dialog>;
}