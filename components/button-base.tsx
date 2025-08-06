import { createSignal, type JSX, splitProps } from "solid-js";
import type { ButtonTargeted } from "./targeted.ts";

export default (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) => {
	const [local, others] = splitProps(props, [
		"class",
		"children",
		"disabled",
		"onClick",
	]);
	const [enabled, setEnabled] = createSignal(true);
	const handleClick = async (e: MouseEvent & ButtonTargeted) => {
		e.stopPropagation();
		setEnabled(false);
		if (props.onClick)
			await (typeof props.onClick === "function"
				? props.onClick(e)
				: props.onClick[0](props.onClick[1], e));
		setEnabled(true);
	};
	return (
		<button
			type="button"
			class={`disabled:opacity-50 ${local.class ?? ""}`}
			{...others}
			onClick={handleClick}
			disabled={!enabled() || local.disabled}
		>
			{local.children}
		</button>
	);
};
