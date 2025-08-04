import type { JSX, Signal } from "solid-js";

export default ({ binding, ...rest }: {
    binding: Signal<string>
} & JSX.TextareaHTMLAttributes<HTMLTextAreaElement>) =>
    <textarea {...rest} value={binding[0]()} onInput={e => binding[1](e.currentTarget.value)} />;
