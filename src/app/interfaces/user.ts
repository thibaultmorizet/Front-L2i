import { Address } from "./address";

export interface User {
    id?: number;
    user_lastname?: string;
    user_firstname?: string;
    user_email?: string;
    user_password?: string;
    user_password_confirm?: string;
    user_billing_address?: Address;
    user_delivery_address?: Address;
    orders?: object;
}
