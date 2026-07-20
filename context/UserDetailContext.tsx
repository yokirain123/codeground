import { createContext } from "react";

export const UserDetailContext = createContext<unknown>({
  userDetail:undefined,
  setUserDetail: () => {}
});