import { Note, NoteTag, Tag } from "notu";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { useManualRefresh } from "../helpers/Hooks";
import { NotuRenderTools } from "../helpers/NotuRenderTools";
import s from '../helpers/NotuStyles';
import NoteTagBadge from "./NoteTagBadge";
import NoteTextEditor from "./NoteTextEditor";
import TagEditor from "./TagEditor";

interface NoteEditorProps {
    notuRenderTools: NotuRenderTools,
    note: Note,
    /** Called when the confirm button is clicked. A false return value will prevent saving, so will a thrown error, which will also display on the note editor */
    canSave?: (note: Note) => Promise<boolean>,
    /** Called when canSave has indicated that the NoteEditor should proceed with the save, and the save has gone through successfully */
    onSave: (note: Note) => void,
    /** Called when the cancel button is clicked */
    onCancel: (note: Note) => void
}


export default function NoteEditor({
    notuRenderTools,
    note,
    canSave = null,
    onSave,
    onCancel
}: NoteEditorProps) {

    if (!note.space)
        return (<Text style={s.text.plain}>Note must define the space that it belongs to</Text>);

    const notu = notuRenderTools.notu;
    const [error, setError] = useState<string>(null);
    const [tagsDropdownFocused, setTagsDropdownFocused] = useState(false);
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
            const canSaveResult = await canSave(note);
            if (!!canSaveResult) {
                await notuRenderTools.notu.saveNotes([note]);
                try { onSave(note); } catch (err) { }
            }
            setError(null);
        }
        catch (err) {
            setError(err.message);
        }
    }

    function getTagsThatCanBeAdded(): Array<Tag> {
        return notu.getTags().filter(t => {
            if (note.tags.find(nt => nt.tag.id == t.id))
                return false;
            return true;
        });
    }

    function getTagsDropdownData(): Array<{label: string, value: number}> {
        return getTagsThatCanBeAdded().map(t => ({
            label: t.getQualifiedName(note.space.id),
            value: t.id
        }));
    }

    function addTagIdToNote(tagId: number): void {
        const tag = getTagsThatCanBeAdded().find(t => t.id == tagId);
        if (!tag) {
            setError('Unable to add tag, something went wrong');
            return;
        }
        note.addTag(tag);
        manualRefresh();
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

    const tagsDropdownData = getTagsDropdownData();

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

            {tagsDropdownData.length > 0 && (
                <Text style={[s.text.plain, s.text.bold]}>Tags</Text>
            )}

            {tagsDropdownData.length > 0 && (
                <Dropdown style={[s.dropdown.main, s.border.main, tagsDropdownFocused && s.dropdown.focused]}
                          placeholderStyle={s.dropdown.placeholder}
                          selectedTextStyle={s.dropdown.selected}
                          data={tagsDropdownData}
                          maxHeight={300}
                          labelField='label'
                          valueField='value'
                          value={null}
                          onFocus={() => setTagsDropdownFocused(true)}
                          onBlur={() => setTagsDropdownFocused(false)}
                          onChange={item => {
                              addTagIdToNote(item.value);
                              setTagsDropdownFocused(false);
                          }}/>
            )}

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