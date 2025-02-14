import { JSX, VNode } from "preact";
import { useSignal } from "@preact/signals";
import ButtonBase from './button-base.tsx';

export default ({ class: className, children, onClick, ...rest}:
    JSX.ButtonHTMLAttributes<HTMLButtonElement>): VNode<HTMLButtonElement> => {
    const showRipple = useSignal(false);
    const rippleStyle = useSignal('');
    const handleClick = (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
        const btn = e.currentTarget;
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        rippleStyle.value = `width: ${diameter}px; height: ${diameter}px; left: ${
            e.offsetX - radius}px; top: ${e.offsetY - radius}px`;
        showRipple.value = true;
        setTimeout(() => showRipple.value = false, 610);
        if (onClick) onClick(e);
    }
    return <ButtonBase
        {...rest}
        class={`ripple_5fybI ${className ?? ''}`}
        onClick={handleClick}>
            {children}
            {showRipple.value && <span style={rippleStyle.value}/>}
    </ButtonBase>;
}