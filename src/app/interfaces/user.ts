import { Address } from './address';

export interface User {
  id?: number;
  lastname?: string;
  firstname?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  billingAddress?: Address;
  deliveryAddress?: Address;
  orders?: object;
  roles?: Array<string>;
  language?: string;
}
