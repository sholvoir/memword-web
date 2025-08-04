import { type Accessor, For, type JSX, Show, type Signal } from "solid-js";
import type { DivTargeted } from "./targeted.ts";

export default ({ class: className, cindex, children }: {
    cindex: Signal<number>;
} & JSX.HTMLAttributes<HTMLElement>) => {
    const childs: JSX.ArrayElement = Array.isArray(children) ? children : [children];
    const handleClick = (i: Accessor<number>, e: MouseEvent & DivTargeted) => {
        e.stopPropagation();
        cindex[1](i);
    }
    return <Show when={childs.length}>
        <header class="flex gap-2"><For each={childs}>{(child, i) =>
            <div class={`min-w-16 px-2 py-1 cursor-pointer text-center rounded-t-md ${
                cindex[0]() == i() ? className ?? '' : ''}`}
                onClick={[handleClick, i]}>{(child as HTMLElement).title ?? i}
            </div>
        }</For></header>
        <section class={`grow p-2 ${className ?? ''}`}>
            {childs[cindex[0]()]}
        </section>
    </Show>
}