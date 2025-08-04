import { type JSX, type Signal, createSignal } from "solid-js";
import type { InputTargeted } from "./targeted.ts";

export default ({ binding, class: className, ...rest}: {
    binding: Signal<number|undefined>;
} & JSX.InputHTMLAttributes<HTMLInputElement>) => {
    const invalid = createSignal(true);
    const handleInput = (e: InputEvent & InputTargeted) => {
        const num = +e.currentTarget.value;
        if (isNaN(num)) return invalid[1](false);
        binding[1](num);
    };
    return <input class={`${invalid[0]()?'text-red':''} ${className??''}`} {...rest} value={binding[0]()} onInput={handleInput} />

}