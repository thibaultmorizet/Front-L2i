import { Book } from './book';

export interface Author {
  id?: number;
  firstname?: string;
  lastname?: string;
  language?: string;
  name?: string;
  books?: Array<Book>;
}
