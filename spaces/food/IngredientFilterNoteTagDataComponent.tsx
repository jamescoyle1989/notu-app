import { NotuInput, NotuView } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu, ParsedQuery, ParsedTagFilter, Tag } from "notu";
import { ReactNode, useState } from "react";
import { Label, XStack } from "tamagui";
import { FilterComponentFactory, FilterComponentProps, SystemSpace } from "../system/SystemSpace";
import { FoodSpace } from "./FoodSpace";
import { FoodSpaceSetup } from "./FoodSpaceSetup";

export default class IngredientFilterNoteTagDataComponentFactory implements FilterComponentFactory {
    
    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return null;
    }

    getFilterComponent(query: ParsedQuery, onChange: (query: ParsedQuery) => void, notu: Notu): ReactNode {
        return (
            <FilterComponent query={query} onChange={onChange} notu={notu} />
        );
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        const systemSpace = new SystemSpace(notu);
        if (!note.getTag(systemSpace.page))
            throw Error(`Filters can only be added to notes which have the Page tag.`);

        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return null;
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == FoodSpaceSetup.internalName &&
            tag.name == FoodSpaceSetup.ingredientFilter;
    }
}




function FilterComponent({ query, onChange, notu }: FilterComponentProps) {
    const [search, setSearch] = useState('');
    const foodSpace = new FoodSpace(notu);

    function handleSearchChange(newValue: string) {
        setSearch(newValue);

        for (let i = 0; i < query.tags.length; i++) {
            const tag = query.tags[i];
            if (tag.name != foodSpace.recipe.name && tag.name != foodSpace.meal.name)
                continue;
            if (tag.space != null && tag.space != foodSpace.space.name)
                continue;

            const filterExists = !!tag.filter;
            if (!filterExists)
                tag.filter = new ParsedTagFilter();
            tag.filter.exps.push('ingredients');
            const expName = `{exp${tag.filter.exps.length - 1}}`;
            const filter = `EXISTS(SELECT 1 FROM json_each(${expName}) ing WHERE ing.value->>'name' LIKE '%${newValue}%')`;
            if (!filterExists)
                tag.filter.pattern = filter;
            else
                tag.filter.pattern = `(${tag.filter.pattern}) AND ${filter}`
        }
        onChange(query);
    }
    
    return (
        <NotuView box>
            <XStack style={{alignItems: 'center'}}>
                <Label>Ingredient:</Label>
                <NotuInput value={search} flex={1}
                           onChangeText={handleSearchChange} />
            </XStack>
        </NotuView>
    );
}