// deno-lint-ignore-file no-explicit-any
import { Signal } from "@preact/signals-react";
import { Options } from "../lib/options.ts";
import { FaCheck } from "react-icons/fa";

interface ISlectProps {
    options: Options;
    binding: Signal<Array<string|number>>;
    disabled?: boolean;
}
export default (props: ISlectProps & React.FieldsetHTMLAttributes<HTMLFieldSetElement>) => {
    const {options, binding, title, disabled, className, ...rest} = props;
    const handleOptionClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const value = (e.currentTarget as HTMLDivElement).title as string|number;
        const index = binding.value.indexOf(value);
        if (index > -1) binding.value = [...binding.value.slice(0,index), ...binding.value.slice(index + 1)];
        else binding.value = [...binding.value, value];
    }
    return <fieldset className={`select_6oN7Y ${className ?? ''}`} aria-disabled={disabled} {...rest}>
        <legend>{title}</legend>
        {options.map(option =>
            <div title={option.value as any} onClick={handleOptionClick}>
                <div>{binding.value.includes(option.value) && <FaCheck/>}</div>
                <div>{option.label}</div>
            </div>
        )}
    </fieldset>
}