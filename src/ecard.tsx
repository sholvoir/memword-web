import { useRef } from "preact/hooks";
import { ICard } from "../../memword-server/lib/idict.ts";
import * as app from "./app.tsx";
import BButton from "./button-base.tsx";

export default ({ card }: { card?: ICard }) => {
    const player = useRef<HTMLAudioElement>(null);
    const handlePlayClick = () => {
        if (!card?.sound) app.showTips('no sound to play!');
        else player.current?.play();
    }
    return card ? <div class="flex flex-col h-full gap-2">
        <input name="phonetic" placeholder="phonetic" value={card.phonetic??''}
            onChange={e => card.phonetic = e.currentTarget.value } />
        <textarea name="trans" placeholder="trans" class="h-32 grow" value={card.trans??''}
            onChange={e => card.trans = e.currentTarget.value } />
        <textarea name="def" placeholder="def" class="h-32 grow" value={card.def??''}
            onChange={e => card.def = e.currentTarget.value } />
        <div class="flex">
            <textarea name="sound" placeholder="sound" class="h-32 grow" value={card.sound??''}
                onChange={e => card.sound = e.currentTarget.value } />
            <BButton class="button btn-normal ml-2" onClick={handlePlayClick} disabled={!card.sound}>&#11208;</BButton>
        </div>
        <audio ref={player} src={card.sound} />
    </div> : undefined;
}