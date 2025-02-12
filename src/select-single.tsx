// deno-lint-ignore-file no-explicit-any
import { JSX, VNode } from "preact";
import { ISingleSlectProps } from "../lib/options.ts";
import IconCheck from "./icon-check.tsx";

export default (props: ISingleSlectProps & JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>): VNode<HTMLFieldSetElement> => {
    const {options, binding, title, disabled, class: className, ...rest} = props;
    const handleOptionClick = (e: Event) => {
        binding.value = (e.currentTarget as HTMLDivElement).title as string|number;
    }
    return <fieldset class={`select_6oN7Y ${className ?? ''}`} aria-disabled={disabled} {...rest}>
        <legend>{title}</legend>
        {options.map(option =>
            <div title={option.value as any} onClick={handleOptionClick}>
                <div>{option.value == binding.value && <IconCheck/>}</div>
                <div>{option.label}</div>
            </div>
        )}
    </fieldset>
}