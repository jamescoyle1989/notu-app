import { Notu } from "notu";

export class NotuRenderTools {
    private _notu: Notu;
    get notu(): Notu { return this._notu; }

    constructor(
        notu: Notu
    ) {
        this._notu = notu;
    }
}