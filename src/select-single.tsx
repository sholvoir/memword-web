// deno-lint-ignore-file no-explicit-any
import { ISingleSlectProps } from "../lib/options.ts";
import { FaCheck } from "react-icons/fa";

export default (props: ISingleSlectProps & React.FieldsetHTMLAttributes<HTMLFieldSetElement>) => {
    const {options, binding, title, disabled, className, ...rest} = props;
    const handleOptionClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        binding.value = (e.currentTarget as HTMLDivElement).title as string;
    }
    return <fieldset className={`select_6oN7Y ${className ?? ''}`} aria-disabled={disabled} {...rest}>
        <legend>{title}</legend>
        {options.map(option =>
            <div title={option.value as any} onClick={handleOptionClick}>
                <div>{option.value == binding.value && <FaCheck/>}</div>
                <div>{option.label}</div>
            </div>
        )}
    </fieldset>
}