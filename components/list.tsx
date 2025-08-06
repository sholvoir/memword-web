import { type Accessor, For, type JSX, type Signal } from "solid-js";
import type { DivTargeted } from "./targeted.ts";

export default <T,>(
	props: {
		options: Array<T>;
		func: (t: T) => string;
		cindex: Signal<number>;
		activeClass?: string;
	} & JSX.HTMLAttributes<HTMLDivElement>,
) => {
	const [cindex, setCIndex] = props.cindex;
	const handleClick = (i: Accessor<number>, e: MouseEvent & DivTargeted) => {
		e.stopPropagation();
		setCIndex(i());
		if (props.onClick)
			typeof props.onClick === "function"
				? props.onClick(e)
				: props.onClick[0](props.onClick[1], e);
	};
	return (
		<For each={props.options}>
			{(option, i) => (
				<div
					onClick={[handleClick, i]}
					class={`${props.class ?? ""} ${cindex() === i() ? props.activeClass : ""}`}
				>
					{props.func(option)}
				</div>
			)}
		</For>
	);
};
