import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "userAuthToken";

// Save the token
export async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    console.log("Token saved successfully!");
  } catch (error) {
    console.error("Error saving token:", error);
  }
}

// Retrieve the token
export async function getToken(): Promise<string | undefined> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      console.log("Token retrieved:", token);
      return token;
    } else {
      console.log("No token found.");
      return;
    }
  } catch (error) {
    console.error("Error retrieving token:", error);
    return;
  }
}

// Delete the token
export async function deleteToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    console.log("Token deleted successfully!");
  } catch (error) {
    console.error("Error deleting token:", error);
  }
}
