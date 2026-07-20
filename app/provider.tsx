"use client";

import React, {
  useEffect,
  useState,
} from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

import { UserDetailContext } from "@/context/UserDetailContext";

function Provider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { user } = useUser();

  const [userDetail, setUserDetail] = useState();

  useEffect(() => {
    if (!user) {
      return;
    }

    const createNewUser = async () => {
      const result = await axios.post("/api/user", {});

      console.log(result);
      setUserDetail(result.data);
    };

    void createNewUser();
  }, [user]);

  return (
    <NextThemesProvider {...props}>
      <UserDetailContext.Provider
        value={{
          userDetail,
          setUserDetail,
        }}
      >
        {children}
      </UserDetailContext.Provider>
    </NextThemesProvider>
  );
}

export default Provider;