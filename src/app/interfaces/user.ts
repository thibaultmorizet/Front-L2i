import { Address } from "./address";

export interface User {
    id?: number;
    lastname?: string;
    firstname?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
    billing_address?: Address;
    delivery_address?: Address;
    orders?: object;
}
