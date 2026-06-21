import { NotuSelect } from "@/components/NotuSelect";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuInput } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode } from "react";
import { Input, Label, XStack, YStack } from "tamagui";
import { ShowRelatedNotesProcessData } from "./ShowRelatedNotesProcessNoteTagData";
import { SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";

export default class ShowRelatedNotesProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} note={note} notu={notu} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        const data = new ShowRelatedNotesProcessData(noteTag, note);
        const systemSpace = new SystemSpace(notu);

        if (data.spaceId > 0) {
            const space = notu.getSpace(data.spaceId);
            if (!space)
                throw Error('Make sure you select a space for new notes to be created in.');
        }

        const linkedPages = note.tags.filter(x => x.tag.linksTo(systemSpace.page));
        if (linkedPages.length > 1)
            throw Error('There is more than one page linked to by this note. Please select just one so the process knows which one to show.');

        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag, note: Note) {
        return new ShowRelatedNotesProcessData(noteTag, note);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == defs.internalName &&
            tag.name == defs.showRelatedNotesProcess;
    }
}


function EditorComponent({ noteTag, note, notu }: NoteTagDataComponentProps) {
    const data = new ShowRelatedNotesProcessData(noteTag, note);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;
    const spaces = [
        { name: 'All', value: 0 },
        { name: `Note's Space`, value: -1 }
    ];
    spaces.push(...notu.getSpaces().map(x => ({ name: x.name, value: x.id })));
    const systemSpace = new SystemSpace(notu);
    const linkedPageNoteTag = note.tags.find(x => x.tag.linksTo(systemSpace.page));
    if (!!linkedPageNoteTag) {
        data.query = '';
        data.spaceId = 0;
    }

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

            {!linkedPageNoteTag && (
                <YStack>
                    <XStack style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>Space</Label>
                        <NotuSelect options={spaces}
                                    value={data.spaceId}
                                    onValueChange={handleSpaceChange} />
                    </XStack>

                    <Label>Query</Label>
                    <Input value={data.query}
                        multiline={true}
                        onChangeText={handleQueryChange} />
                </YStack>
            )}
            {!!linkedPageNoteTag && (
                <Label>Process will show '{linkedPageNoteTag.tag.name}' page</Label>
            )}
        </YStack>
    )
}