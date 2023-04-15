import { Brand } from './brand';
import {Author} from "./author";
import {Category} from "./category";

export interface Video {
  id?: number;
  brand?: Brand;
  author?: Array<Author>;
  category?: Array<Category>;

}
