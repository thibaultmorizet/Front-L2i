import { Book } from './book';

export interface Taxe {
  id?: number;
  tva?: number;
  books?: Array<Book>;
}
