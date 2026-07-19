import { NotuInput, NotuView } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu, ParsedQuery, Tag } from "notu";
import { ReactNode, useState } from "react";
import { Label, XStack } from "tamagui";
import { FilterComponentFactory, FilterComponentProps, SystemSpace } from "./SystemSpace";
import defs from "./SystemSpaceDefs";


export default class TextFilterNoteTagDataComponentFactory implements FilterComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return null;
    }

    getFilterComponent(query: ParsedQuery, onChange: (query: ParsedQuery) => void, notu: Notu): ReactNode {
        return (
            <FilterComponent query={query} onChange={onChange} notu={notu} />
        )
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        const systemSpace = new SystemSpace(notu);
        if (!note.getTag(systemSpace.page))
            throw Error(`Filters can only be added to notes which have the Page tag.`);

        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag, note: Note) {
        return null;
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == defs.internalName &&
            tag.name == defs.textFilter;
    }
}




function FilterComponent({ query, onChange }: FilterComponentProps) {
    const [search, setSearch] = useState('');
    
    function handleSearchChange(newValue: string) {
        setSearch(newValue);

        const newSearchCriteria = `(n.text LIKE '%${!!newValue ? `${newValue}%` : ''}')`;
        const existing = /(n.text LIKE '.*?')/.exec(query.where);
        
        if (!!existing)
            query.where.replace(existing[0], newSearchCriteria);
        else
            query.where = `(${query.where}) AND ${newSearchCriteria}`;

        onChange(query);
    }

    return (
        <NotuView box>
            <XStack style={{alignItems: 'center'}}>
                <Label>Text:</Label>
                <NotuInput value={search} flex={1}
                           onChangeText={handleSearchChange} />
            </XStack>
        </NotuView>
    )
}