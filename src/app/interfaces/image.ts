import { Book } from "./book";

export interface Image {
  id?: number;
  book?: Book;
  url?: string;
  position?: number;
}
