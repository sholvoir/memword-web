import { type JSX, type Signal, createSignal } from "solid-js";
import type { IEntry } from "@sholvoir/memword-common/idict";
import type { TextAreaTargeted } from "../components/targeted.ts";
import { parse, stringify } from 'yaml';
import * as app from "./app.tsx";
import Button from "../components/button-ripple.tsx";

export default ({word, entry, class: className, onClick }: {
    word: Signal<string>
    entry: IEntry;
    onClick: () => void
} & JSX.HTMLAttributes<HTMLDivElement>) => {
    const phonetic = createSignal(entry.phonetic);
    const meanings = createSignal(stringify(entry.meanings, { lineWidth: 0 }));
    const sound = createSignal(entry.sound);
    const parseError = createSignal(false);
    let player!: HTMLAudioElement;
    const handlePlayClick = () => {
        if (!sound[0]()) app.showTips('no sound to play!');
        else player.play();
    }
    const handleMeaningsChange = (e: InputEvent & TextAreaTargeted) => {
        try {
            entry.meanings = parse(meanings[1](e.currentTarget.value));
            parseError[1](false);
        }
        catch { parseError[1](true) }
    }
    return <div class={`flex flex-col h-full gap-2 ${className ?? ''}`} onClick={onClick}>
        <input name="phonetic" placeholder="phonetic" value={phonetic[0]()} onFocus={onClick}
            onInput={e => entry.phonetic = phonetic[1](e.currentTarget.value)} />
        <textarea name="meanings" placeholder="meanings" class={`h-32 grow font-mono ${parseError[0]() ? 'text-red' : ''}`} value={meanings[0]()}
            onInput={handleMeaningsChange} onFocus={onClick}/>
        <div class="shrink flex gap-2">
            <textarea name="sound" rows={1} placeholder="sound" class="grow" value={sound[0]()}
                onInput={e => entry.sound = sound[1](e.currentTarget.value)} onFocus={onClick}/>
            <Button class="button btn-normal"
                onClick={() => entry.sound = sound[1](`https://dict.youdao.com/dictvoice?type=2&audio=${word[0]().replaceAll(' ', '+')}`)}>
                YDS
            </Button>
            <Button class="button btn-normal"
                onClick={handlePlayClick} disabled={!sound[0]()}>
                <span class="text-[150%] icon-[material-symbols--chevron-right]"/>
            </Button>
        </div>
        <audio ref={player} src={sound[0]()} />
    </div>;
}