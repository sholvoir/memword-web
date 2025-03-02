// deno-lint-ignore-file no-explicit-any
import { JSX, VNode } from "preact";
import { Signal } from "@preact/signals";

interface ICheckboxProps {
    binding: Signal<boolean>;
    label?: string;
    disabled?: boolean;
}
export default (props: ICheckboxProps & JSX.HTMLAttributes<HTMLDivElement>): VNode<HTMLDivElement> => {
    const { label, binding, disabled, class: className, onChange, ...rest} = props;
    const handleClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!disabled) {
            binding.value = !binding.value;
            if (onChange) onChange(e);
        }
    }
    return <div class={`check-box_6oN7Y ${disabled?'opacity-50':''} ${className ?? ''}`} aria-disabled={disabled} onClick={handleClick} {...rest}>
        <span class={binding.value?"i-material-symbols-check-box-outline":"i-material-symbols-check-box-outline-blank"}/>
        {label}
    </div>
}