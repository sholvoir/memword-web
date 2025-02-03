import { closeDialog, signals } from "../lib/signals.ts";
import { logout } from '../lib/mem.ts';
import Button from './button-ripple.tsx';
import Dialog from './dialog.tsx';

export default () => {
    const handleSignoutClick = () => {
        signals.user.value = '';
        closeDialog();
        logout();
    };
    return <Dialog title="登出">
        <div className="p-2 h-full w-64 mx-auto flex flex-col gap-4">
            <div className="flex gap-2">
                <Button className="button btn-normal grow" onClick={closeDialog}>取消</Button>
                <Button className="button btn-prime grow" onClick={handleSignoutClick}>登出</Button>
            </div>
        </div>
    </Dialog>;
}