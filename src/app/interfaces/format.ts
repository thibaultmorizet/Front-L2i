import { Book } from "./book";

export interface Format {
    id?: number;
    name?: string;
    books?: Array<Book>;
}
