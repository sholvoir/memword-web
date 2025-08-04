import { type Accessor, For, type Signal } from "solid-js";
import type { DivTargeted } from "./targeted.ts";

export default ({ cindex: [cindex, setCIndex], options }: {
    cindex: Signal<number>
    options: Array<string>
}) => {
    const handleClick = (i: Accessor<number>, e: MouseEvent & DivTargeted) => {
        e.stopPropagation();
        setCIndex(i());
    }
    return <For each={options}>{
        (option, i) => <div class="flex gap-1 cursor-pointer items-center"
            onClick={[handleClick, i]}>
            <span class={cindex() == i() ?
                "icon-[material-symbols--check-box-outline]" :
                "icon-[material-symbols--check-box-outline-blank]"} />
            <span>{option}</span>
        </div>
    }</For>
}