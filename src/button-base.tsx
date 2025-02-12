import { JSX, VNode } from "preact";
import { signal } from "@preact/signals";

export default (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>): VNode<HTMLButtonElement> => {
    const { children, disabled, onClick, ...rest} = props;
    const enabled = signal(true);
    const handleClick = async (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
        enabled.value = false;
        if (onClick) await onClick(e);
        enabled.value = true;
    };
    return <button type="button" {...rest}
        onClick={handleClick} disabled={!enabled.value || disabled}>{children}</button>
;}