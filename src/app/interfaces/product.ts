import { Category } from './category';
import { Author } from './author';
import { Editor } from './editor';
import { Format } from './format';
import { Taxe } from './taxe';
import { Comment } from './comment';
import { Brand } from './brand';

export interface Product {
  id?: number;
  title?: string;
  summary?: string;
  unitpriceht?: number;
  stock?: number;
  isbn?: string;
  image?: string;
  format?: Format;
  editor?: Editor;
  taxe?: Taxe;
  author?: Array<Author>;
  category?: Array<Category>;
  year?: string;
  number_ordered?: number;
  totalpricettc?: number;
  totalpriceht?: number;
  visitnumber?: number;
  soldnumber?: number;
  comments?: Array<Comment>;
  brand?: Brand;
  type?: string;
}
