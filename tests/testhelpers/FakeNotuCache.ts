
export default class FakeNotuCacheFetcher {

    spacesData: Array<any>;
    async getSpacesData(): Promise<Array<any>> {
        return this.spacesData;
    }

    tagsData: Array<any>;
    async getTagsData(): Promise<Array<any>> {
        return this.tagsData;
    }
}