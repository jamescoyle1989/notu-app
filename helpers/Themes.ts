const light = {
    background: '#fff',
    backgroundHover: '#f5f5f5',
    backgroundPress: '#e0e0e0',
    backgroundFocus: '#d5d5d5',
    backgroundStrong: '#ccc',
    backgroundTransparent: 'rgba(255, 255, 255, 0.5)',
    color: '#000',
    colorHover: '#111',
    colorPress: '#222',
    colorFocus: '#333',
    colorTransparent: 'rgba(0, 0, 0, 0.5)',
    borderColor: '#444',
    borderColorHover: '#555',
    borderColorFocus: '#666',
    borderColorPress: '#777',
    shadowColor: '#837A75',
    shadowColorHover: '#837A75'
};

type BaseTheme = typeof light;

const dark: BaseTheme = {
    background: '#141115',
    backgroundHover: '#201B22',
    backgroundPress: '#0B090B',
    backgroundFocus: '#201B22',
    backgroundStrong: '#2B242D',
    backgroundTransparent: '#14111580',
    color: '#F5F4F6',
    colorHover: '#ECE8ED',
    colorPress: '#E2DDE4',
    colorFocus: '#ECE8ED',
    colorTransparent: '#F5F4F680',
    borderColor: '#555',
    borderColorHover: '#666',
    borderColorFocus: '#777',
    borderColorPress: '#888',
    shadowColor: '#837A75',
    shadowColorHover: '#837A75'
};


const light_highlight: BaseTheme = {
    ...light,
    background: '#49D4C6',
    backgroundHover: '#5AD8CC',
    backgroundPress: '#2FC6B7',
    backgroundFocus: '#5AD8CC',
    backgroundStrong: '#6ADCD1',
    backgroundTransparent: '#49D4C680'
};

const dark_highlight: BaseTheme = {
    ...dark,
    background: '#7F7EFF',
    backgroundHover: '#9999FF',
    backgroundPress: '#5C5CFF',
    backgroundFocus: '#9999FF',
    backgroundStrong: '#ADADFF',
    backgroundTransparent: '#7F7EFF80'
};


const light_danger: BaseTheme = {
    ...light,
    background: '#EA3449',
    backgroundHover: '#EC465A',
    backgroundPress: '#DE172E',
    backgroundFocus: '#EC465A',
    backgroundStrong: '#EE596A',
    backgroundTransparent: '#EA344980'
};

const dark_danger: BaseTheme = {
    ...dark,
    background: '#EA3449',
    backgroundHover: '#EC465A',
    backgroundPress: '#DE172E',
    backgroundFocus: '#EC465A',
    backgroundStrong: '#EE596A',
    backgroundTransparent: '#EA344980'
}


export const themes = {
    light,
    light_highlight,
    light_danger,
    dark,
    dark_highlight,
    dark_danger
};