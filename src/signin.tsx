import { useSignal } from "@preact/signals";
import { STATUS_CODE } from "@sholvoir/generic/http";
import * as app from "./app.tsx";
import * as mem from '../lib/mem.ts';
import * as srv from '../lib/server.ts';
import Button from '../components/button-ripple.tsx';
import AButton from '../components/button-base.tsx';
import SInput from '../components/input-simple.tsx';
import Dialog from './dialog.tsx';

let timer: number | undefined;

export default () => {
    const code = useSignal('');
    const counter = useSignal(0);
    const canSendOTP = useSignal(true);

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
        try {
            switch ((await srv.otp(app.name.value)).status) {
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
                default: app.showTips('未知服务器错误');
            }
        } catch {
            app.showTips('网络错误');
        }
    };

    const handleClickLogin = async () => {
        try {
            switch (await mem.signin(app.name.value, code.value)) {
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
                    break;
                default: app.showTips('未知服务器错误');
            }
        } catch {
            app.showTips('网络错误');
        }
    };
    return <Dialog class="p-2 flex flex-col" title="登录" onBackClick={() => app.go()}>
        <div class="w-64 m-auto flex flex-col">
            <label for="name">用户名</label>
            <SInput name="name" class="mb-3" placeholder="name" autoCapitalize="none" binding={app.name} />
            <label for="code">临时密码</label>
            <SInput name="code" placeholder="code" autoCapitalize="none" binding={code} />
            <AButton class="btn-anchor block text-right mb-3" onClick={handleSend} disabled={!canSendOTP.value}>
                Send One-Time Passcode {counter.value > 0 ? `(${counter.value})` : ''}
            </AButton>
            <Button class="button btn-prime" onClick={handleClickLogin}>登录</Button>
        </div>
    </Dialog>;
}