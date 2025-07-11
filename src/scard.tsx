import { ICard } from "../../memword-server/lib/idict.ts";

export default ({ card }: { card?: ICard }) =>
    card?.def?.split('\n').map((t: string, i: number) => {
        if (t.startsWith(' ')) {
            const [e, c] = t.split('|');
            return <p key={i} class="text-lg">&ensp;-{e}<b class="text-xl">{c}</b></p>
        } else return <p key={i} class="text-xl font-bold">{t}</p>
    })