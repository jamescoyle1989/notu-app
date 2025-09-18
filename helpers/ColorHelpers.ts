import chroma from 'chroma-js';

export function getTextContrastColor(backgroundColor: string): string {
    const whiteContrast = chroma.contrast(backgroundColor, '#FFF');
    const blackContrast = chroma.contrast(backgroundColor, '#000');
    return (whiteContrast > blackContrast) ? '#FFF' : '#000';
}