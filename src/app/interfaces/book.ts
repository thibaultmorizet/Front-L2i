import { Type } from "./type";
import { Author } from "./author";
import { Editor } from "./editor";
import { Format } from "./format";
import { Taxe } from "./taxe";
import { Image } from "./image";

export interface Book {
    id?: number;
    title?: string;
    summary?: string;
    unitpriceht?: number;
    stock?: number;
    isbn?: string;
    images?: Array<Image>;
    format?: Format;
    editor?: Editor;
    taxe?: Taxe;
    author?: Array<Author>;
    type?: Array<Type>;
    year?: string;
    number_ordered?: number;
    totalpricettc?: number;
    totalpriceht?: number;
    visitnumber?:number;
    soldnumber?:number;
}
