import { Product } from './product';

export interface Taxe {
  id?: number;
  tva?: number;
  products?: Array<Product>;
}
