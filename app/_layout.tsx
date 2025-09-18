import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
    return (
        <Drawer>
            <Drawer.Screen name="(pages)/Page1"
                           options={{
                            drawerLabel: 'Page 1',
                            title: 'Page 1'
                           }} />
            
            <Drawer.Screen name="(pages)/Page2"
                           options={{
                            drawerLabel: 'Page 2',
                            title: 'Page 2'
                           }} />
        </Drawer>
    )
}
