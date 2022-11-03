import { Address } from './address';
import { Book } from './book';
import { User } from './user';

export interface Order {
  id?: number;
  user?: User;
  books?: Array<Book>;
  totalpricettc?: number;
  deliveryAddress?: Address;
  billingAddress?: Address;
  date?: Date;
}
