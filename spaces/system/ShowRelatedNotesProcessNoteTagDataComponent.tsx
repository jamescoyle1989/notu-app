import { NotuSelect } from "@/components/NotuSelect";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { Input, Label, XStack, YStack } from "tamagui";
import { ShowRelatedNotesProcessData } from "./ShowRelatedNotesProcessNoteTagData";
import defs from "./SystemSpaceDefs";

export default class ShowRelatedNotesProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} note={note} notu={notu} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        const data = new ShowRelatedNotesProcessData(noteTag);
        if (data.spaceId > 0) {
            const space = notu.getSpace(data.spaceId);
            if (!space)
                throw Error('Make sure you select a space for new notes to be created in.');
        }
        if (!data.query.includes('{TAG}'))
            throw Error(`Your query must include '{TAG}', which is what will get replaced at execution time with the tag of the note that the process is being run against.`);
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new ShowRelatedNotesProcessData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == defs.internalName &&
            tag.name == defs.showRelatedNotesProcess;
    }
}


function EditorComponent({ noteTag, note, notu }: NoteTagDataComponentProps) {
    const data = new ShowRelatedNotesProcessData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;
    const spaces = [
        { name: 'All', value: 0 },
        { name: `Note's Space`, value: -1 }
    ];
    spaces.push(...notu.getSpaces().map(x => ({ name: x.name, value: x.id })));

    function onNameChange(newValue: string) {
        data.name = newValue;
        manualRefresh();
    }

    function handleSpaceChange(value: number) {
        data.spaceId = value;
        manualRefresh();
    }

    function handleQueryChange(value: string) {
        data.query = value;
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
                <Label width={labelWidth}>Space</Label>
                <NotuSelect options={spaces}
                            value={data.spaceId}
                            onValueChange={handleSpaceChange} />
            </XStack>

            <Label>Text</Label>
            <Input value={data.query}
                   multiline={true}
                   onChangeText={handleQueryChange} />
        </YStack>
    )
}