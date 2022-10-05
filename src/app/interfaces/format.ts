import { Book } from "./book";

export interface Format {
    id?: number;
    format_name?: string;
    books?: Array<Book>;
    count_books?: number;
    filter_is_selected?: Boolean;

}