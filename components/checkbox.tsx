import { type JSX, type Signal, splitProps } from "solid-js";
import type { DivTargeted } from "./targeted.ts";
import "./checkbox.css";

export default (
	props: {
		binding: Signal<boolean>;
		label?: string;
		disabled?: boolean;
	} & JSX.HTMLAttributes<HTMLDivElement>,
) => {
	const [local, others] = splitProps(props, [
		"class",
		"binding",
		"label",
		"disabled",
		"onChange",
	]);
	const [value, setValue] = local.binding;
	const handleClick = (e: MouseEvent & DivTargeted) => {
		e.stopPropagation();
		if (!local.disabled) {
			setValue((v) => !v);
			if (local.onChange)
				typeof local.onChange === "function"
					? local.onChange(e)
					: local.onChange[0](local.onChange[1], e);
		}
	};
	return (
		<div
			class={`${local.disabled ? "opacity-50" : ""} ${local.class ?? ""}`}
			{...others}
			aria-disabled={local.disabled}
			onClick={handleClick}
		>
			<span
				class={`text-[150%] align-bottom icon--material-symbols ${
					value()
						? "icon--material-symbols--check-box-outline"
						: "icon--material-symbols--check-box-outline-blank"
				}`}
			/>
			{local.label}
		</div>
	);
};
