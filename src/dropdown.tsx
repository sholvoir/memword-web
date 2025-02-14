// deno-lint-ignore-file no-explicit-any
import { JSX, VNode } from "preact";
import { useSignal } from "@preact/signals";
import { ISingleSlectProps } from "../lib/options.ts";
import ButtonBase from './button-base.tsx';
import ChevronDown from './icon-chevron-down.tsx';

export default (props: ISingleSlectProps & JSX.HTMLAttributes<HTMLDivElement>): VNode<HTMLDivElement> => {
    const { class: className, binding, options, title, ...rest} = props;
    const isOpen = useSignal(false);
    const content = useSignal(title);
    const handleOptionClick = (e: JSX.TargetedMouseEvent<HTMLDivElement>) => {
        const div = e.currentTarget;
        binding.value = div.title;
        content.value = div.innerText;
        isOpen.value = false;
    }
    const handleClick = () => {
        isOpen.value = !isOpen.value;
    };
    return <div {...rest} class={`dropdown_X1g2o ${className ?? ''}`}>
        <ButtonBase onClick={handleClick}>
            <div>{content}</div>
            <ChevronDown/>
        </ButtonBase>
        {isOpen.value && <div>
            {options.map(option => <div title={option.value as any} onClick={handleOptionClick}>{option.label}</div>)}
        </div>}
    </div>;
}