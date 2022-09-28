export interface User {
    id?: number;
    user_lastname?: string;
    user_firstname?: string;
    user_email?: string;
    user_password?: string;
    user_billing_address?: object;
    user_delivery_address?: object;
    orders?: object;
}
