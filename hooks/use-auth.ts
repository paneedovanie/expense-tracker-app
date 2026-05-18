import { authService } from "@/services";
import {
  IUser,
  TChangePasswordInput,
  TLoginInput,
  TPasswordResetInput,
  TRegisterInput,
  TUpdateAuthUserInput,
} from "@/types";
import { deleteToken, getToken, saveToken } from "@/utils";
import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { accessTokenStore, userStore } from "@/stores";
import { useLocalSearchParams } from "expo-router";

const isFetchingStore = atom<boolean>(true);

export const useAuth = () => {
  const searchParams = useLocalSearchParams();
  const accessTokenParam = searchParams.accessToken as string;
  const [accessToken, setAccessToken] = useAtom(accessTokenStore);
  const [user, setUser] = useAtom(userStore);
  const [isFetching, setIsFetching] = useAtom(isFetchingStore);

  useQuery({
    queryKey: ["getUser", accessToken],
    queryFn: () => authService.getUser(),
    enabled: !user && !!accessToken,
    staleTime: 5000,
    select: (data) => {
      setUser(data);
      return data;
    },
    retry: 0,
  });

  const { mutate: register, isPending: isRegistering } = useMutation({
    mutationFn: (input: TRegisterInput) => authService.register(input),
  });

  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: (input: TLoginInput) => authService.login(input),
  });

  const { mutate: devLogin, isPending: isDevLoggingIn } = useMutation({
    mutationFn: (input: TLoginInput) => authService.devLogin(input),
  });

  const { mutate: passwordReset, isPending: isPasswordResetting } = useMutation({
    mutationFn: (input: TPasswordResetInput) => authService.passwordReset(input),
  });

  const { mutate: updateUser, isPending: isUpdatingAuthUser } = useMutation({
    mutationFn: (input: TUpdateAuthUserInput) => authService.updateUser(input),
  });

  const { mutate: changePassword, isPending: isPasswordChanging } = useMutation({
    mutationFn: (input: TChangePasswordInput) => authService.changePassword(input),
  });

  const logout = () => {
    setAccessToken(undefined);
    setUser(undefined);
    deleteToken();
  };

  const initToken = async () => {
    if (accessTokenParam && accessToken !== accessTokenParam) {
      await saveToken(accessTokenParam);
      setAccessToken(accessTokenParam);
      return;
    }

    if (accessToken) {
      return;
    }

    getToken().then((storedToken) => {
      if (storedToken) {
        setAccessToken(storedToken);
      } else {
        setIsFetching(false);
      }
    });
  };

  useEffect(() => {
    initToken();
  }, [accessTokenParam, setAccessToken, setIsFetching]);

  const isLoading =
    isLoggingIn ||
    isDevLoggingIn ||
    isRegistering ||
    isPasswordResetting ||
    isPasswordChanging ||
    isUpdatingAuthUser;

  if (user && isFetching) {
    setIsFetching(false);
  }

  return {
    user,
    isFetching,
    isLoading,
    register,
    login,
    devLogin,
    updateUser,
    passwordReset,
    changePassword,
    logout,
  };
};