import { NotuSelect } from "@/components/NotuSelect";
import TagBadge from "@/components/TagBadge";
import TagFinder from "@/components/TagFinder";
import { useManualRefresh } from "@/helpers/Hooks";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuButton, NotuInput, NotuText } from "@/helpers/NotuStyles";
import { Check } from "@tamagui/lucide-icons";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode, useState } from "react";
import { Checkbox, CheckedState, Dialog, Label, XStack, YStack } from "tamagui";
import { EditNoteProcessData } from "./EditNoteProcessNoteTagData";

export default class EditNoteProcessNoteTagDataComponentFactory implements NoteTagDataComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} note={note} notu={notu} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        const data = new EditNoteProcessData(noteTag);
        const space = notu.getSpace(data.spaceId);
        if (!space)
            data.spaceId = -1;
        data.addTagIds = data.addTagIds.map(x => notu.getTag(x)).filter(x => !!x).map(x => x.id);
        data.removeTagIds = data.removeTagIds.map(x => notu.getTag(x)).filter(x => !!x).map(x => x.id);
        for (const id of data.addTagIds) {
            if (!!data.removeTagIds.find(x => x == id))
                throw Error('Tag has been set for both addition and removal');
        }
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new EditNoteProcessData(noteTag);
    }
}


function EditorComponent({ noteTag, note, notu }: NoteTagDataComponentProps) {
    const data = new EditNoteProcessData(noteTag);
    const manualRefresh = useManualRefresh();
    const labelWidth = 120;
    const [showTagSelector, setShowTagSelector] = useState(0);
    const addedTags = [...data.addTagIds, ...data.removeTagIds].map(x => notu.getTag(x)).filter(x => !!x);

    function onNameChange(newValue: string) {
        data.name = newValue;
        manualRefresh();
    }

    function handleSpaceChange(value: number) {
        data.spaceId = value;
        manualRefresh();
    }

    function handleAddTagPress() {
        setShowTagSelector(1);
    }

    function handleRemoveTagPress() {
        setShowTagSelector(-1);
    }

    function handleTagSelected(tag: Tag) {
        if (showTagSelector == 1)
            data.addTagIds = [tag.id, ...data.addTagIds];
        else if (showTagSelector == -1)
            data.removeTagIds = [tag.id, ...data.removeTagIds];
        setShowTagSelector(0);
    }

    function handleTagRemoval(tag: Tag) {
        data.addTagIds = data.addTagIds.filter(x => x != tag.id);
        data.removeTagIds = data.removeTagIds.filter(x => x != tag.id);
        manualRefresh();
    }

    function handleShowEditorToggle(checkState: CheckedState) {
        data.hasEditorSettings = (checkState.valueOf() == true);
        manualRefresh();
    }

    function handleCanEditSpaceToggle(checkState: CheckedState) {
        data.editorSettings.canEditSpace = (checkState.valueOf() == true);
        manualRefresh();
    }

    function handleCanEditOwnTagToggle(checkState: CheckedState) {
        data.editorSettings.canEditOwnTag = (checkState.valueOf() == true);
        manualRefresh();
    }

    function handleCanEditTextToggle(checkState: CheckedState) {
        data.editorSettings.canEditText = (checkState.valueOf() == true);
        manualRefresh();
    }

    function handleCanEditTagsToggle(checkState: CheckedState) {
        data.editorSettings.canEditTags = (checkState.valueOf() == true);
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
                <NotuSelect options={[
                                { name: '---Unchanged---', value: -1 },
                                ...notu.getSpaces().map(x => ({ name: x.name, value: x.id }))
                            ]}
                            value={data.spaceId}
                            onValueChange={handleSpaceChange} />
            </XStack>

            <XStack marginBlockStart={10}>
                {addedTags.map(tag => {
                    const isAdd = !!data.addTagIds.find(x => tag.id == x);
                    return (
                        <XStack key={tag.id} marginInlineEnd={3}>
                            <NotuText>{isAdd ? '+' : '-'}</NotuText>
                            <TagBadge tag={tag}
                                      notu={notu}
                                      contextSpace={null}
                                      onDelete={() => handleTagRemoval(tag)} />
                        </XStack>
                    )
                })}
            </XStack>
            <NotuButton onPress={handleAddTagPress}
                        marginBlockStart={3}
                        theme="highlight">
                Add Tag
            </NotuButton>
            <NotuButton onPress={handleRemoveTagPress}
                        marginBlockStart={3}
                        theme="highlight">
                Remove Tag
            </NotuButton>
            <Dialog modal open={showTagSelector != 0}>
                <Dialog.Portal>
                    <Dialog.Overlay key="createnoteprocesstagselectoroverlay"
                                    onPress={() => setShowTagSelector(0)} />
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

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Show Editor</Label>
                <Checkbox checked={data.hasEditorSettings} onCheckedChange={handleShowEditorToggle}>
                    <Checkbox.Indicator>
                        <Check />
                    </Checkbox.Indicator>
                </Checkbox>
            </XStack>
            {data.hasEditorSettings && (
                <YStack>
                    <XStack style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>Can Edit Space</Label>
                        <Checkbox checked={data.editorSettings.canEditSpace} onCheckedChange={handleCanEditSpaceToggle}>
                            <Checkbox.Indicator>
                                <Check />
                            </Checkbox.Indicator>
                        </Checkbox>
                    </XStack>

                    <XStack style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>Can Edit Own Tag</Label>
                        <Checkbox checked={data.editorSettings.canEditOwnTag} onCheckedChange={handleCanEditOwnTagToggle}>
                            <Checkbox.Indicator>
                                <Check />
                            </Checkbox.Indicator>
                        </Checkbox>
                    </XStack>

                    <XStack style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>Can Edit Text</Label>
                        <Checkbox checked={data.editorSettings.canEditText} onCheckedChange={handleCanEditTextToggle}>
                            <Checkbox.Indicator>
                                <Check />
                            </Checkbox.Indicator>
                        </Checkbox>
                    </XStack>

                    <XStack style={{alignItems: 'center'}}>
                        <Label width={labelWidth}>Can Edit Tags</Label>
                        <Checkbox checked={data.editorSettings.canEditTags} onCheckedChange={handleCanEditTagsToggle}>
                            <Checkbox.Indicator>
                                <Check />
                            </Checkbox.Indicator>
                        </Checkbox>
                    </XStack>
                </YStack>
            )}
        </YStack>
    );
}