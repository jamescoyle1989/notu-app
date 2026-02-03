import { NumberInput } from "@/components/NumberInput";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode, useEffect, useState } from "react";
import { Label, YStack } from "tamagui";
import { CurrencyData } from "./CurrencyNoteTagData";
import { MoneySpace } from "./MoneySpace";

export default class CurrencyNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new CurrencyData(noteTag);
        if (data.isBase)
            return (<NotuText color={textColor} small>Base</NotuText>);
        return (<NotuText color={textColor} small>Base Exchange Rate: {data.baseExchangeRate}</NotuText>)
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} note={note} notu={notu} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        if (!note.ownTag)
            throw new Error('The Currency tag requires that the note has its own tag set.');

        return Promise.resolve(true);
    }
    
    getDataObject(noteTag: NoteTag) {
        return new CurrencyData(noteTag);
    }
}


function EditorComponent({ noteTag, note, notu, refreshCallback }: NoteTagDataComponentProps) {
    const data = new CurrencyData(noteTag);
    const [currencyBaseNote, setCurrencyBaseNote] = useState<Note>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let running = true;
        fetch();
        return () => { running = false };

        async function fetch() {
            const moneySpace = new MoneySpace(notu);
            const baseNote = (await notu.getNotes(
                `n.id != ${note.id} AND #[${moneySpace.currency.getFullName()}]{.isBase = {True}}`
            )).find(x => true);
            if (running) {
                setCurrencyBaseNote(baseNote);
                setIsLoading(false);
                if (!baseNote)
                    data.isBase = true;
                refreshCallback();
            }
        }

    }, []);

    function onExchangeRateChange(value: number) {
        data.baseExchangeRate = value;
        refreshCallback();
    }

    if (isLoading)
        return (<NotuText>Loading...</NotuText>);

    if (!currencyBaseNote)
        return (<NotuText>This is your base currency</NotuText>);

    return (
        <YStack>
            <Label>Exchange Rate to {currencyBaseNote.ownTag?.name}</Label>
            <NumberInput numberValue={data.baseExchangeRate}
                         onNumberChange={onExchangeRateChange} />
        </YStack>
    );
}