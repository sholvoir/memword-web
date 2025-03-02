import { JSX, VNode } from "preact";
import { Signal, useSignal } from "@preact/signals";

export default ({ binding, class: className, ...rest}: {
    binding: Signal<number|undefined>;
} & JSX.InputHTMLAttributes<HTMLInputElement>): VNode<HTMLInputElement> => {
    const invalid = useSignal(true);
    const handleInput = (e: JSX.TargetedInputEvent<HTMLInputElement>) => {
        const num = +e.currentTarget.value;
        if (isNaN(num)) return invalid.value = false;
        binding.value = num;
    };
    return <input class={`${invalid.value?'text-red':''} ${className??''}`} {...rest} value={binding.value} onInput={handleInput} />

}