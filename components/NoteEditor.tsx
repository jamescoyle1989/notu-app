import { Note, NoteTag, Tag } from "notu";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Button, Dialog } from "tamagui";
import { useManualRefresh } from "../helpers/Hooks";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';
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
        return (<Text style={s.text.plain}>Note must define the space that it belongs to</Text>);

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
                <Text style={[s.text.plain, s.text.bold]}>{noteTag.tag.getQualifiedName(note.space.id)}</Text>
                {editorComponent}
            </View>
        );
    }

    return (
        <View>
            {!!error && (<Text style={[s.text.danger, s.text.bold]}>{error}</Text>)}

            <Text style={[s.text.plain, s.text.bold]}>{note.space.name}</Text>

            <Text style={[s.text.plain, s.text.italic]}>{noteDateStr}</Text>

            <TagEditor note={note} tags={notu.getTags()}/>

            <Text>
                <Text style={[s.text.plain, s.text.bold]}>Text </Text>
                <Text style={s.text.link} onPress={() => setShowTextComponentView(!showTextComponentView)}>
                    {showTextComponentView ? 'Components View' : 'Raw View'}
                </Text>
            </Text>

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
                <View style={s.container.row}>
                    {note.tags.map(nt => (
                        <NoteTagBadge key={nt.tag.id}
                                      noteTag={nt}
                                      note={note}
                                      notuRenderTools={notuRenderTools}
                                      contextSpace={note.space}
                                      onDelete={() => removeTagFromNote(nt)}/>
                    ))}
                </View>
            )}

            {note.tags.map(nt => renderNoteTagData(nt))}

            <TouchableOpacity style={s.touch.button} onPress={submitNote}>
                <Text style={s.text.plain}>Submit</Text>
            </TouchableOpacity>
        </View>
    )
}