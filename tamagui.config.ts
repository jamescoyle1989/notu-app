import { defaultConfig } from '@tamagui/config/v4';
import { createTamagui } from 'tamagui';
import { themes } from './helpers/Themes';

export const tamaguiConfig = createTamagui({
    shorthands: defaultConfig.shorthands,
    animations: defaultConfig.animations,
    fonts: defaultConfig.fonts,
    media: defaultConfig.media,
    settings: defaultConfig.settings,
    themes: themes,
    tokens: defaultConfig.tokens
});
tamaguiConfig.settings.styleCompat = 'react-native';

export default tamaguiConfig;

export type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}