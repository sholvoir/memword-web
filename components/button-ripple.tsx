import { JSX, VNode } from "preact"
import { useSignal } from "@preact/signals"
import ButtonBase from './button-base.tsx'
import './animation-ripple.css'

export default (props: JSX.ButtonHTMLAttributes<HTMLButtonElement>): VNode<HTMLButtonElement> => {
    const { class: className, children, onClick, ...rest} = props;
    const showRipple = useSignal(false);
    const rippleStyle = useSignal({});
    const handleClick = (e: JSX.TargetedMouseEvent<HTMLButtonElement>) => {
        const btn = e.currentTarget;
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        rippleStyle.value = {
            width: `${diameter}px`,
            height: `${diameter}px`,
            left: `${e.offsetX - radius}px`,
            top: `${e.offsetY - radius}px`,
        }
        showRipple.value = true;
        setTimeout(() => showRipple.value = false, 580);
        if (onClick) onClick(e);
    }
    return <ButtonBase
        {...rest}
        class={`overflow-hidden relative ${className ?? ''}`}
        onClick={handleClick}>
            {children}
            {showRipple.value && <span class="absolute transform-[scale(0)] rounded-[50%] bg-[var(--bg-ripple,gray)]:80 animate-[ripple_600ms_linear_0s]" style={rippleStyle.value}/>}
    </ButtonBase>;
}