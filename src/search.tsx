import { createSignal } from "solid-js";
import TInput from "../components/input-text.tsx";
import * as mem from "../lib/mem.ts";
import * as app from "./app.tsx";
import Dialog from "./dialog.tsx";

export default () => {
	const word = createSignal("");
	const handleSearchClick = async () => {
		const text = word[0]().trim();
		if (!text) return;
		const item = await mem.search(text);
		if (!item) return app.showTips("Not Found!");
		app.setCItem(item);
		app.setPhaseAnswer(true);
		app.setSprint(-1);
		app.go("#study");
	};
	return (
		<Dialog
			class="flex flex-col text-lg"
			title="词典"
			onBackClick={() => app.go()}
		>
			<TInput
				autoCapitalize="none"
				type="search"
				name="word"
				placeholder="word"
				class="m-2 w-[calc(100%-16px)]"
				binding={word}
				onChange={handleSearchClick}
				options={app.vocabulary()}
			/>
		</Dialog>
	);
};
