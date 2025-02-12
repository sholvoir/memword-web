// deno-lint-ignore-file no-explicit-any
import { JSX, VNode } from "preact";
import { Signal } from "@preact/signals";
import IconCheck from "./icon-check.tsx";

interface ICheckboxProps {
    binding: Signal<boolean>;
    label?: string;
    disabled?: boolean;
}
export default (props: ICheckboxProps & JSX.HTMLAttributes<HTMLDivElement>): VNode<HTMLDivElement> => {
    const { label, binding, disabled, class: className, onChange, ...rest} = props;
    const handleClick = (e: any) => {
        if (!disabled) {
            binding.value = !binding.value;
            if (onChange) onChange(e);
        }
    }
    return <div class={`check-box_6oN7Y ${className ?? ''}`} aria-disabled={disabled} onClick={handleClick} {...rest}>
        <span>{binding.value?<IconCheck/>:''}</span>{label}
    </div>
}