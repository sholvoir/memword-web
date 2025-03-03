import { useRef } from "preact/hooks";
import { ICard } from "../../memword-server/lib/idict.ts";
import * as app from "./app.tsx";
import BButton from "../components/button-base";
import { useSignal } from "@preact/signals";
import { JSX } from "preact/jsx-runtime";

export default ({ card, class: className }: {
    card: ICard
} & JSX.HTMLAttributes<HTMLDivElement>) => {
    const phonetic = useSignal(card.phonetic);
    const trans = useSignal(card.trans);
    const def = useSignal(card.def)
    const sound = useSignal(card.sound)
    const player = useRef<HTMLAudioElement>(null);
    const handlePlayClick = () => {
        if (!sound.value) app.showTips('no sound to play!');
        else player.current?.play();
    }
    return <div class={`flex flex-col h-full gap-2 ${className??''}`}>
        <input name="phonetic" placeholder="phonetic" value={phonetic}
            onInput={e => card.phonetic = phonetic.value = e.currentTarget.value } />
        <textarea name="trans" placeholder="trans" class="h-32 grow" value={trans}
            onInput={e => card.trans = trans.value = e.currentTarget.value } />
        <textarea name="def" placeholder="def" class="h-32 grow" value={def}
            onInput={e => card.def = def.value = e.currentTarget.value } />
        <div class="flex">
            <textarea name="sound" placeholder="sound" class="h-32 grow" value={sound}
                onInput={e => card.sound = sound.value = e.currentTarget.value } />
            <BButton class="button btn-normal ml-2 i-material-symbols-chevron-right"
                onClick={handlePlayClick} disabled={!sound.value}/>
        </div>
        <audio ref={player} src={sound} />
    </div>;
}