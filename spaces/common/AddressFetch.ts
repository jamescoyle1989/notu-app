export async function convertAddressUrlToCoordinates(url: string): Promise<{longitude: string, latitude: string}> {
    let coordinates = extractCoordinatesFromUrl(url);
    if (!!coordinates)
        return coordinates;
    
    let response = await fetch(url);
    coordinates = extractCoordinatesFromUrl(response.url);
    if (!!coordinates)
        return coordinates;
    
    const text = await response.text();
    coordinates = extractCoordinatesFromResponseText(text);
    return coordinates;
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

function extractCoordinatesFromResponseText(text: string): {longitude: string, latitude: string} {
    //This will do a best attempt to extract the text from the content of google's response. It's incredibly unlabeled data though, so this is probably flaky as hell.
    const regex = /\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/;
    text = text.substring(text.indexOf('window.APP_INITIALIZATION_STATE='));
    const result = regex.exec(text);
    if (!result)
        return null;
    const latitude = result[1];
    const longitude = result[2];
    return {longitude, latitude};
}