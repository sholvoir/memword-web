import { JSX, VNode } from "preact";
import { signal } from "@preact/signals";
import ButtonBase from './button-base.tsx';

export default (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>): VNode<HTMLButtonElement> => {
    const { class: className, children, onClick, ...rest} = props;
    const showRipple = signal(false);
    const rippleStyle = signal('');
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