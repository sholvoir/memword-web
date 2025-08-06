import { For, type Signal } from "solid-js";
import type { DivTargeted } from "./targeted.ts";

export default (props: {
	indices: Signal<Array<number>>;
	options: Array<string>;
}) => {
	const [indices, setIndices] = props.indices;
	const handleClick = (i: number, e: MouseEvent & DivTargeted) => {
		e.stopPropagation();
		setIndices((c) => (c.includes(i) ? c.filter((n) => n !== i) : [...c, i]));
	};
	return (
		<For each={props.options}>
			{(option, i) => (
				<div
					class="flex gap-1 cursor-pointer items-center"
					onClick={[handleClick, i()]}
				>
					<span
						class={`align-bottom ${
							indices().includes(i())
								? "icon-[material-symbols--check-box-outline]"
								: "icon-[material-symbols--check-box-outline-blank]"
						}`}
					/>
					<span>{option}</span>
				</div>
			)}
		</For>
	);
};
