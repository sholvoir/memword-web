import {
	type Accessor,
	children,
	For,
	type JSX,
	Show,
	type Signal,
} from "solid-js";
import type { DivTargeted } from "./targeted.ts";

export default (
	props: {
		cindex: Signal<number>;
	} & JSX.HTMLAttributes<HTMLElement>,
) => {
	const c = children(() => props.children);
	const [cindex, setCIndex] = props.cindex;
	const childs = (Array.isArray(c()) ? c() : [c()]) as Array<Element>;
	const handleClick = (i: Accessor<number>, e: MouseEvent & DivTargeted) => {
		e.stopPropagation();
		setCIndex(i);
	};
	return (
		<Show when={childs.length}>
			<header class="flex gap-2">
				<For each={childs}>
					{(child, i) => (
						<div
							class={`min-w-16 px-2 py-1 cursor-pointer text-center rounded-t-md ${
								cindex() === i() ? (props.class ?? "") : ""
							}`}
							onClick={[handleClick, i]}
						>
							{(child as HTMLElement).title ?? i}
						</div>
					)}
				</For>
			</header>
			<section class={`grow p-2 ${props.class ?? ""}`}>
				{childs[cindex()]}
			</section>
		</Show>
	);
};
