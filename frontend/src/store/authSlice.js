import { createSlice } from '@reduxjs/toolkit';

// Định nghĩa trạng thái ban đầu
const initialState = {
  user: null, // Trạng thái người dùng
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    //Cập nhật trạng thái liên quan đến thông tin người dùng và trạng thái xác thực.
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
