import { ComponentChildren, VNode, JSX } from "preact";
import * as app from './app.tsx'
import BButton from '../components/button-base.tsx';
import Loading from './icon-loading.tsx';

export default ({
    title,
    children,
    leftElem,
    rightElem,
    class: className,
    onBackClick,
    ...rest
}: {
    title: string;
    children: ComponentChildren;
    leftElem?: VNode<HTMLElement>;
    rightElem?: VNode<HTMLElement>;
    onBackClick?: () => void;
} & JSX.HTMLAttributes<HTMLDivElement>) => <>
    <div class="title shrink-0 px-2 flex justify-between items-center font-bold">
        <div class="w-7 [app-region:no-drag]">
            {leftElem ?? (onBackClick && <BButton onClick={onBackClick}
                class="w-full h-7 i-material-symbols-chevron-left" />)}
        </div>
        <div class="grow font-bold text-center [app-region:drag]">
            {app.tips.value || title}
        </div>
        <div class="w-7 [app-region:no-drag]">
            {rightElem ?? (false && <BButton onClick={onBackClick}
                class="w-full h-7 i-heroicons-outline-dots-horizontal" />)}
        </div>
    </div>
    <div class={`body relative grow h-0 ${className ?? ''}`} {...rest}>
        {children}
        {app.showLoading.value &&
        <div class="absolute inset-0 bg-[var(--bg-half)] flex justify-center content-center flex-wrap">
            <Loading class="w-16 h-16" />
        </div>}
    </div>
</>