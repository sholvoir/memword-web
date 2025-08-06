import { type JSX, type Signal, splitProps } from "solid-js";

export default (
	props: JSX.InputHTMLAttributes<HTMLInputElement> & {
		binding: Signal<string>;
	},
) => {
	const [local, others] = splitProps(props, ["binding"]);
    const [value, setValue] = local.binding;
	return (
		<input
			{...others}
			value={value()}
			onInput={(e) => setValue(e.currentTarget.value)}
		/>
	);
};
