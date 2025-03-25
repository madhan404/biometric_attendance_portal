import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // Initialize with null, user info will be in Redux state
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload; // Set user data in Redux state
    },
    logout: (state) => {
      state.user = null;
      sessionStorage.removeItem("authToken"); // Clear token from session storage
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
