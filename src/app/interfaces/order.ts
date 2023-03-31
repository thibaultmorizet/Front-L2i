import { Product } from './product';
import { User } from './user';

export interface Order {
  id?: number;
  user?: User;
  productlist?: Array<Product>;
  totalpricettc?: number;
  totalpriceht?: number;
  deliveryaddress?: string;
  billingaddress?: string;
  date?: Date;
  invoicepath?: string
}
