import { JSX, VNode } from "preact";
import { Signal } from "@preact/signals";

interface ITextAreaInputProps {
    binding: Signal<string|undefined>
}
export default (props: ITextAreaInputProps & JSX.TextareaHTMLAttributes<HTMLTextAreaElement>): VNode<HTMLTextAreaElement> => {
    const { binding, ...rest } = props;
    const handleInput = (e: JSX.TargetedInputEvent<HTMLTextAreaElement>) =>
        binding.value = (e.target as HTMLTextAreaElement).value;
    return <textarea {...rest} value={binding.value} onInput={handleInput}/>;
}