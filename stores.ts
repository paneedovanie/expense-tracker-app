import { atom } from "jotai";
import { IUser } from "./types";

export const userStore = atom<IUser>();
export const accessTokenStore = atom<string>();
