import { ICard } from "../../memword-server/lib/idict.ts";

export default ({ card }: { card?: ICard }) =>
    card?.def?.split('\n').map((t: string, i: number) => t.startsWith(' ') ?
        <p key={i} class="text-lg">&ensp;&bull;{t}</p> :
        <p key={i} class="text-xl font-bold">{t}</p>
    )