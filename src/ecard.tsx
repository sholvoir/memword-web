import type { JSX } from "preact";
import type { ICard } from "@sholvoir/memword-common/idict";
import { useRef } from "preact/hooks";
import { useSignal } from "@preact/signals";
import * as app from "./app.tsx";
import Button from "../components/button-ripple.tsx";

export default ({ card, class: className, onClick }: {
    card: ICard;
    onClick: () => void
} & JSX.HTMLAttributes<HTMLDivElement>) => {
    const phonetic = useSignal(card.phonetic);
    const meanings = useSignal(JSON.stringify(card.meanings, undefined, 4));
    const sound = useSignal(card.sound);
    const parseError = useSignal(false);
    const player = useRef<HTMLAudioElement>(null);
    const handlePlayClick = () => {
        if (!sound.value) app.showTips('no sound to play!');
        else player.current?.play();
    }
    const handleMeaningsChange = (e: JSX.TargetedInputEvent<HTMLTextAreaElement>) => {
        try {
            card.meanings = JSON.parse(meanings.value = e.currentTarget.value);
            parseError.value = false;
         }
        catch { parseError.value = true }
    }
    return <div class={`flex flex-col h-full gap-2 ${className ?? ''}`} onClick={onClick}>
        <input name="phonetic" placeholder="phonetic" value={phonetic} onFocus={onClick}
            onInput={e => card.phonetic = phonetic.value = e.currentTarget.value} />
        <textarea name="meanings" placeholder="meanings" class={`h-32 grow ${parseError.value ? 'text-red' : ''}`} value={meanings}
            onInput={handleMeaningsChange} onFocus={onClick}/>
        <div class="shrink flex">
            <textarea name="sound" rows={1} placeholder="sound" class="grow" value={sound}
                onInput={e => card.sound = sound.value = e.currentTarget.value} onFocus={onClick}/>
            <Button class="button btn-normal"
                onClick={() => card.sound = sound.value = 'https://dict.youdao.com/dictvoice?type=2&audio='}>
                <span class="text-[150%] i-material-symbols-chevron-right"/>
            </Button>
            <Button class="button btn-normal"
                onClick={handlePlayClick} disabled={!sound.value}>
                <span class="text-[150%] i-material-symbols-chevron-right"/>
            </Button>
        </div>
        <audio ref={player} src={sound} />
    </div>;
}