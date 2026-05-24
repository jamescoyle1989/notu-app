import { destroyNotu, setupNotu } from '@/helpers/NotuSetup';
import { NotuButton, NotuText } from '@/helpers/NotuStyles';
import { DrawerActions } from '@react-navigation/native';
import { Menu } from '@tamagui/lucide-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { File, Paths } from 'expo-file-system/next';
import { Stack, useNavigation } from 'expo-router';
import { View } from 'tamagui';

export default function AboutScreen() {
    const nav = useNavigation();

    async function exportDatabase() {
        const db = new File(Paths.document, 'SQLite/notu.db');
        
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permission.granted) {
            try {
                await destroyNotu();
                const b64 = await FileSystem.readAsStringAsync(
                    db.uri,
                    { encoding: FileSystem.EncodingType.Base64 }
                );
                const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                    permission.directoryUri,
                    'notu.db',
                    'application/octet-stream'
                );
                await FileSystem.writeAsStringAsync(
                    fileUri,
                    b64,
                    { encoding: FileSystem.EncodingType.Base64 }
                );
                await setupNotu();
            }
            catch (err) {
                console.log(err);
            }
        }
    }


    async function importDatabase() {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*',
            copyToCacheDirectory: true
        });

        if (result.canceled)
            return;

        try {
            await destroyNotu();
            const db = new File(Paths.document, 'SQLite/notu.db');
            db.delete();
            new File(result.assets[0].uri).move(db);
            await setupNotu();
            console.log('Finished importing notu DB');
        }
        catch (err) {
            console.log(err);
        }
    }


    return (
        <View bg="$background" flex={1}>
            <Stack.Screen options={{
                title: 'Home',
                headerLeft: () => {
                    return (
                        <Menu onPress={() => {
                            nav.dispatch(DrawerActions.openDrawer());
                        }}/>
                    )
                }
            }} />
            <NotuText>Hello! Welcome to Notu...</NotuText>

            <NotuButton onPress={exportDatabase} theme="highlight">Export Database</NotuButton>

            <NotuButton onPress={importDatabase} theme="highlight">Import Database</NotuButton>
        </View>
    );
}