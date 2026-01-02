import { NotuRenderTools } from "@/helpers/NotuRenderTools";
import { NotuText } from "@/helpers/NotuStyles";
import { sortBy } from 'es-toolkit';
import { Space, Tag } from "notu";
import { useMemo, useState } from "react";
import { Accordion, Input, ScrollView, View, YGroup, YStack } from "tamagui";
import TagBadge from "./TagBadge";

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
            })
            .filter(x => x.children.length > 0);
    }, [tagsToAvoid]);

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
                <Input size="$3" placeholder={"Filter..."} placeholderTextColor={'gray'} onChangeText={onFilterChange} />

                {filteredResults.length > 0 && (
                    <YGroup>
                        {filteredResults.map(tag => (
                            <YGroup.Item key={tag.id}>
                                <View onPress={() => onTagSelected(tag)} marginBlock={5} flex={1} flexDirection="row">
                                    <TagBadge tag={tag}
                                              notuRenderTools={notuRenderTools}
                                              contextSpace={null}
                                              useUniqueName={false} />
                                </View>
                            </YGroup.Item>
                        ))}
                    </YGroup>
                )}
                <Accordion overflow="hidden" type="single" collapsible>
                    {filteredTagGroupings.map((grouping, index) => (
                        <Accordion.Item key={grouping.space.id}
                                        value={`space${grouping.space.id}`}
                                        borderWidth={1}
                                        borderTopLeftRadius={5}
                                        borderTopRightRadius={5}
                                        borderBottomLeftRadius={5}
                                        borderBottomRightRadius={5}>
                            <Accordion.Trigger flexDirection="row"
                                               borderWidth={0}
                                               borderTopLeftRadius={5}
                                               borderTopRightRadius={5}
                                               borderBottomLeftRadius={5}
                                               borderBottomRightRadius={5}>
                                {(
                                    ({ open }: { open: boolean }) => (
                                        <NotuText>{grouping.space.name}</NotuText>
                                    )
                                )}
                            </Accordion.Trigger>
                            <Accordion.HeightAnimator animation="quickest">
                                <Accordion.Content borderBottomLeftRadius={5}
                                                   borderBottomRightRadius={5}
                                                   paddingBlockStart={0}>
                                    <YGroup>
                                        {grouping.children.map(tag => (
                                            <YGroup.Item key={tag.id}>
                                                <View onPress={() => onTagSelected(tag)} marginBlock={5}
                                                      flex={1} flexDirection="row">
                                                    <TagBadge tag={tag}
                                                              notuRenderTools={notuRenderTools}
                                                              contextSpace={grouping.space}
                                                              useUniqueName={false} />
                                                </View>
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