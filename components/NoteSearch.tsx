import { NotuButton, NotuText } from "@/helpers/NotuStyles";
import { Note, Notu, Space } from "notu";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { Input, View, XStack, YStack } from "tamagui";

interface NoteSearchProps {
    /** The space which we're fetching notes from, if null then we're searching across all spaces */
    space?: Space,
    /** The client used for fetching results from the server, only add this if you want notes to be auto-fetched for you */
    notu?: Notu,
    /** The query string which the search field will display and use for querying */
    query?: string,
    /** Optional callback for handling changes to the query text */
    onQueryChanged?: (query: string) => void,
    /** If notu param has not been defined, then use this prop for handling the manual fetching of notes */
    onFetchRequested?: (query: string, space: Space) => Promise<Array<Note>>,
    /** Callback that gets fired when the search has been executed and notes returned */
    onFetched?: (notes: Array<Note>) => void,
    autoFetch?: boolean
}

export interface NoteSearchCommands {
    refresh: () => void
}


export const NoteSearch = React.forwardRef((
    {
        space,
        notu,
        query,
        onQueryChanged,
        onFetchRequested,
        onFetched,
        autoFetch = false
    }: NoteSearchProps,
    ref: React.ForwardedRef<NoteSearchCommands>
) => {

    const [error, setError] = useState<string>(null);

    useImperativeHandle(ref, () => ({
        refresh: () => onSearchSubmit()
    }));

    useEffect(() => {
        if (autoFetch)
            onSearchSubmit();
    }, []);

    function onSearchTextChange(newValue: string): void {
        setError(null);
        if (!!onQueryChanged)
            onQueryChanged(newValue);
    }

    async function onSearchSubmit(): Promise<void> {
        try {
            let searchResults: Array<Note>;
            if (!!notu)
                searchResults = await notu.getNotes(query, space?.id);
            else
                searchResults = await onFetchRequested(query, space);
            if (!!onFetched)
                onFetched(searchResults);
        }
        catch (err) {
            setError(err.message);
        }
    }

    return (
        <YStack>
            <XStack>
                {!!space && (
                    <NotuButton joinedRight
                                flexBasis="auto">
                        {space.name}
                    </NotuButton>
                )}
                <View flex={1}>
                    <Input value={query} onChangeText={onSearchTextChange}
                           borderWidth={1}
                           borderTopLeftRadius={0}
                           borderTopRightRadius={0}
                           borderBottomLeftRadius={0}
                           borderBottomRightRadius={0} />
                </View>
                
                {!!error && (
                    <NotuButton joinedLeft theme="danger" flexBasis="auto">Error!</NotuButton>
                )}
                {!error && (
                    <NotuButton onPress={onSearchSubmit}
                                theme="highlight"
                                joinedLeft flexBasis="auto">
                        Search
                    </NotuButton>
                )}
            </XStack>
            {!!error && (
                <NotuText danger>{error}</NotuText>
            )}
        </YStack>
    )
});