import { JSX, VNode } from "preact";
import { Signal, useSignal } from "@preact/signals";

interface ITextInputProps {
    binding: Signal<string|number|undefined>;
    num?: boolean;
    maxSuggest?: number;
    options?: Array<string>;
    onChange?: () => void;
}
export default (props: ITextInputProps & JSX.InputHTMLAttributes<HTMLInputElement>): VNode<HTMLDivElement> => {
    const { binding, num, options, maxSuggest, class: className, onChange, ...rest} = props;
    const max = maxSuggest ?? 12;
    const suggestions = useSignal<Array<string>>([]);
    const handleBlur = () => setTimeout(() => suggestions.value = [], 200);
    const handleKeyPress = (e: KeyboardEvent) => e.key == 'Enter' && handleBlur() && onChange && onChange();
    const handleInput = (e: InputEvent) => {
        const text = (e.target as HTMLInputElement).value;
        binding.value = num ? +text : text;
        if (options) if (text) {
            const first: Array<string> = [];
            const second: Array<string> = [];
            for (const option of options) {
                if (option.startsWith(text)) first.push(option);
                else if (option.includes(text)) second.push(option);
                if (first.length >= max) break;
            }
            suggestions.value = first.concat(second.slice(0, max - first.length));
        } else suggestions.value = [];
    };
    const suggestionClicked = (e: Event) => {
        binding.value = (e.target as HTMLDivElement).textContent ?? '';
        onChange && onChange();
    }
    return <div class={`input_4Xa52 ${className ?? ''}`} >
        <input {...rest} value={binding.value?.toString()} onInput={handleInput} onBlur={handleBlur} onKeyUp={handleKeyPress}/>
        {suggestions.value.length ? <div>{suggestions.value.map((s: string) => <div onClick={suggestionClicked}>{s}</div>)}</div> : ''}
    </div>;
}