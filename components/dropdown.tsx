// deno-lint-ignore-file no-explicit-any
import { JSX, VNode } from "preact";
import { Signal, useSignal } from "@preact/signals";
import ButtonBase from './button-base.tsx';

export default ({ cindex, options, activeClass, class: className, ...rest }: {
    cindex: Signal<number>
    options: Array<string>
    activeClass?: string
} & JSX.HTMLAttributes<HTMLButtonElement>): VNode<HTMLButtonElement> => {
    const isOpen = useSignal(false);
    return <ButtonBase onClick={() => isOpen.value = !isOpen.value} {...rest}
        class={`relative px-2 flex gap-2 justify-between items-center ${className ?? ''}`}>
        <span>{options[cindex.value]}</span>
        <span class="i-mdi-chevron-down"/>
        {isOpen.value && <div class="absolute top-[calc(100%_+_4px)] max-h-64 z-100 bg-[var(--bg-body)] inset-x-0 border overflow-y-auto text-left">
            {options.map((option, i) => <div key={i}
                onClick={e => (e.stopPropagation(), cindex.value = i, isOpen.value = false)}
                class={`px-2 ${cindex.value == i ? activeClass : ''}`}>
                {option}
            </div>)}
        </div>}
    </ButtonBase>;
}