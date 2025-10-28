import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';

export const tamaguiConfig = createTamagui(defaultConfig);
tamaguiConfig.settings.styleCompat = 'react-native';

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}