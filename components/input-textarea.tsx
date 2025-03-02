import { JSX, VNode } from "preact";
import { Signal } from "@preact/signals";

export default ({ binding, ...rest }: {
    binding: Signal<string | undefined>
} & JSX.TextareaHTMLAttributes<HTMLTextAreaElement>): VNode<HTMLTextAreaElement> =>
    <textarea {...rest} value={binding.value} onInput={e => binding.value = e.currentTarget.value} />;
