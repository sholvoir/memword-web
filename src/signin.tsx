import { signal } from "@preact/signals";
import { STATUS_CODE } from "@sholvoir/generic/http";
import * as mem from '../lib/mem.ts';
import * as app from "../lib/app.ts";
import Button from './button-ripple.tsx';
import AButton from './button-base.tsx';
import TInput from './input-text.tsx';
import Dialog from './dialog.tsx';
import { name } from './signup.tsx';

const code = signal('');
const counter = signal(0);
const canSendOTP = signal(true);

let timer: number|undefined;
const handleSend = async () => {
    canSendOTP.value = false;
    counter.value = 60;
    timer = setInterval(() => {
        if (--counter.value <= 0) {
            clearInterval(timer);
            timer = undefined;
            canSendOTP.value = true;
        }
    }, 1000);
    switch (await mem.otp(name.value)) {
        case STATUS_CODE.BadRequest:
            return app.showTips('请输入用户名');
        case STATUS_CODE.NotFound:
            return app.showTips('未找到用户');
        case STATUS_CODE.FailedDependency:
            return app.showTips('此用户未注册手机号码');
        case STATUS_CODE.TooEarly:
            return app.showTips('请求OTP过于频繁');
        case STATUS_CODE.OK:
            return app.showTips('OTP已发送');
        default: return app.showTips('未知服务器错误');
    }
};

const handleClickLogin = async () => {
    switch (await mem.signin(name.value, code.value)) {
        case STATUS_CODE.BadRequest:
            return app.showTips('请输入用户名和密码');
        case STATUS_CODE.NotFound:
            return app.showTips('未找到用户');
        case STATUS_CODE.Unauthorized:
            return app.showTips('错误的密码');
        case STATUS_CODE.OK:
            app.showTips('已登录');
            if (timer) clearInterval(timer);
            location.reload();
    }
};

export default () => <Dialog title="登录">
    <div className="p-2 h-full w-64 mx-auto flex flex-col gap-4">
        <TInput name="name" placeholder="name" autoCapitalize="none" binding={name} />
        <AButton className="btn-anchor block text-right" onClick={handleSend} disabled={!canSendOTP.value}>
            Send One-Time Passcode {counter.value > 0 ? `(${counter.value})` : ''}
        </AButton>
        <TInput name="code" placeholder="code" autoCapitalize="none" binding={code} />
        <Button className="button btn-prime" onClick={handleClickLogin}>登录</Button>
    </div>
</Dialog>;