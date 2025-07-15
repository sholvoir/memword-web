import { Fragment } from "preact";
import { ICard } from "../../memword-server/lib/idict.ts";

export default ({ card }: { card?: ICard }) =>
    card?.meanings?.map((meaning) => <Fragment key={meaning}>
        {meaning.pos && <p class="text-xl font-bold text-[var(--accent-color)]">{meaning.pos}</p>}
        {meaning.meaning?.map(item => <p key={item}>
            <span>&ensp;-&ensp;</span>
            {item.def && <span class="text-lg">{item.def}</span>}
            {item.def && item.trans && <span>&ensp;</span>}
            {item.trans && <span class="text-xl">{item.trans}</span>}
        </p>)}
    </Fragment>)