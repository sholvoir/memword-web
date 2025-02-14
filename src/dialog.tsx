import { ComponentChildren, VNode } from "preact";
import * as app from './app.tsx'
import BButton from './button-base.tsx';

export default ({
    title,
    children,
    leftElem,
    rightElem,
    onBackClick,
    onMenuClick,
}: {
    title: string;
    children: ComponentChildren;
    leftElem?: VNode<HTMLElement>;
    rightElem?: VNode<HTMLElement>;
    onBackClick?: () => void;
    onMenuClick?: () => void;
}) => <>
        <div class="title shrink-0 px-2 flex justify-between items-center">
            <div class="w-6 [app-region:no-drag]">
                {leftElem ?? (onBackClick && <BButton class="w-6 h-6" onClick={onBackClick}>&#10094;</BButton>)}
            </div>
            <div class="grow font-bold text-center [app-region:drag]">{app.tips.value || title}</div>
            <div class="w-6 [app-region:no-drag]">
                {rightElem ?? (onMenuClick && <BButton class="w-6 h-6" onClick={onMenuClick}>...</BButton>)}
            </div>
        </div>
        <div class="body grow overflow-y-auto">{children}</div>
    </>;