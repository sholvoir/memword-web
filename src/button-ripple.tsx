import { useSignal } from "@preact/signals-react";
import ButtonBase from './button-base.tsx';

export default (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { className, children, onClick, ...rest} = props;
    const showRipple = useSignal(false);
    const rippleStyle = useSignal({});
    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        const btn = e.currentTarget;
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        rippleStyle.value = {
            width: `${diameter}px`,
            height: `${diameter}px`,
            left: `${e.clientX - radius}px`,
            top: `${e.clientY - radius}px`
        };
        showRipple.value = true;
        setTimeout(() => showRipple.value = false, 610);
        if (onClick) onClick(e);
    }
    return <ButtonBase
        {...rest}
        className={`ripple_5fybI ${className ?? ''}`}
        onClick={handleClick}>
            {children}
            {showRipple.value && <span style={rippleStyle.value}/>}
    </ButtonBase>;
}