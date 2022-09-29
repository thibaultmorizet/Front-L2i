import { Author } from "./author";
import { Editor } from "./editor";
import { Format } from "./format";

export interface Book {
    id?: number;
    book_title?: string;
    book_summary?: string;
    book_unit_price?: number;
    book_stock?: number;
    book_isbn?: string;
    book_image?: string;
    book_format?: Format;
    book_editor?: Editor;
    book_author?: Array<Author>;
    book_year?: string;
}
