import { signal } from "@preact/signals";
import { STATUS_CODE } from "@sholvoir/generic/http";
import * as mem from '../lib/mem.ts';
import * as app from "../lib/app.ts";
import Button from './button-ripple.tsx';
import TInput from './input-text.tsx';
import Dialog from './dialog.tsx';

const namePattern = /^[_\w-]+$/;
const fonePattern = /^\+\d+$/;
const phone = signal('');
export const name = signal('');

const handleSignup = async () => {
    if (!namePattern.test(name.value))
        return app.showTips('Name can only include _, letter, number and -');
    const fone = phone.value.replaceAll(/[\(\) -]/g, '');
    if (!fonePattern.test(fone))
        return app.showTips('Invalid phone number!');
    switch (await mem.signup(fone, name.value)) {
        case STATUS_CODE.BadRequest:
            return app.showTips('用户名已注册');
        case STATUS_CODE.Conflict:
            return app.showTips('电话号码已注册');
        case STATUS_CODE.OK:
            app.showTips('注册成功，请登录');
            app.closeDialog();
            app.showDialog('signin');
    }
};

export default () => <Dialog title="注册">
    <div className="p-2 h-full w-64 mx-auto flex flex-col gap-4">
        <TInput name="name" placeholder="name" autoCapitalize="none" binding={name} />
        <TInput name="phone" placeholder="+1(987)765-5432" autoCapitalize="none" binding={phone} />
        <Button className="button btn-prime" onClick={handleSignup}>注册</Button>
    </div>
</Dialog>;