import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../lib/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("/auth/login", { username, password });
          set({
            user: res.data.user,
            token: res.data.token,
            isLoading: false,
          });
          console.log("✅ Login success:", res.data);
          return true;
        } catch (err) {
          console.error("❌ Login error:", err.response?.data || err.message);
          set({
            isLoading: false,
            error: err.response?.data?.error || "Login failed",
          });
          return false;
        }
      },
      register: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post("/auth/register", { username, password });
          set({
            user: res.data.user,
            token: res.data.token,
            isLoading: false,
          });
          console.log("✅ Register success:", res.data);
          return true;
        } catch (err) {
          console.error("❌ Register error:", err.response?.data || err.message);
          set({
            isLoading: false,
            error: err.response?.data?.error || "Register failed",
          });
          return false;
        }
      },
      fetchProfile: async () => {
        try {
          const res = await api.get("/auth/profile");
          set({ user: res.data.user });
        } catch (err) {
          console.error("❌ Profile fetch error:", err);
        }
      },

      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage), 
    }
  )
);
