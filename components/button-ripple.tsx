import { createSignal, type JSX, Show, splitProps } from "solid-js";
import type { ButtonTargeted } from "./targeted.ts";
import "./animation-ripple.css";
import ButtonBase from "./button-base.tsx";

export default (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => {
	const [local, others] = splitProps(props, ["class", "children", "onClick"]);
	const [showRipple, setShowRipple] = createSignal(false);
	const [rippleStyle, setRippleStyle] = createSignal({});
	const handleClick = (e: MouseEvent & ButtonTargeted) => {
		const btn = e.currentTarget;
		const diameter = Math.max(btn.clientWidth, btn.clientHeight);
		const radius = diameter / 2;
		setRippleStyle({
			width: `${diameter}px`,
			height: `${diameter}px`,
			left: `${e.offsetX - radius}px`,
			top: `${e.offsetY - radius}px`,
		});
		setShowRipple(true);
		setTimeout(() => setShowRipple(false), 580);
		if (local.onClick)
			typeof local.onClick === "function"
				? local.onClick(e)
				: local.onClick[0](local.onClick[1], e);
	};
	return (
		<ButtonBase
			class={`overflow-hidden relative ${local.class ?? ""}`}
			{...others}
			onClick={handleClick}
		>
			{local.children}
			<Show when={showRipple()}>
				<span
					style={rippleStyle()}
					class="absolute transform-[scale(0)] rounded-[50%]
                    bg-(--bg-ripple)/80 animate-[ripple_600ms_linear_0s]"
				/>
			</Show>
		</ButtonBase>
	);
};
