// deno-lint-ignore-file no-cond-assign
import { IDict } from "../../memword-server/lib/idict.ts";
import { useEffect, useRef } from "preact/hooks"
import { signal } from "@preact/signals";
import { requestInit } from "@sholvoir/generic/http";
import TextInput from "./input-text.tsx";
import TextareaInput from "./input-textarea.tsx";
import ButtonBase from "./button-base.tsx";
import Button from "./button-ripple.tsx";

const vocabulary: Array<string> = [];

export default function Lookup() {
    const auth = false;
    const ini = signal(false);
    const word = signal('');
    const def = signal('');
    const trans = signal('');
    const sound = signal('');
    const phonetic = signal('');
    const tips = signal('');
    const player = useRef<HTMLAudioElement>(null);
    const showTips = (content: string) => {
        tips.value = content;
        setTimeout(hideTips, 3000);
    };
    const hideTips = () => tips.value = '';
    const handleSearchClick = async () => {
        const res = await fetch(`/dict?q=${encodeURIComponent(word.value)}`);
        if (res.ok) {
            const dic = await res.json() as IDict;
            def.value = dic.def ?? '';
            trans.value = dic.trans ?? '';
            sound.value = dic.sound ?? '';
            phonetic.value = dic.phonetic ?? '';
        } else showTips(`Error: ${res.status}`);
    }
    const handlePlayClick = () => {
        if (!sound.value) return showTips('no sound to play!');
        player.current?.play();
    }
    const handleUpdateClick = async () => {
        const dict: IDict = {word: word.value};
        if (def.value) dict.def = def.value;
        if (trans.value) dict.trans = trans.value;
        if (phonetic.value) dict.phonetic = phonetic.value;
        if (sound.value) dict.sound = sound.value;
        const res = await fetch(`/api/word?q=${encodeURIComponent(word.value)}`, requestInit(dict, 'PUT'));
        if (res.ok) showTips(`success update word "${word.value}"!`);
        else showTips(`Error: ${res.status}`);
    };
    const handleDeleteClick = async () => {
        const res = await fetch(`/api/word?q=${encodeURIComponent(word.value)}`, { method: 'DELETE' });
        if (res.ok) showTips(`success delete word "${word.value}"!`);
        else showTips(`Error: ${res.status}`);
    };
    const init = async () => {
        const res1 = await fetch('/wrk/get-vocabulary', { cache: 'force-cache' });
        if (!res1.ok) return console.error(res1.status);
        const delimitor = /[,:] */;
        for (const line of (await res1.text()).split('\n')) {
            let [word] = line.split(delimitor);
            if (word = word.trim()) vocabulary.push(word);
        }
        ini.value = true;
    };
    useEffect(() => { init().catch(console.error) }, []);
    return <div className="h-[100dvh] p-2 mx-auto flex flex-col gap-2 bg-cover bg-center text-2xl">
        <div className="fixed top-0 inset-x-0 bg-[#ff08] text-center " onClick={hideTips}>{tips.value}</div>
        <TextInput name="word" placeholder="word" className="w-full [&>div]:bg-stone-200 dark:[&>div]:bg-stone-800"
            binding={word} options={vocabulary} onChange={handleSearchClick}/>
        <TextInput name="phonetic" placeholder="phonetic" binding={phonetic}/>
        <TextareaInput name="trans" placeholder="trans" className="h-32 grow" binding={trans}/>
        <TextareaInput name="def" placeholder="def" className="h-32 grow" binding={def}/>
        <TextareaInput name="sound" placeholder="sound" className="h-32" binding={sound}/>
        <div className="w-full flex gap-2 [&>button]:bg-indigo-700 [&>button]:text-white">
            <Button className="disabled:opacity-50 disabled:bg-gray-500"
                disabled={!ini.value || !word.value} onClick={handleSearchClick}>Search</Button>
            <Button className="disabled:opacity-50 disabled:bg-gray-500"
                disabled = {!auth || !word.value} onClick={handleDeleteClick}>Delete</Button>
            <Button className="disabled:opacity-50 disabled:bg-gray-500"
                disabled = {!auth || !word.value} onClick={handleUpdateClick}>Update</Button>
            <div className="grow"/>
            <ButtonBase onClick={handlePlayClick} disabled={!sound.value}>Play</ButtonBase>
        </div>
        <audio ref={player} src={sound.value}/>
    </div>;
}
