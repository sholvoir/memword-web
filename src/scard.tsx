import { Fragment } from "preact";
import { IEntry } from "@sholvoir/memword-common/idict";

export default ({ entry }: { entry: IEntry }) =>
    Object.entries(entry.meanings!).map(([pos, means]) => <Fragment key={pos}>
        {pos && <p class="text-xl font-bold text-[var(--accent-color)]">{pos}</p>}
        {means?.map(item => <p key={item}>
            <span>&ensp;-&ensp;</span>
            {item.def && <span class="text-lg">{item.def}</span>}
            {item.def && item.trans && <span>&ensp;</span>}
            {item.trans && <span class="text-xl font-bold">{item.trans}</span>}
        </p>)}
    </Fragment>)