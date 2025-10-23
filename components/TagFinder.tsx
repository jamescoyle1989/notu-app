import { NotuRenderTools } from "@/helpers/NotuRenderTools";
import { sortBy } from 'es-toolkit';
import { Space, Tag } from "notu";
import { useMemo, useState } from "react";
import { Accordion, Button, Input, Paragraph, ScrollView, Separator, YGroup, YStack } from "tamagui";

interface TagFinderProps {
    notuRenderTools: NotuRenderTools,
    onTagSelected: (tag: Tag) => void,
    tagsToAvoid: Array<Tag>
}


class TagGrouping {
    space: Space;
    children: Array<Tag> = [];

    constructor(space: Space) {
        this.space = space;
    }

    clone(): TagGrouping {
        const result = new TagGrouping(this.space);
        result.children = this.children.slice();
        return result;
    }
}


export default function TagFinder({
    notuRenderTools,
    onTagSelected,
    tagsToAvoid
}: TagFinderProps) {

    const tagGroupings = useMemo(() => {
        return sortBy(notuRenderTools.notu.getSpaces(), [x => x.name])
            .map(space => {
                const grouping = new TagGrouping(space);
                grouping.children = sortBy(
                    notuRenderTools.notu.getTags(space)
                        .filter(x => !tagsToAvoid.find(y => x.id == y.id)),
                    [x => x.name]
                );
                return grouping;
            });
    }, []);

    const [filter, setFilter] = useState('');
    const [filteredResults, setFilteredResults] = useState<Array<Tag>>([]);
    const [filteredTagGroupings, setFilteredTagGroupings] = useState<Array<TagGrouping>>(tagGroupings.map(x => x.clone()));

    function onFilterChange(text: string) {
        const upperText = text.toUpperCase();
        setFilter(text);
        const allTags = notuRenderTools.notu.getTags()
            .filter(x => !tagsToAvoid.find(y => x.id == y.id));

        const results = new Array<Tag>();
        if (text.length > 0) {
            results.push(...allTags.filter(x => x.name.toUpperCase().startsWith(upperText)));
            if (results.length < 5)
                results.push(...allTags.filter(x => 
                    !x.name.toUpperCase().startsWith(upperText) &&
                    x.name.toUpperCase().includes(upperText)
                ));
        }
        setFilteredResults(results.slice(0, 5));

        let filteredGroupings = tagGroupings.map(x => x.clone());
        for (const grouping of filteredGroupings)
            grouping.children = grouping.children.filter(x => x.name.toUpperCase().includes(upperText));
        filteredGroupings = filteredGroupings.filter(x => x.children.length > 0);
        setFilteredTagGroupings(filteredGroupings);
    }

    return (
        <ScrollView>
            <YStack paddingBlockEnd={50}>
                <Input size="$3" placeholder="Filter..." value={filter} onChangeText={onFilterChange} />

                {filteredResults.length > 0 && (
                    <YGroup>
                        {filteredResults.map(tag => (
                            <YGroup.Item key={tag.id}>
                                <Button onPress={() => onTagSelected(tag)}>
                                    {tag.getFullName()}
                                </Button>
                            </YGroup.Item>
                        ))}
                    </YGroup>
                )}
                {filteredResults.length > 0 && filteredTagGroupings.length > 0 && (
                    <Separator />
                )}
                <Accordion overflow="hidden" type="single" collapsible>
                    {filteredTagGroupings.map(grouping => (
                        <Accordion.Item key={grouping.space.id} value={`space${grouping.space.id}`}>
                            <Accordion.Trigger flexDirection="row">
                                {(
                                    ({ open }: { open: boolean }) => (
                                        <Paragraph>{grouping.space.name}</Paragraph>
                                    )
                                )}
                            </Accordion.Trigger>
                            <Accordion.HeightAnimator animation="quickest">
                                <Accordion.Content>
                                    <YGroup>
                                        {grouping.children.map(tag => (
                                            <YGroup.Item>
                                                <Button key={tag.id} onPress={() => onTagSelected(tag)}>
                                                    {tag.name}
                                                </Button>
                                            </YGroup.Item>
                                        ))}
                                    </YGroup>
                                </Accordion.Content>
                            </Accordion.HeightAnimator>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </YStack>
        </ScrollView>
    );
}