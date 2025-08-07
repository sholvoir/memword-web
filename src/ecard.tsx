import type { IEntry } from "@sholvoir/memword-common/idict";
import { createSignal, type JSX, type Signal } from "solid-js";
import { parse, stringify } from "yaml";
import Button from "../components/button-ripple.tsx";
import type { TextAreaTargeted } from "../components/targeted.ts";
import * as app from "./app.tsx";

export default (
	props: {
		word: string;
		entry: Signal<IEntry>;
		onClick: () => void;
	} & JSX.HTMLAttributes<HTMLDivElement>,
) => {
	const [entry, setEntry] = props.entry;
	const [parseError, setParseError] = createSignal(false);
	let player!: HTMLAudioElement;
	const handlePlayClick = () => {
		if (!entry().sound) app.showTips("no sound to play!");
		else player.play();
	};
	const handleMeaningsChange = (e: InputEvent & TextAreaTargeted) => {
		try {
			const meanings = parse(e.currentTarget.value);
			setParseError(false);
         setEntry(en => ({...en, meanings }))
		} catch {
			setParseError(true);
		}
	};
	return (
		<div
			class={`flex flex-col h-full gap-2 ${props.class ?? ""}`}
			onClick={props.onClick}
		>
			<div class="shrink flex gap-2">
				<input
					name="phonetic"
					placeholder="phonetic"
					value={entry().phonetic}
					onFocus={props.onClick}
					onInput={(e) =>
						setEntry((en) => ({ ...en, phonetic: e.currentTarget.value }))
					}
				/>
				<textarea
					name="sound"
					rows={1}
					placeholder="sound"
					class="grow-5"
					value={entry().sound}
					onInput={(e) => setEntry(en => ({...en, sound: e.currentTarget.value}))}
					onFocus={props.onClick}
				/>
				<Button
					class="button btn-normal"
					onClick={() => setEntry(en => 
                        ({...en, sound: `https://dict.youdao.com/dictvoice?type=2&audio=${props.word.replaceAll(" ", "+")}`})
                    )}
				>
					YDS
				</Button>
				<Button
					class="button btn-normal"
					onClick={handlePlayClick}
					disabled={!entry().sound}
				>
					<span class="text-[150%] align-bottom icon-[material-symbols--chevron-right]" />
				</Button>
			</div>
			<textarea
				name="meanings"
				placeholder="meanings"
				class={`h-32 grow font-mono ${parseError() ? "text-(--accent-color)" : ""}`}
				value={stringify(entry().meanings, { lineWidth: 0 })}
				onInput={handleMeaningsChange}
				onFocus={props.onClick}
			/>
			<audio ref={player} src={entry().sound} />
		</div>
	);
};
