import { Book } from "./book";

export interface Type {
    id?: number;
    name?: string;
    books?: Array<Book>;
}
