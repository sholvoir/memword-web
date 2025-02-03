import { Signal } from "@preact/signals-react";

interface ITextAreaInputProps {
    binding: Signal<string|undefined>
}
export default ({ binding, ...rest }: ITextAreaInputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
    return <textarea {...rest} value={binding.value} onChange={e=>binding.value=e.target.value}/>;
}