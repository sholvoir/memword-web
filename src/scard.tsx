import { Fragment } from "preact";
import { ICard } from "../../memword-server/lib/idict.ts";

export default ({ card }: { card?: ICard }) =>
    card?.meanings?.map((meaning) => <Fragment key={meaning}>
        {meaning.pos && <p class="text-xl font-bold">{meaning.pos}</p>}
        {meaning.meaning?.map(item => <p key={item}>
            <span class="text-lg">&ensp;-&ensp;{item.def}&ensp;</span>
            <span class="text-xl">{item.trans}</span>
        </p>)}
    </Fragment>)