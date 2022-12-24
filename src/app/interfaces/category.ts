import { Book } from "./book";

export interface Category {
    id?: number;
    name?: string;
    books?: Array<Book>;
}
