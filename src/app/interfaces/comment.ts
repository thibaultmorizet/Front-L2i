import { Commentstatut } from './commentstatut';
import { Product } from './product';
import { User } from './user';

export interface Comment {
  id?: number;
  user?: User;
  product?: Product;
  text?: string;
  createdAt?: Date;
  commentstatut?:Commentstatut
}
