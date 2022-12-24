import { Product } from "./product";

export interface Format {
    id?: number;
    name?: string;
    products?: Array<Product>;
}
