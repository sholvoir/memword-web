import { type Accessor, For, type JSX, type Signal } from "solid-js";
import type { DivTargeted } from "./targeted.ts";

export default ({
    options,
    cindex,
    class: className,
    activeClass,
    onClick
}: {
    options: Array<string>
    cindex: Signal<number>
    activeClass?: string
} & JSX.HTMLAttributes<HTMLDivElement>) => {
    const handleClick = (i: Accessor<number>, e: MouseEvent & DivTargeted) => {
        e.stopPropagation();
        cindex[1](i());
        if (onClick) typeof onClick === 'function' ? onClick(e) : onClick[0](onClick[1], e)
    }
    return <For each={options}>{
        (option, i) => <div onClick={[handleClick, i]}
            class={`${className ?? ''} ${cindex[0]() == i() ? activeClass : ''}`}>
            {option}
        </div>
    }</For>
}