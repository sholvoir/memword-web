import { createSignal, type JSX, type Signal, splitProps } from "solid-js";
import type { InputTargeted } from "./targeted.ts";

export default (
	props: {
		binding: Signal<number | undefined>;
		invalidClass?: string;
	} & JSX.InputHTMLAttributes<HTMLInputElement>,
) => {
	const [local, others] = splitProps(props, ["binding", "class"]);
	const [value, setValue] = local.binding;
	const [invalid, setInvalid] = createSignal(true);
	const handleInput = (e: InputEvent & InputTargeted) => {
		const num = +e.currentTarget.value;
		if (Number.isNaN(num)) return setInvalid(false);
		setValue(num);
	};
	return (
		<input
			class={`${
				invalid() ? (props.invalidClass ?? "text-red-500") : ""
			} ${local.class ?? ""}`}
			{...others}
			value={value()}
			onInput={handleInput}
		/>
	);
};
