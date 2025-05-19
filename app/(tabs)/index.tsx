import { Link } from "expo-router";
import { Notu, NotuCache, NotuHttpClient, Space, Tag } from "notu";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import TagBadge from "../components/TagBadge";
import { NotuRenderTools } from "../helpers/NotuRenderTools";

const renderTools = new NotuRenderTools(
    new Notu(
        new NotuHttpClient('asdf'),
        new NotuCache({
            getSpacesData() {
                return Promise.resolve([]);
            },
            getTagsData() {
                return Promise.resolve([]);
            }
        })
    )
);

export default function Index() {

    const space = new Space('Test space');
    space.id = 1;
    const tag = new Tag('Test tag').in(space);
    tag.id = 123;
    tag.color = '#D00';

    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        async function loadCacheData() {
            await renderTools.notu.cache.populate();
            setIsLoaded(true);
        }
        loadCacheData();
    }, []);

    return (
        <View
            style={styles.container}
        >
            <Text style={styles.text}>Edit app/index.tsx to edit this screen.</Text>
            <Link href="/about" style={styles.button}>Go to About screen</Link>

            {isLoaded && (
                <Text style={styles.text}>Here's a simple tag badge: <TagBadge tag={tag} notuRenderTools={renderTools} contextSpace={space} useUniqueName={false} onDelete={() => {}}/></Text>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#25292E',
        alignItems: 'center',
        justifyContent: 'center'
    },

    text: {
        color: '#FFF'
    },

    button: {
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#FFF'
    }
})