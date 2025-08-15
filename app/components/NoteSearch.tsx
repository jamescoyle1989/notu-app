import { Note, Notu, Space } from "notu";
import React, { useEffect, useImperativeHandle, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import s from '../helpers/NotuStyles';

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
        <View>
            <View style={[s.view.row]}>
                {!!space && (
                    <TouchableOpacity disabled
                                    style={[
                                        s.touch.button,
                                        s.view.autoSize,
                                        s.border.joinedRight,
                                        s.touch.inactive
                                    ]}>
                        <Text style={s.text.plain}>{space.name}</Text>
                    </TouchableOpacity>
                )}
                <View style={{flex:1}}>
                    <TextInput value={query} onChangeText={onSearchTextChange}
                        style={[
                                s.text.plain,
                                s.border.main,
                                s.view.grow1,
                                !!space && s.border.joinedLeft,
                                s.border.joinedRight
                        ]}/>
                </View>
                
                {!!error && (
                    <TouchableOpacity disabled
                                    style={[
                                        s.touch.button,
                                        s.touch.danger,
                                        s.view.autoSize,
                                        s.border.joinedLeft
                                    ]}>
                        <Text style={[s.text.plain]}>Error!</Text>
                    </TouchableOpacity>
                )}
                {!error && (
                    <TouchableOpacity onPress={onSearchSubmit}
                                    style={[s.touch.button, s.view.autoSize, s.border.joinedLeft]}>
                        <Text style={[s.text.plain]}>Search</Text>
                    </TouchableOpacity>
                )}
            </View>
            {!!error && (
                <Text style={[s.text.danger]}>{error}</Text>
            )}
        </View>
    )
});