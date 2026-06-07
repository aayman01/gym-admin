export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AdminLoginPayload = {
  email: string;
  password: string;
};
