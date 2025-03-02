import { JSX, VNode } from "preact";
import { Signal } from "@preact/signals";

export default ({ options, cindex, class: className, activeClass }: {
    options: Array<string>
    cindex: Signal<number>
    activeClass?: string
} & JSX.HTMLAttributes<HTMLDivElement>): Array<VNode<HTMLDivElement>> =>
    options.map((option, i) => <div key={i} onClick={(e) => (e.stopPropagation(), cindex.value = i)}
        class={`${className ?? ''} ${cindex.value == i ? activeClass : ''}`}>{option}</div>)