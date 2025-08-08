/** biome-ignore-all lint/suspicious/noExplicitAny: <No> */
import { STATUS_CODE } from "@sholvoir/generic/http";
import { createSignal } from "solid-js";
import AButton from "../components/button-base.tsx";
import BButton from "../components/button-base.tsx";
import Button from "../components/button-ripple.tsx";
import SInput from "../components/input-simple.tsx";
import * as mem from "../lib/mem.ts";
import * as srv from "../lib/server.ts";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";

let timer: any;

export default () => {
	const [code, setCode] = createSignal("");
	const [counter, setCounter] = createSignal(0);
	const [canSendOTP, setCanSendOTP] = createSignal(true);

	const handleSend = async () => {
		setCanSendOTP(false);
		setCounter(60);
		timer = setInterval(() => {
			if (setCounter((c) => c - 1) <= 0) {
				clearInterval(timer);
				timer = undefined;
				setCanSendOTP(true);
			}
		}, 1000);
		try {
			switch ((await srv.otp(app.name())).status) {
				case STATUS_CODE.BadRequest:
					return app.showTips("请输入用户名");
				case STATUS_CODE.NotFound:
					return app.showTips("未找到用户");
				case STATUS_CODE.FailedDependency:
					return app.showTips("此用户未注册手机号码");
				case STATUS_CODE.TooEarly:
					return app.showTips("请求OTP过于频繁");
				case STATUS_CODE.OK:
					return app.showTips("OTP已发送");
				default:
					app.showTips("未知服务器错误");
			}
		} catch {
			app.showTips("网络错误");
		}
	};

	const handleClickLogin = async () => {
		try {
			switch (await mem.signin(app.name(), code())) {
				case STATUS_CODE.BadRequest:
					return app.showTips("请输入用户名和密码");
				case STATUS_CODE.NotFound:
					return app.showTips("未找到用户");
				case STATUS_CODE.Unauthorized:
					return app.showTips("错误的密码");
				case STATUS_CODE.OK:
					app.showTips("已登录");
					if (timer) clearInterval(timer);
					location.reload();
					break;
				default:
					app.showTips("未知服务器错误");
			}
		} catch {
			app.showTips("网络错误");
		}
	};
	return (
		<Dialog
			class="p-2 flex flex-col"
			title="登录"
			left={
				<BButton
					class="text-[150%] icon-[material-symbols--chevron-left] align-bottom"
					onClick={() => app.go()}
				/>
			}
		>
			<div class="w-64 m-auto flex flex-col">
				<label for="name">用户名</label>
				<SInput
					name="name"
					class="mb-3"
					placeholder="name"
					autoCapitalize="none"
					binding={[app.name, app.setName]}
				/>
				<label for="code">临时密码</label>
				<SInput
					name="code"
					placeholder="code"
					autoCapitalize="none"
					binding={[code, setCode]}
				/>
				<AButton
					class="btn-anchor block text-right mb-3"
					onClick={handleSend}
					disabled={!canSendOTP()}
				>
					Send One-Time Passcode {counter() > 0 ? `(${counter()})` : ""}
				</AButton>
				<Button class="button btn-prime" onClick={handleClickLogin}>
					登录
				</Button>
			</div>
		</Dialog>
	);
};
