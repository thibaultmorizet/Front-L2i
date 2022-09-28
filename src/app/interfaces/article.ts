import { Author } from "./author";
import { Editor } from "./editor";
import { Format } from "./format";

export interface Article {
    id?: number;
    article_title?: string;
    article_summary?: string;
    article_unit_price?: number;
    article_stock?: number;
    article_book_isbn?: string;
    article_book_image?: string;
    article_book_format?: Format;
    article_book_editor?: Editor;
    article_book_author?: Array<Author>;
    article_book_year?: string;
}
