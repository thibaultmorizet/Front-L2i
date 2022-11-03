import { Book } from './book';
import { User } from './user';

export interface Order {
  id?: number;
  user?: User;
  booklist?: Array<Book>;
  totalprice?: number;
  deliveryaddress?: string;
  billingaddress?: string;
  date?: Date;
}
