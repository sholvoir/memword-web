import { JSX, VNode } from "preact";
import { Signal } from "@preact/signals";

export default ({ binding, ...rest }: {
    binding: Signal<string | undefined>;
} & JSX.InputHTMLAttributes<HTMLInputElement>): VNode<HTMLInputElement> =>
    <input {...rest} value={binding.value?.toString()} onInput={e => binding.value = e.currentTarget.value} />