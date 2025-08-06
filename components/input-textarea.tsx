import { type JSX, type Signal, splitProps } from "solid-js";

export default (
	props: {
		binding: Signal<string>;
	} & JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
) => {
	const [local, others] = splitProps(props, ["binding"]);
    const [value, setValue] = local.binding;
	return (
		<textarea
			{...others}
			value={value()}
			onInput={(e) => setValue(e.currentTarget.value)}
		/>
	);
};
