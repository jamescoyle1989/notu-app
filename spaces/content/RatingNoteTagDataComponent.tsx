import { NotuSelect } from "@/components/NotuSelect";
import { NumberInput } from "@/components/NumberInput";
import { NoteTagDataComponentFactory, NoteTagDataComponentProps } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { Note, NoteTag, Notu, Tag } from "notu";
import { ReactNode, useEffect } from "react";
import { Label, XStack, YStack } from "tamagui";
import { ContentSpace } from "./ContentSpace";
import { ContentSpaceSetup } from "./ContentSpaceSetup";
import { RatingData } from "./RatingNoteTagData";

export default class RatingNoteTagDataComponentFactory implements NoteTagDataComponentFactory {

    getBadgeComponent(noteTag: NoteTag, note: Note, notu: Notu, textColor: string): ReactNode {
        const data = new RatingData(noteTag);
        if (data.type == 'Percent') {
            return (<NotuText small color={textColor}>{data.value}%</NotuText>);
        }
        else if (data.type == 'Fraction') {
            return (<NotuText small color={textColor}>{data.value}/{data.scale}</NotuText>);
        }
        return null;
    }

    getEditorComponent(noteTag: NoteTag, note: Note, notu: Notu, refreshCallback: () => void): ReactNode {
        return (<EditorComponent noteTag={noteTag} notu={notu} refreshCallback={refreshCallback} />);
    }

    validate(noteTag: NoteTag, note: Note, notu: Notu): Promise<boolean> {
        return Promise.resolve(true);
    }

    getDataObject(noteTag: NoteTag) {
        return new RatingData(noteTag);
    }

    isForNoteTag(note: Note, tag: Tag): boolean {
        return tag.space.internalName == ContentSpaceSetup.internalName &&
            tag.name == ContentSpaceSetup.rating;
    }
}


function EditorComponent({ noteTag, notu, refreshCallback }: NoteTagDataComponentProps) {
    const data = new RatingData(noteTag);
    const labelWidth = 120;

    useEffect(() => {
        let running = true;
        fetch();
        return () => { running = false };

        async function fetch() {
            const contentSpace = new ContentSpace(notu);
            const existingRatingNote = (await notu.getNotes(
                `#[${contentSpace.rating.getFullName()}] ORDER BY n.id DESC`
            )).find(x => true);
            if (running && !!existingRatingNote) {
                const existingRating = existingRatingNote.getTagData(contentSpace.rating, RatingData);
                data.type = existingRating.type;
                data.scale = existingRating.scale;
                refreshCallback();
            }
        }
    }, []);

    function handleTypeChange(value: 'Percent' | 'Fraction') {
        data.type = value;
        refreshCallback();
    }

    function handleValueChange(value: number) {
        data.value = value;
        refreshCallback();
    }

    function handleScaleChange(value: number) {
        data.scale = value;
        refreshCallback();
    }

    return (
        <YStack>
            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Type</Label>
                <NotuSelect value={data.type}
                            onValueChange={handleTypeChange}
                            options={[
                                {name: 'Percent', value: 'Percent'},
                                {name: 'Fraction', value: 'Fraction'}
                            ]} />
            </XStack>

            <XStack style={{alignItems: 'center'}}>
                <Label width={labelWidth}>Value</Label>
                <NumberInput numberValue={data.value}
                             onNumberChange={handleValueChange} />
            </XStack>

            {data.type == 'Fraction' && (
                <XStack style={{alignItems: 'center'}}>
                    <Label width={labelWidth}>Scale</Label>
                    <NumberInput numberValue={data.scale}
                                 onNumberChange={handleScaleChange} />
                </XStack>
            )}
        </YStack>
    );
}