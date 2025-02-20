import { Signal } from "@preact/signals"
import { VNode } from "preact"

export default ({className, titles, cindex, children}: {
    className?: string;
    titles: Array<string>;
    cindex: Signal<number>;
    children: VNode<HTMLElement>;
}) => titles.length > 1 ? <div class={`bg-slate-300 dark:bg-slate-700 flex flex-col ${className ?? ''}`}>
    <div class="bg-slate-200 dark:bg-slate-800 flex">{titles.map((title, i) =>
        <div class={`min-w-16 text-center rounded-t-md cursor-pointer ${cindex.value==i?"bg-slate-300 dark:bg-slate-700":""}`}
            onClick={()=>cindex.value=i}>{title}
        </div>
    )}</div>
    <div class="grow p-2">{children}</div>
</div> : children