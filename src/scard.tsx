import type { IEntry } from "@sholvoir/memword-common/idict";
import { For, Show } from "solid-js";

export default (props: { entry: IEntry }) => (
	<For each={Object.entries(props.entry.meanings!)}>
		{([pos, means]) => (
			<>
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
							<Show when={item.def && item.trans}>
								<span>&ensp;</span>
							</Show>
							<Show when={item.trans}>
								<span class="text-xl font-bold">{item.trans}</span>
							</Show>
						</p>
					)}
				</For>
			</>
		)}
	</For>
);
