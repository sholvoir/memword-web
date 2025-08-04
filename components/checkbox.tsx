import type { JSX, Signal } from "solid-js";
import type { DivTargeted } from "./targeted.ts";

export default ({ label, binding, disabled, class: className, onChange, ...rest }: {
    binding: Signal<boolean>;
    label?: string;
    disabled?: boolean;
} & JSX.HTMLAttributes<HTMLDivElement>) => {
    const handleClick = (e: MouseEvent & DivTargeted) => {
        e.stopPropagation();
        if (!disabled) {
            binding[1](s=>!s);
            if (onChange) typeof onChange === 'function' ? onChange(e) : onChange[0](onChange[1], e);
        }
    }
    return <div class={`${disabled ? 'opacity-50' : ''} ${className ?? ''}`}
        aria-disabled={disabled} onClick={handleClick} {...rest}>
        <span class={`text-[150%] ${binding[0]() ?
            "icon-[material-symbols--check-box-outline]" :
            "icon-[material-symbols--check-box-outline-blank]"}`} />
        {label}
    </div>
}