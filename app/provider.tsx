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
  const { user, isLoaded, isSignedIn } = useUser();

  const [userDetail, setUserDetail] = useState();

  const userId = user?.id;

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !userId) {
      return;
    }

    const createNewUser = async () => {
      try {
        const result = await axios.post("/api/user");

        setUserDetail(result.data);
      } catch (error) {
        console.error("Failed to save user:", error);
      }
    };

    void createNewUser();
  }, [isLoaded, isSignedIn, userId]);

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