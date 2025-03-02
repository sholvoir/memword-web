import { JSX, VNode } from "preact";
import { Signal, useSignal } from "@preact/signals";

export default ({ binding, options, maxSuggest, class: className, onChange, ...rest}: {
    binding: Signal<string|undefined>;
    options: Array<string>;
    maxSuggest?: number;
    onChange?: () => void;
} & JSX.InputHTMLAttributes<HTMLInputElement>): VNode<HTMLDivElement> => {
    const max = maxSuggest ?? 12;
    const suggestions = useSignal<Array<string>>([]);
    const handleBlur = () => setTimeout(() => suggestions.value = [], 200);
    const handleKeyPress = (e: JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
        e.stopPropagation()
        e.key == 'Enter' && handleBlur() && onChange && onChange();
    }
    const handleInput = (e: JSX.TargetedInputEvent<HTMLInputElement>) => {
        const text = binding.value = e.currentTarget.value;
        if (!text) return suggestions.value = [];
        const first: Array<string> = [];
        const second: Array<string> = [];
        for (const option of options) {
            if (option.startsWith(text)) first.push(option);
            else if (option.includes(text)) second.push(option);
            if (first.length >= max) break;
        }
        suggestions.value = first.concat(second.slice(0, max - first.length));
    };
    const suggestionClicked = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
        binding.value = e.currentTarget.textContent ?? '';
        onChange && onChange();
    }
    return <div class={`inline-block relative ${className ?? ''}`} >
        <input class="w-full px-2" {...rest} value={binding.value?.toString()} onInput={handleInput} onBlur={handleBlur} onKeyUp={handleKeyPress}/>
        {suggestions.value.length ? <div class="absolute border bg-[var(--bg-body)] z-100 top-[calc(100%_+_4px)] inset-x-0 px-2">
            {suggestions.value.map((s: string, i: number) => <div key={i} onClick={suggestionClicked}>{s}</div>)}
        </div> : ''}
    </div>;
}