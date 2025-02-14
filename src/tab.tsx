import { useSignal } from "@preact/signals";
import { VNode } from "preact";

export default ({children}: {
    children: Array<VNode<HTMLElement>>
}) => {
    const cindex = useSignal(0);
    return <div class="flex flex-col">
        <div class="flex">{children.map((child, i) => <div class={cindex.value==i?"bg-orange-400":""} onClick={()=>cindex.value=i}>{child.props.title}</div>)}</div>
        <div class="grow">{children[cindex.value]}</div>
    </div>

}