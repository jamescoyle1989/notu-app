import { NotuText, NotuView } from "@/helpers/NotuStyles";
import { Note, NoteTag, Space, Tag } from "notu";
import { useRef, useState } from "react";
import { Keyboard } from "react-native";
import { Button, Dialog, ScrollView, Theme, XStack, YStack } from "tamagui";
import { useManualRefresh } from "../helpers/Hooks";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import NoteTagBadge from "./NoteTagBadge";
import { NoteTextEditor, NoteTextEditorCommands } from "./NoteTextEditor";
import { NotuSelect } from "./NotuSelect";
import TagEditor from "./TagEditor";
import TagFinder from "./TagFinder";

interface NoteEditorProps {
    notuRenderTools: NotuRenderTools,
    note: Note,
    /** Called when the save has gone through successfully */
    onSave: (note: Note) => void
}


export default function NoteEditor({
    notuRenderTools,
    note,
    onSave
}: NoteEditorProps) {

    if (!note.space)
        return (<NotuText danger>Note must define the space that it belongs to</NotuText>);

    const notu = notuRenderTools.notu;
    const [error, setError] = useState<string>(null);
    const [showTagSelector, setShowTagSelector] = useState(false);
    const manualRefresh = useManualRefresh();
    const textEditorRef = useRef<NoteTextEditorCommands>(null);

    const noteDateStr = `${note.date.toDateString()} ${note.date.getHours().toString().padStart(2, '0')}:${note.date.getMinutes().toString().padStart(2, '0')}`;

    async function submitNote(): Promise<void> {
        try {
            textEditorRef.current.updateNote();
            for (const nt of note.tags) {
                const ntd = notuRenderTools.getComponentFactoryForNoteTag(nt.tag, note);
                if (!!ntd) {
                    const ntdValidateResult = await ntd.validate(nt, note, notuRenderTools.notu);
                    if (!ntdValidateResult) {
                        setError(null);
                        return;
                    }
                }
            }
            await notuRenderTools.notu.saveNotes([note]);
            try { onSave(note); } catch (err) { }
            setError(null);
        }
        catch (err) {
            setError(err.message);
        }
    }

    function onSpaceChange(space: Space): void {
        note.space = space;
        manualRefresh();
    }

    function onTagSelected(tag: Tag): void {
        note.addTag(tag);
        setShowTagSelector(false);
    }

    function removeTagFromNote(noteTag: NoteTag): void {
        note.removeTag(noteTag.tag);
        manualRefresh();
    }

    function handleAddTagPress(): void {
        setShowTagSelector(true);
        Keyboard.dismiss();
    }

    function renderNoteTagData(noteTag: NoteTag) {
        const componentFactory = notuRenderTools.getComponentFactoryForNoteTag(noteTag.tag, note);
        if (!componentFactory)
            return;

        if (!noteTag.data)
            noteTag.data = {};

        const editorComponent = componentFactory.getEditorComponent(
            noteTag,
            note,
            notuRenderTools.notu,
            manualRefresh
        );
        if (!editorComponent)
            return;

        return (
            <Theme name="box" key={noteTag.tag.id}>
                <NotuView bg="$background"
                          borderRadius={10}
                          marginBlockStart={10}
                          padding={5}>
                    
                    <Theme reset>
                        <NotuText bold>{noteTag.tag.getQualifiedName(note.space.id)}</NotuText>
                        {editorComponent}
                    </Theme>
                </NotuView>
            </Theme>
        );
    }

    return (
        <ScrollView>
            <YStack paddingBlockEnd={100}>
                {!!error && (<NotuText bold danger>{error}</NotuText>)}

                <NotuText>
                    <NotuText bold>Date: </NotuText>
                    <NotuText italic>{noteDateStr}</NotuText>
                </NotuText>

                <NotuText bold marginTop={10}>Space</NotuText>

                <NotuSelect options={notu.getSpaces().map(x => {return {name: x.name, value: x}})}
                            value={note.space}
                            onValueChange={onSpaceChange}
                            placeholderText='Select Space' />

                <TagEditor note={note} tags={notu.getTags()}/>

                <NoteTextEditor ref={textEditorRef}
                                notuRenderTools={notuRenderTools}
                                note={note} />

                <NotuText bold marginTop={10}>Tags</NotuText>

                {note.tags.length > 0 && (
                    <XStack flexWrap="wrap">
                        {note.tags.map(nt => (
                            <NoteTagBadge key={nt.tag.id}
                                        noteTag={nt}
                                        note={note}
                                        notuRenderTools={notuRenderTools}
                                        contextSpace={note.space}
                                        onDelete={() => removeTagFromNote(nt)}/>
                        ))}
                    </XStack>
                )}

                <Button theme="highlight"
                        marginBlockStart={10}
                        onPress={handleAddTagPress}>
                    Add Tag
                </Button>
                <Dialog modal open={showTagSelector}>
                    <Dialog.Portal>
                        <Dialog.Overlay key="noteeditortagselectoroverlay" onPress={() => setShowTagSelector(false)} />
                        <Dialog.FocusScope>
                            <Dialog.Content bordered elevate
                                            width="80%"
                                            key="noteeditortagselectorcontent">
                                <TagFinder notuRenderTools={notuRenderTools}
                                        onTagSelected={onTagSelected}
                                        tagsToAvoid={note.tags.map(x => x.tag)} />
                            </Dialog.Content>
                        </Dialog.FocusScope>
                    </Dialog.Portal>
                </Dialog>

                {note.tags.map(nt => renderNoteTagData(nt))}
                
                <Button theme="highlight"
                        marginBlockStart={10}
                        onPress={submitNote}>
                    Submit
                </Button>
            </YStack>
        </ScrollView>
    )
}