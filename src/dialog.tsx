import { ComponentChildren, VNode } from "preact";
import * as app from './app.tsx'
import BButton from '../components/button-base';

export default ({
    title,
    children,
    leftElem,
    rightElem,
    className,
    onBackClick,
    onMenuClick
}: {
    title: string;
    children: ComponentChildren;
    leftElem?: VNode<HTMLElement>;
    rightElem?: VNode<HTMLElement>;
    className?: string
    onBackClick?: () => void;
    onMenuClick?: () => void;
}) => <>
        <div class="title shrink-0 px-2 flex justify-between items-center font-bold">
            <div class="w-6 [app-region:no-drag]">
                {leftElem ?? (onBackClick && <BButton class="w-full h-6 i-material-symbols-chevron-left text-[150%]" onClick={onBackClick}/>)}
            </div>
            <div class="grow font-bold text-center [app-region:drag]">{app.tips.value || title}</div>
            <div class="w-6 [app-region:no-drag]">
                {rightElem ?? (onMenuClick && <BButton class="w-full h-6 i-heroicons-outline-dots-horizontal" onClick={onMenuClick}/>)}
            </div>
        </div>
        <div class={`body grow h-0 flex flex-col ${className ?? ''}`}>{children}</div>
    </>;