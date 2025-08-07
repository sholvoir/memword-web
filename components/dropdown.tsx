import {
	type Accessor,
	createSignal,
	For,
	type JSX,
	Show,
	type Signal,
	splitProps,
} from "solid-js";
import ButtonBase from "./button-base.tsx";
import type { DivTargeted } from "./targeted.ts";

export default (
	props: {
		cindex: Signal<number>;
		options: Array<string>;
		activeClass?: string;
	} & JSX.HTMLAttributes<HTMLButtonElement>,
) => {
	const [local, others] = splitProps(props, [
		"cindex",
		"options",
		"activeClass",
		"class",
	]);
	const [cindex, setCIndex] = local.cindex;
	const [isOpen, setOpen] = createSignal(false);
	const handleItemClick = (
		i: Accessor<number>,
		e: MouseEvent & DivTargeted,
	) => {
		e.stopPropagation();
		setCIndex(i());
		setOpen(false);
	};
	return (
		<ButtonBase
			class={`relative px-2 flex gap-2 justify-between items-center ${
				local.class ?? ""
			}`}
			{...others}
			onClick={() => setOpen((x) => !x)}
		>
			<span>{local.options[cindex()]}</span>
			<span class="icon-[mdi--chevron-down] text-[150%] align-bottom" />
			<Show when={isOpen()}>
				<div
					class="absolute top-[calc(100%_+_4px)] max-h-64 z-100 bg-[var(--bg-body)]
                inset-x-0 border overflow-y-auto text-left"
				>
					<For each={local.options}>
						{(option, i) => (
							<div
								onClick={[handleItemClick, i]}
								class={`px-2 ${cindex() === i() ? local.activeClass : ""}`}
							>
								{option}
							</div>
						)}
					</For>
				</div>
			</Show>
		</ButtonBase>
	);
};
