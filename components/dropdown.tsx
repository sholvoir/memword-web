import { type JSX, type Signal, createSignal, type Accessor, Show, For } from "solid-js";
import ButtonBase from './button-base.tsx';
import type { DivTargeted } from "./targeted.ts";

export default ({ cindex, options, activeClass, class: className, ...rest }: {
    cindex: Signal<number>
    options: Array<string>
    activeClass?: string
} & JSX.HTMLAttributes<HTMLButtonElement>) => {
    const isOpen = createSignal(false);
    const handleItemClick = (i: Accessor<number>, e: MouseEvent & DivTargeted) => {
        e.stopPropagation();
        cindex[1](i());
        isOpen[1](false);
    }
    return <ButtonBase onClick={() => isOpen[1](x=>!x)} {...rest}
        class={`relative px-2 flex gap-2 justify-between items-center ${className ?? ''}`}>
        <span>{options[cindex[0]()]}</span>
        <span class="icon-[mdi--chevron-down]"/>
        <Show when={isOpen[0]()}>
            <div class="absolute top-[calc(100%_+_4px)] max-h-64 z-100 bg-[var(--bg-body)]
                inset-x-0 border overflow-y-auto text-left">
                <For each={options}>{
                    (option, i) => <div onClick={[handleItemClick, i]}
                        class={`px-2 ${cindex[0]() == i() ? activeClass : ''}`}>
                        {option}
                    </div>
                }</For>
            </div>
        </Show>
    </ButtonBase>;
}