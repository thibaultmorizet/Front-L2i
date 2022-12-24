import { Product } from "./product";

export interface Editor {
    id?: number;
    name?: string;
    products?: Array<Product>;
}
