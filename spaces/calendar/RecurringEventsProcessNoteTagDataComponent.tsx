import { NotuSelect } from "@/components/NotuSelect";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { sortBy } from "es-toolkit";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Label, XStack } from "tamagui";
import { RecurringEventsProcessData } from "./RecurringEventsProcessNoteTagData";

export default class RecurringEventsProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} notu={notu} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }
}


function EditorComponent({ noteTag, notu }: NoteTagDataComponentProps) {
    const manualRefresh = useManualRefresh();
    const data = new RecurringEventsProcessData(noteTag);
    const spaces = sortBy(notu.cache.getSpaces(), [x => x.name]);
    const selectOptions = spaces.map(x => ({ name: x.name, value: x.id }));

    const labelWidth = 150;

    function onSaveEventsToSpaceChange(newValue: number) {
        data.saveEventsToSpaceId = newValue;
        manualRefresh();
    }

    return (
        <XStack style={{alignItems: 'center'}}>
            <Label width={labelWidth}>Save Events To</Label>
            <NotuSelect options={selectOptions}
                        value={data.saveEventsToSpaceId}
                        onValueChange={onSaveEventsToSpaceChange} />
        </XStack>
    )
}