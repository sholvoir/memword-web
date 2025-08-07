import { type JSX, Show, splitProps } from "solid-js";
import BButton from "../components/button-base.tsx";
import * as app from "./app.tsx";
import Loading from "./icon-loading.tsx";

export default (
	props: {
		title: string;
		children: JSX.Element;
		leftElem?: HTMLElement;
		rightElem?: HTMLElement;
		onBackClick?: () => void;
	} & JSX.HTMLAttributes<HTMLDivElement>,
) => {
	const [local, others] = splitProps(props, [
		"title",
		"leftElem",
		"rightElem",
		"class",
		"onBackClick",
		"children",
	]);
	return (
		<>
			<div
				class={`title shrink-0 px-2 flex justify-between items-center font-bold ${
					app.tips() ? "bg-(--bg-accent)" : "bg-(--bg-title)"
				}`}
			>
				<div class="w-7 [app-region:no-drag]">
					<Show when={!local.leftElem} fallback={local.leftElem}>
						<Show when={local.onBackClick}>
							<BButton
								onClick={local.onBackClick}
								class="w-full h-7 icon-[material-symbols--chevron-left] align-bottom"
							/>
						</Show>
					</Show>
				</div>
				<div class="grow font-bold text-center [app-region:drag]">
					{app.tips() || local.title}
				</div>
				<div class="w-7 [app-region:no-drag]">
					<Show when={!local.rightElem} fallback="local.rightElem">
						<Show when={false}>
							<BButton class="w-full h-7 icon-[heroicons-solid--dots-horizontal] align-bottom" />
						</Show>
					</Show>
				</div>
			</div>
			<div class={`body relative grow h-0 ${local.class ?? ""}`} {...others}>
				{local.children}
				<Show when={app.showLoading()}>
					<div class="absolute inset-0 bg-[var(--bg-half)] flex justify-center content-center flex-wrap">
						<Loading class="w-16 h-16" />
					</div>
				</Show>
			</div>
		</>
	);
};
