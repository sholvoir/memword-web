// deno-lint-ignore-file no-explicit-any
import { VNode } from "preact";
import { Signal } from "@preact/signals";

export default ({ cindex, options }: {
    cindex: Signal<number>
    options: Array<string>
}): Array<VNode<HTMLDivElement>> => options.map((option, i) =>
    <div class="flex gap-1 cursor-pointer items-center" key={i}
        onClick={e => (e.stopPropagation(), cindex.value = i)}>
        <span class={cindex.value == i ?
            "i-material-symbols-check-box-outline" :
            "i-material-symbols-check-box-outline-blank"} />
        <span>{option}</span>
    </div>
)