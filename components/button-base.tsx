import { JSX, VNode } from "preact";
import { useSignal } from "@preact/signals";

export default ({ class: className, children, disabled, onClick, ...rest}: JSX.ButtonHTMLAttributes<HTMLButtonElement>):
VNode<HTMLButtonElement> => {
    const enabled = useSignal(true);
    const handleClick = async (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
        e.stopPropagation()
        enabled.value = false;
        if (onClick) await onClick(e);
        enabled.value = true;
    };
    return <button type="button" class={`disabled:opacity-50 ${className??''}`} {...rest}
        onClick={handleClick} disabled={!enabled.value || disabled}>{children}</button>
;}