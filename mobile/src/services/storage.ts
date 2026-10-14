import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'skillswap_mobile_token';
const USER_KEY = 'skillswap_mobile_user';

// In-memory fallback for environments where SecureStore may not be available (like web previews)
const memoryStore = new Map<string, string>();

export const storage = {
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(TOKEN_KEY);
        }
        return memoryStore.get(TOKEN_KEY) || null;
      }
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return memoryStore.get(TOKEN_KEY) || null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(TOKEN_KEY, token);
        }
        memoryStore.set(TOKEN_KEY, token);
        return;
      }
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch {
      memoryStore.set(TOKEN_KEY, token);
    }
  },

  async removeToken(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(TOKEN_KEY);
        }
        memoryStore.delete(TOKEN_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      memoryStore.delete(TOKEN_KEY);
    }
  },

  async getUser(): Promise<any | null> {
    try {
      let raw: string | null = null;
      if (Platform.OS === 'web') {
        raw = typeof localStorage !== 'undefined' ? localStorage.getItem(USER_KEY) : memoryStore.get(USER_KEY) || null;
      } else {
        raw = await SecureStore.getItemAsync(USER_KEY);
      }
      return raw ? JSON.parse(raw) : null;
    } catch {
      const raw = memoryStore.get(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    }
  },

  async setUser(user: any): Promise<void> {
    const raw = JSON.stringify(user);
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(USER_KEY, raw);
        }
        memoryStore.set(USER_KEY, raw);
        return;
      }
      await SecureStore.setItemAsync(USER_KEY, raw);
    } catch {
      memoryStore.set(USER_KEY, raw);
    }
  },

  async removeUser(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(USER_KEY);
        }
        memoryStore.delete(USER_KEY);
        return;
      }
      await SecureStore.deleteItemAsync(USER_KEY);
    } catch {
      memoryStore.delete(USER_KEY);
    }
  },

  async clearAll(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  }
};
