import { Book } from "./book";

export interface Type {
    id?: number;
    type_name?: string;
    books?: Array<Book>;
    count_books?: number;
    filter_is_selected?: Boolean;

}
