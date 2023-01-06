import { Category } from './category';
import { Author } from './author';
import { Editor } from './editor';
import { Format } from './format';

export interface Book {
  id?: number;
  isbn?: string;
  format?: Format;
  editor?: Editor;
  author?: Array<Author>;
  category?: Array<Category>;
}
