import { ComponentChildren, VNode, JSX } from "preact";
import * as app from './app.tsx'
import BButton from '../components/button-base.tsx';

export default ({
    title,
    children,
    leftElem,
    rightElem,
    class: className,
    onBackClick,
    onMenuClick,
    ...rest
}: {
    title: string;
    children: ComponentChildren;
    leftElem?: VNode<HTMLElement>;
    rightElem?: VNode<HTMLElement>;
    onBackClick?: () => void;
    onMenuClick?: () => void;
} & JSX.HTMLAttributes<HTMLDivElement>) => <>
        <div class="title shrink-0 px-2 flex justify-between items-center font-bold">
            <div class="w-6 [app-region:no-drag]">
                {leftElem ?? (onBackClick && <BButton onClick={onBackClick}
                    class="w-full h-6 i-material-symbols-chevron-left text-[150%]" />)}
            </div>
            <div class="grow font-bold text-center [app-region:drag]">
                {app.tips.value || title}
            </div>
            <div class="w-6 [app-region:no-drag]">
                {rightElem ?? (onMenuClick && <BButton onClick={onMenuClick}
                    class="w-full h-6 i-heroicons-outline-dots-horizontal" />)}
            </div>
        </div>
        <div class={`body grow h-0 ${className ?? ''}`} {...rest}>
            {children}
        </div>
    </>;