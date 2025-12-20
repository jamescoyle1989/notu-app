import { NotuSelect } from "@/components/NotuSelect";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { sortBy } from "es-toolkit";
import { Note, NoteTag, Notu } from "notu";
import { ReactNode } from "react";
import { Label, XStack } from "tamagui";
import { CompressRoutinesProcessData } from "./CompressRoutinesProcessNoteTagData";

export default class CompressRoutinesProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

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
    const data = new CompressRoutinesProcessData(noteTag);
    const spaces = sortBy(notu.cache.getSpaces(), [x => x.name]);
    const selectOptions = spaces.map(x => ({ name: x.name, value: x.id }));

    function onSaveEventsToSpaceChange(newValue: number) {
        data.saveNotesToSpaceId = newValue;
        manualRefresh();
    }

    return (
        <XStack style={{alignItems: 'center'}}>
            <Label width={150}>Save Notes To</Label>
            <NotuSelect options={selectOptions}
                        value={data.saveNotesToSpaceId}
                        onValueChange={onSaveEventsToSpaceChange} />
        </XStack>
    )
}