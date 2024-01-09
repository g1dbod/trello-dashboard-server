import { jwtUser } from './user.type';

export type ResUser = {
  access_token: string;
  refresh_token: string;
  user: jwtUser;
};
