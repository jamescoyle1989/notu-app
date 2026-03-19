import { Notu, Space, Tag } from "notu";
import { LogicalSpace } from "../LogicalSpace";
import { ContentSpaceSetup } from "./ContentSpaceSetup";

export class ContentSpace implements LogicalSpace {
    
    private _space: Space;
    get space(): Space { return this._space; }

    private _medium: Tag;
    get medium(): Tag { return this._medium; }

    private _genre: Tag;
    get genre(): Tag { return this._genre; }

    private _rating: Tag;
    get rating(): Tag { return this._rating; }

    constructor(notu: Notu) {
        this._load(notu);
    }

    private _load(notu: Notu) {
        this._space = notu.getSpaceByInternalName(ContentSpaceSetup.internalName);
        this._medium = notu.getTagByName(ContentSpaceSetup.medium, this._space);
        this._genre = notu.getTagByName(ContentSpaceSetup.genre, this._space);
        this._rating = notu.getTagByName(ContentSpaceSetup.rating, this._space);
    }
}