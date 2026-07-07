import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { Checkbox, CheckedState, Label, XStack, YStack } from "tamagui";
import { ForgetPasswordProcessData } from "./ForgetPasswordProcessNoteTagData";
import defs from "./SystemSpaceDefs";

export default class ForgetPasswordProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} note={note} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag, note: Note) {
        return new ForgetPasswordProcessData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == defs.internalName &&
            tag.name == defs.forgetPasswordProcess;
    }
}


function EditorComponent({ noteTag, note }: NoteTagDataComponentProps) {
    const data = new ForgetPasswordProcessData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;

    function onNameChange(value: string) {
        data.name = value;
        manualRefresh();
    }

    function onForAllNotesToggle(checkState: CheckedState) {
        data.forAllNotes = (checkState.valueOf() == true);
        manualRefresh();
    }

    return (
        <YStack>
            {data.requiresName(note) && (
                <XStack style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>Name</Label>
                    <NotuInput value={data.name} flex={1}
                               onChangeText={onNameChange} />
                </XStack>
            )}

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>For All Notes</Label>
                <Checkbox checked={data.forAllNotes}
                          onCheckedChange={onForAllNotesToggle}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>
        </YStack>
    )
}