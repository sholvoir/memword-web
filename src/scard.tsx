import type { IEntry } from "@sholvoir/memword-common/idict";
import { For, Show } from "solid-js";
import * as mem from "../lib/mem.ts";


export default (props: { entry: IEntry }) => (
	<For each={Object.entries(props.entry.meanings!)}>
		{([pos, means]) => (
			<Show when={mem.setting.trans || pos !== 'ecdict'}>
				<Show when={pos}>
					<p class="text-xl font-bold text-[var(--accent-color)]">{pos}</p>
				</Show>
				<For each={means}>
					{(item) => (
						<p>
							<span>&ensp;-&ensp;</span>
							<Show when={item.def}>
								<span class="text-lg">{item.def}</span>
							</Show>
							<Show when={mem.setting.trans && item.def && item.trans}>
								<span>&ensp;</span>
							</Show>
							<Show when={mem.setting.trans && item.trans}>
								<span class="text-xl font-bold">{item.trans}</span>
							</Show>
						</p>
					)}
				</For>
			</Show>
		)}
	</For>
);
