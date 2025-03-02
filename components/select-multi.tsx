// deno-lint-ignore-file no-explicit-any
import { VNode } from "preact";
import { Signal } from "@preact/signals";

export default ({ options, indices }: {
    indices: Signal<Array<number>>
    options: Array<string>
}): Array<VNode<HTMLDivElement>> => options.map((option, i) =>
    <div class="flex gap-1 cursor-pointer items-center" key={i}
        onClick={e => (e.stopPropagation(), indices.value = indices.value.includes(i) ?
            indices.value.filter(n => n != i) : [...indices.value, i])}>
        <span class={indices.value.includes(i) ?
            "i-material-symbols-check-box-outline" :
            "i-material-symbols-check-box-outline-blank"} />
        <span>{option}</span>
    </div>
)