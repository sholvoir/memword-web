import { JSX, VNode } from "preact"
import { Signal } from "@preact/signals"

export default ({ class: className, cindex, children }: {
    cindex: Signal<number>;
} & JSX.HTMLAttributes<HTMLElement>) => {
    const childs: Array<VNode<HTMLElement>> = Array.isArray(children) ? children : [children];
    return childs.length ? <>
        <header class="flex gap-2">{childs?.map((child, i) =>
            <div key={i} class={`min-w-16 px-2 py-1 cursor-pointer text-center rounded-t-md ${cindex.value == i ? className ?? '' : ''}`}
                onClick={(e) => (e.stopPropagation(), cindex.value = i)}>{child.props.title ?? i}
            </div>
        )}</header>
        <section class={`grow p-2 overflow-y-auto ${className ?? ''}`}>
            {childs[cindex.value]}
        </section>
    </> : <></>;
}