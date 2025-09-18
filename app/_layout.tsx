import { Drawer } from "expo-router/drawer";

export default function RootLayout() {
    return (
        <Drawer>
            <Drawer.Screen name="index"
                           options={{
                            drawerLabel: 'Home',
                            title: 'Home'
                           }} />

            <Drawer.Screen name="about"
                           options={{
                            drawerLabel: 'About',
                            title: 'About'
                           }} />

            <Drawer.Screen name="Page1"
                           options={{
                            drawerLabel: 'Page 1',
                            title: 'Page 1'
                           }} />
            
            <Drawer.Screen name="Page2"
                           options={{
                            drawerLabel: 'Page 2',
                            title: 'Page 2'
                           }} />
        </Drawer>
    )
}
