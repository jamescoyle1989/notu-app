import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { Checkbox, CheckedState, Label, XStack } from "tamagui";
import { CommonSpaceSetup } from "../common/CommonSpaceSetup";
import { RoutineData } from "./RoutineNoteTagData";
import { RoutinesSpaceSetup } from "./RoutinesSpaceSetup";

export default class RoutineNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} />)
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        if (!note.ownTag)
            throw Error('The Routine tag requires that the note has its own tag set.');

        if (!note.tags.find(nt =>
            nt.tag.name == CommonSpaceSetup.recurring &&
            nt.tag.space.internalName == CommonSpaceSetup.internalName
        ))
            throw new Error(`The Routine tag requires that the note have a Common.Recurring tag added to it as well.`);

        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new RoutineData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == RoutinesSpaceSetup.internalName &&
            tag.name == RoutinesSpaceSetup.routine;
    }
}


function EditorComponent({ noteTag }: NoteTagDataComponentProps) {
    const data = new RoutineData(noteTag);
    const manualRefresh = useManualRefresh();

    function handleCanBeCompressedToggle(checkState: CheckedState) {
        data.canBeCompressed = !!checkState.valueOf();
        manualRefresh();
    }

    return (
        <XStack style={{alignItems: 'center'}}>
            <Label>Can Be Compressed</Label>
            <Checkbox checked={data.canBeCompressed} onCheckedChange={handleCanBeCompressedToggle}>
                <Checkbox.Indicator>
                    <Check />
                </Checkbox.Indicator>
            </Checkbox>
        </XStack>
    );
}