import { Product } from './product';

export interface Author {
  id?: number;
  firstname?: string;
  lastname?: string;
  language?: string;
  name?: string;
  products?: Array<Product>;
}
