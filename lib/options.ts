import { Signal } from "@preact/signals-react";

export interface Option {
    value: string | number;
    label: string;
}

export type Options = Array<Option>;

export interface ISingleSlectProps {
    options: Options;
    binding: Signal<string|number>;
    disabled?: boolean;
}