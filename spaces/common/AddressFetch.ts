export async function convertAddressUrlToCoordinates(url: string): Promise<{longitude: string, latitude: string}> {
    let response = await fetch(url);
    const responseText = await response.text();
    const previewUrl = getPreviewPageUrl(responseText);
    console.log(previewUrl);
    if (!previewUrl)
        return null;
    const previewResponse = await fetch(previewUrl);
    if (!previewResponse.ok)
        return null;
    const previewText = await previewResponse.text();
    return extractCoordinatesFromPreviewText(previewText);
}

function extractCoordinatesFromUrl(url: string): {longitude: string, latitude: string} {
    const regex = /\@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const result = regex.exec(url);
    if (!result)
        return null;
    const latitude = result[1];
    const longitude = result[2];
    return {longitude, latitude};
}

function getPreviewPageUrl(responseText: string): string | null {
    const regex = /<link href="(\/maps\/preview\/place\?[^"]*)/;
    const result = regex.exec(responseText);
    if (!result)
        return null;
    return `https://maps.google.com${result[1].replaceAll('&amp;', '&')}`;
}

function extractCoordinatesFromPreviewText(previewText: string): {longitude: string, latitude: string} | null {
    const regex = /,\[null,null,([\d-\.]*),([\d-\.]*)],/;
    const result = regex.exec(previewText);
    if (!result)
        return null;
    const latitude = result[1];
    const longitude = result[2];
    return {longitude, latitude};
}