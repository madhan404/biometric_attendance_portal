import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Initialize with null, user info will be in Redux state
  isAuthenticated: false,
  lastPath: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload; // Set user data in Redux state
      state.isAuthenticated = true;
      state.lastPath = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.lastPath = null;
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
    },
    setLastPath: (state, action) => {
      state.lastPath = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  },
});

export const { login, logout, setLastPath, updateUser } = authSlice.actions;
export default authSlice.reducer;
