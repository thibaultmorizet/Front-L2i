import { Book } from "./book";

export interface Editor {
    id?: number;
    name?: string;
    books?: Array<Book>;
}
