import { VNode } from "preact";
import { useSignal } from "@preact/signals";
import { countryCodes } from "./country-code.ts";
import BButton from './button-base.tsx';
import RButton from './button-ripple.tsx';
import Checkbox from './checkbox.tsx';
import InputText from './input-text.tsx';
import InputTextArea from './input-textarea.tsx';
import SSelect from './select-single.tsx';
import MSelect from './select-multi.tsx';
import DropDown from './dropdown.tsx';
import Tab from './tab.tsx'

export default (): VNode<HTMLDivElement> => {
    const cindex = useSignal(0);
    const checkbox1 = useSignal(false);
    const checkbox2 = useSignal(true);
    const n = useSignal('');
    const txt = useSignal('Tfhsak');
    const sslec = useSignal(1);
    const mslec = useSignal([3, 5]);
    const code = useSignal(1);
    const options = [
        { value: '1', label: "a" },
        { value: '2', label: "p" },
        { value: '3', label: "c" },
        { value: '4', label: "d" },
        { value: '5', label: "e" },
        { value: '6', label: "f" },
        { value: '7', label: "g" },
        { value: '8', label: "h" }
    ];
    const suggestions = ['abc', 'abd', 'gwetf', 'fsdfa'];
    const xx = () => console.log("OnChange, n: ", n.value);
    return <div class="p-2 flex flex-col gap-2">
        <BButton>ButtonAntiShake</BButton>
        <BButton disabled>DisabledButtonAntiShake</BButton>
        <RButton>ButtonRipple</RButton>
        <RButton disabled>DisabledButtonRipple</RButton>
        <Checkbox binding={checkbox1} label="Enabled Checkbox" />
        <Checkbox binding={checkbox2} disabled label="Disabled Checkbox" />
        <InputText binding={n} options={suggestions} onChange={xx} />
        <InputTextArea binding={txt} />
        <DropDown class="border rounded" cindex={code} options={countryCodes.map(o=>o.label)} title="Unied States"/>
        <div><Tab cindex={cindex} class="bg-[var(--bg-tab)]">
            <div title="Single Select"><SSelect cindex={sslec} options={options.map(o=>o.label)}/></div>
            <fieldset class="border px-2">
                <legend>Multi Select</legend>
                <MSelect indices={mslec} options={options.map(o=>o.label)}/>
            </fieldset>
        </Tab></div>
    </div>;
}