export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  image: string;
  hashedRt: string;
};

export type jwtUser = {
  id: string;
  email: string;
  name: string;
  image: string;
};
