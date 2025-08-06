import {
	createSignal,
	For,
	type JSX,
	Show,
	type Signal,
	splitProps,
} from "solid-js";
import type { DivTargeted, InputTargeted } from "./targeted.ts";

export default (
	props: {
		binding: Signal<string>;
		options: Iterable<string>;
		maxSuggest?: number;
		onChange?: (v: string) => void;
	} & JSX.InputHTMLAttributes<HTMLInputElement>,
) => {
	const [local, others] = splitProps(props, [
		"class",
		"binding",
		"options",
		"maxSuggest",
		"onChange",
	]);
    const [value, setValue] = local.binding;
	const max = local.maxSuggest ?? 12;
	const [suggestions, setSuggestions] = createSignal<Array<string>>([]);
	const handleBlur = () => setTimeout(() => setSuggestions([]), 200);
	const handleKeyPress = (e: KeyboardEvent & InputTargeted) => {
		e.stopPropagation();
		e.key === "Enter" && handleBlur() && local.onChange?.(value());
	};
	const handleInput = (e: InputEvent & InputTargeted) => {
		const text = setValue(e.currentTarget.value);
		if (!text) return setSuggestions([]);
		const first: Array<string> = [];
		const second: Array<string> = [];
		for (const option of local.options) {
			if (option.startsWith(text)) first.push(option);
			else if (option.includes(text)) second.push(option);
			if (first.length >= max) break;
		}
		setSuggestions(first.concat(second.slice(0, max - first.length)));
	};
	const suggestionClicked = (e: MouseEvent & DivTargeted) => {
		setValue(e.currentTarget.textContent ?? "");
		local.onChange?.(value());
	};
	return (
		<div class={`inline-block relative ${local.class ?? ""}`}>
			<input
				class="w-full px-2"
				{...others}
				value={value()}
				onBlur={handleBlur}
				onInput={handleInput}
				onKeyUp={handleKeyPress}
			/>
			<Show when={suggestions().length}>
				<div class="absolute border bg-[var(--bg-body)] z-100 top-[calc(100%_+_4px)] inset-x-0 px-2">
					<For each={suggestions()}>
						{(s) => <div onClick={suggestionClicked}>{s}</div>}
					</For>
				</div>
			</Show>
		</div>
	);
};
