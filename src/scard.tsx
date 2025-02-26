import { ICard } from "../../memword-server/lib/idict.ts";

export default ({card}: {card?: ICard}) => card && <>
    <div class="text-2xl flex items-center">{card.phonetic}</div>
    {card.trans?.split('\n').map((t: string, i: number) => <p key={i} class="text-2xl">{t}</p>)}
    {card.def?.split('\n').map((t: string, i: number) => t.startsWith(' ') ?
        <p key={i} class="text-lg">&ensp;&bull;{t}</p> :
        <p key={i} class="text-xl font-bold">{t}</p>
    )}
</>