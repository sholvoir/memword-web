import { type JSX, createSignal } from "solid-js";
import ButtonBase from './button-base.tsx'
import './animation-ripple.css'
import type { ButtonTargeted } from "./targeted.ts";

export default ({ class: className, children, onClick, ...rest}:
    JSX.ButtonHTMLAttributes<HTMLButtonElement>
) => {
    const [showRipple, setShowRipple] = createSignal(false);
    const [rippleStyle, setRippleStyle] = createSignal({});
    const handleClick = (e: MouseEvent & ButtonTargeted) => {
        const btn = e.currentTarget;
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        setRippleStyle({
            width: `${diameter}px`,
            height: `${diameter}px`,
            left: `${e.offsetX - radius}px`,
            top: `${e.offsetY - radius}px`,
        })
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 580);
        if (onClick) typeof onClick === 'function' ? onClick(e) : onClick[0](onClick[1], e);
    }
    return <ButtonBase
        {...rest}
        class={`overflow-hidden relative ${className ?? ''}`}
        onClick={handleClick}>
            {children}
            {showRipple() && <span style={rippleStyle()} class="absolute transform-[scale(0)]
                rounded-[50%] bg-[var(--bg-ripple,gray)]:80 animate-[ripple_600ms_linear_0s]"/>}
    </ButtonBase>;
}