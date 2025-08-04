import { type JSX, createSignal } from "solid-js";
import { type ButtonTargeted } from "./targeted.ts";

export default ({ class: className, children, disabled, onClick, ...rest }:
    JSX.ButtonHTMLAttributes<HTMLButtonElement>
) => {
    const [enabled, setEnabled] = createSignal(true);
    const handleClick = async (e: MouseEvent & ButtonTargeted) => {
        e.stopPropagation()
        setEnabled(false);
        if (onClick) await (typeof onClick === 'function' ? onClick(e) : onClick[0](onClick[1], e));
        setEnabled(true);
    };
    return <button type="button" class={`disabled:opacity-50 ${className ?? ''}`} {...rest}
        onClick={handleClick} disabled={!enabled() || disabled}>{children}</button>
}