import { NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Tag } from "notu";
import { useState } from "react";
import { Button, Dialog, View, XStack } from "tamagui";
import { useManualRefresh } from "../helpers/Hooks";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import NoteTagBadge from "./NoteTagBadge";
import NoteTextEditor from "./NoteTextEditor";
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

    const [showTextComponentView, setShowTextComponentView] = useState(false);

    const noteDateStr = `${note.date.toDateString()} ${note.date.getHours().toString().padStart(2, '0')}:${note.date.getMinutes().toString().padStart(2, '0')}`;

    async function submitNote(): Promise<void> {
        try {
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

    function onTagSelected(tag: Tag): void {
        note.addTag(tag);
        setShowTagSelector(false);
    }

    function removeTagFromNote(noteTag: NoteTag): void {
        note.removeTag(noteTag.tag);
        manualRefresh();
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
            <View key={noteTag.tag.id}>
                <NotuText bold>{noteTag.tag.getQualifiedName(note.space.id)}</NotuText>
                {editorComponent}
            </View>
        );
    }

    return (
        <View>
            {!!error && (<NotuText bold danger>{error}</NotuText>)}

            <NotuText bold>{note.space.name}</NotuText>

            <NotuText italic>{noteDateStr}</NotuText>

            <TagEditor note={note} tags={notu.getTags()}/>

            <XStack>
                <NotuText bold>Text </NotuText>
                <NotuText pressable onPress={() => setShowTextComponentView(!showTextComponentView)}>
                    {showTextComponentView ? 'Components View' : 'Raw View'}
                </NotuText>
            </XStack>

            <NoteTextEditor notuRenderTools={notuRenderTools}
                            note={note}
                            mode={showTextComponentView ? 'Components' : 'Raw'}/>

            <Button onPress={() => setShowTagSelector(true)}>Add Tag</Button>
            <Dialog modal open={showTagSelector}>
                <Dialog.Portal>
                    <Dialog.Overlay key="noteeditortagselectoroverlay" />
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

            {note.tags.map(nt => renderNoteTagData(nt))}
            
            <Button onPress={submitNote}>Submit</Button>
        </View>
    )
}