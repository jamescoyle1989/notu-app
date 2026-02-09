import { NotuSelect } from "@/components/NotuSelect";
import TagBadge from "@/components/TagBadge";
import TagFinder from "@/components/TagFinder";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuButton, NotuInput } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode, useState } from "react";
import { Dialog, Input, Label, XStack, YStack } from "tamagui";
import { CreateNoteProcessData } from "./CreateNoteProcessNoteTagData";

export default class CreateNoteProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} note={note} notu={notu} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        const data = new CreateNoteProcessData(noteTag);
        const space = notu.getSpace(data.spaceId);
        if (!space)
            throw Error('Make sure you select a space for new notes to be created in.');
        data.tagIds = data.tagIds.map(x => notu.getTag(x)).filter(x => !!x).map(x => x.id);
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new CreateNoteProcessData(noteTag);
    }
}


function EditorComponent({ noteTag, note, notu }: NoteTagDataComponentProps) {
    const data = new CreateNoteProcessData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;
    const [showTagSelector, setShowTagSelector] = useState(false);
    const addedTags = data.tagIds.map(x => notu.getTag(x)).filter(x => !!x);

    function handleSpaceChange(value: number) {
        data.spaceId = value;
        manualRefresh();
    }

    function handleTextChange(value: string) {
        data.text = value;
        manualRefresh();
    }

    function handleAddTagPress() {
        setShowTagSelector(true);
    }

    function handleTagSelected(tag: Tag) {
        data.tagIds = [tag.id, ...data.tagIds];
        setShowTagSelector(false);
    }

    function handleTagRemoval(tag: Tag) {
        data.tagIds = data.tagIds.filter(x => x != tag.id);
        manualRefresh();
    }

    function onNameChange(newValue: string) {
        data.name = newValue;
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
                <NotuSelect options={notu.getSpaces().map(x => ({ name: x.name, value: x.id }))}
                            value={data.spaceId}
                            onValueChange={handleSpaceChange} />
            </XStack>

            <Label>Text</Label>
            <Input value={data.text}
                   multiline={true}
                   onChangeText={handleTextChange} />

            <XStack marginBlockStart={10}>
                {addedTags.map(tag => (
                    <TagBadge key={tag.id}
                              tag={tag}
                              notu={notu}
                              contextSpace={null}
                              onDelete={() => handleTagRemoval(tag)} />
                ))}
            </XStack>
            <NotuButton onPress={handleAddTagPress}
                        marginBlockStart={3}
                        theme="highlight">
                Add Tag
            </NotuButton>
            <Dialog modal open={showTagSelector}>
                <Dialog.Portal>
                    <Dialog.Overlay key="createnoteprocesstagselectoroverlay"
                                    onPress={() => setShowTagSelector(false)} />
                    <Dialog.FocusScope>
                        <Dialog.Content bordered elevate
                                        width="80%"
                                        key="createnoteprocesstagselectorcontent">
                            <TagFinder notu={notu}
                                       onTagSelected={handleTagSelected}
                                       tagsToAvoid={addedTags} />
                        </Dialog.Content>
                    </Dialog.FocusScope>
                </Dialog.Portal>
            </Dialog>
        </YStack>
    )
}