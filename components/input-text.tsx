import { For, type JSX, Show, type Signal, createSignal } from "solid-js";
import type { DivTargeted, InputTargeted } from "./targeted.ts";

export default ({ binding, options, maxSuggest, class: className, onChange, ...rest}: {
    binding: Signal<string>;
    options: Signal<Iterable<string>>;
    maxSuggest?: number;
    onChange?: () => void;
} & JSX.InputHTMLAttributes<HTMLInputElement>) => {
    const max = maxSuggest ?? 12;
    const suggestions = createSignal<Array<string>>([]);
    const handleBlur = () => setTimeout(() => suggestions[1]([]), 200);
    const handleKeyPress = (e: KeyboardEvent & InputTargeted) => {
        e.stopPropagation()
        e.key == 'Enter' && handleBlur() && onChange && onChange();
    }
    const handleInput = (e: InputEvent & InputTargeted) => {
        const text = binding[1](e.currentTarget.value);
        if (!text) return suggestions[1]([]);
        const first: Array<string> = [];
        const second: Array<string> = [];
        for (const option of options[0]()) {
            if (option.startsWith(text)) first.push(option);
            else if (option.includes(text)) second.push(option);
            if (first.length >= max) break;
        }
        suggestions[1](first.concat(second.slice(0, max - first.length)));
    };
    const suggestionClicked = (e: MouseEvent & DivTargeted) => {
        binding[1](e.currentTarget.textContent ?? '');
        onChange && onChange();
    }
    return <div class={`inline-block relative ${className ?? ''}`} >
        <input class="w-full px-2" {...rest} value={binding[0]()} onBlur={handleBlur}
            onInput={handleInput} onKeyUp={handleKeyPress}/>
        <Show when={suggestions[0]().length}>
            <div class="absolute border bg-[var(--bg-body)] z-100 top-[calc(100%_+_4px)] inset-x-0 px-2">
                <For each={suggestions[0]()}>{
                    (s) => <div onClick={suggestionClicked}>{s}</div>}
                </For>
            </div>
        </Show>
    </div>;
}