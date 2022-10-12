import { User } from "./user";

export interface Address {
    id?: number;
    street?: string;
    postalcode?: number;
    city?: string;
    country?: string;
    users?: Array<User>;
}
