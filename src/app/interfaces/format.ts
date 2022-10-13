import { Book } from "./book";

export interface Format {
    id?: number;
    name?: string;
    books?: Array<Book>;
    count_books?: number;
    filter_is_selected?: Boolean;

}
