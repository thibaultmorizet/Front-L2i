import { Author } from "./author";
import { Editor } from "./editor";
import { Format } from "./format";

export interface Book {
    id?: number;
    title?: string;
    summary?: string;
    unitprice?: number;
    stock?: number;
    isbn?: string;
    image?: string;
    format?: Format;
    editor?: Editor;
    author?: Array<Author>;
    year?: string;
    number_ordered?: number;
    totalprice?: number;
}
