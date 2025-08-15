// deno-lint-ignore-file
import { createEffect, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import * as mem from "../lib/mem.ts";
import About from "./about.tsx";
import * as app from "./app.tsx";
import Book from "./book.tsx";
import Help from "./help.tsx";
import Home from "./home.tsx";
import Issue from "./issue.tsx";
import Dict from "./search.tsx";
import Setting from "./setting.tsx";
import Study from "./study.tsx";

export default () => {
	const dialogs = new Map<app.TDial, () => JSX.Element>();
	dialogs.set("#home", Home);
	dialogs.set("#help", Help);
	dialogs.set("#about", About);
	dialogs.set("#issue", Issue);
	dialogs.set("#setting", Setting);
	dialogs.set("#search", Dict);
	dialogs.set("#study", Study);
	dialogs.set("#book", Book);

	const init = async () => {
		if (app.setUser((await mem.getUser()) ?? "")) {
			app.go("#home");
			await mem.initSetting();
			await app.totalStats();
			(async () => {
				await mem.getServerBooks();
				app.setVocabulary((await mem.getVocabulary()) ?? []);
				await mem.syncSetting();
				await mem.syncTasks();
				await app.totalStats();
				// for (const item of await idb.getPredict(3600, 500)) {
				//     await mem.itemUpdateDict(item);
				//     await wait(300);
				// }
			})();
		} else app.go("#about");
	};

	createEffect(() => {
		init();
	});
	return <Dynamic component={dialogs.get(app.loca())}></Dynamic>;
};
