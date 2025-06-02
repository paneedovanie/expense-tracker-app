import { authService } from "@/services";
import {
  IUser,
  TChangePasswordInput,
  TLoginInput,
  TPasswordResetInput,
  TRegisterInput,
  TUpdateAuthUserInput,
} from "@/types";
import { deleteToken, getToken } from "@/utils";
import { useEffect } from "react";
import { useMutation, useQuery } from "react-query";
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

  useQuery<IUser, Error>(
    ["getUser", accessToken],
    () => authService.getUser(),
    {
      enabled: !user && !!accessToken, // Only fetch when accessToken exists
      onSuccess: setUser,
      onError: async (err) => {
        await deleteToken();
        setIsFetching(false);
      },
      retry: 0,
      staleTime: 5000,
    }
  );

  const { mutate: register, isLoading: isRegistering } = useMutation<
    IUser,
    Error,
    TRegisterInput
  >(async (input: TRegisterInput) => {
    const result = await authService.register(input);
    return result;
  });

  const { mutate: login, isLoading: isLoggingIn } = useMutation<
    void,
    Error,
    TLoginInput
  >((input: TLoginInput) => authService.login(input));

  const { mutate: devLogin, isLoading: isDevLoggingIn } = useMutation<
    { accessToken: string },
    Error,
    TLoginInput
  >((input: TLoginInput) => authService.devLogin(input));

  const { mutate: passwordReset, isLoading: isPasswordResetting } = useMutation<
    void,
    Error,
    TPasswordResetInput
  >((input: TPasswordResetInput) => authService.passwordReset(input));

  const { mutate: updateUser, isLoading: isUpdatingAuthUser } = useMutation<
    IUser,
    Error,
    TUpdateAuthUserInput
  >((input: TUpdateAuthUserInput) => authService.updateUser(input));

  const { mutate: changePassword, isLoading: isPasswordChanging } = useMutation<
    void,
    Error,
    TChangePasswordInput
  >((input: TChangePasswordInput) => authService.changePassword(input));

  const logout = () => {
    setAccessToken(undefined);
    setUser(undefined);
    deleteToken();
  };

  useEffect(() => {
    // If accessTokenParam exists and is different from current accessToken, update it
    if (accessTokenParam && accessToken !== accessTokenParam) {
      setAccessToken(accessTokenParam);
      return;
    }

    // If accessToken is already set, do nothing
    if (accessToken) {
      return;
    }

    // Otherwise, try to get token from storage
    getToken().then((storedToken) => {
      if (storedToken) {
        setAccessToken(storedToken);
      } else {
        setIsFetching(false);
      }
    });
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
