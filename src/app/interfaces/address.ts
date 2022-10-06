import { User } from "./user";

export interface Address {
    id?: number;
    address_street?: string;
    address_postalcode?: number;
    address_city?: string;
    address_country?: string;
    users?: Array<User>;
}
