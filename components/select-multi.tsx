import { For, type Signal } from "solid-js";
import type { DivTargeted } from "./targeted.ts";

export default ({ options, indices }: {
    indices: Signal<Array<number>>
    options: Array<string>
}) => {
    const handleClick = (i: number, e: MouseEvent & DivTargeted) => {
        e.stopPropagation();
        indices[1]((c) => c.includes(i) ? c.filter(n => n != i) : [...c, i])
    }
    return <For each={options}>{
        (option, i) => <div class="flex gap-1 cursor-pointer items-center"
            onClick={[handleClick, i()]}>
            <span class={indices[0]().includes(i()) ?
                "icon-[material-symbols--check-box-outline]" :
                "icon-[material-symbols--check-box-outline-blank]"} />
            <span>{option}</span>
        </div>
    }</For>
}