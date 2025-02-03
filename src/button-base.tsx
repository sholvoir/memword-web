import { useSignal } from "@preact/signals-react";

export default (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { children, disabled, onClick, ...rest} = props;
    const enabled = useSignal(true);
    const handleClick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        enabled.value = false;
        if (onClick) await onClick(e);
        enabled.value = true;
    };
    return <button type="button" {...rest}
        onClick={handleClick} disabled={!enabled.value || disabled}>{children}</button>
;}