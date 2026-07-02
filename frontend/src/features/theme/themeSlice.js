import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: 'light' },
  reducers: {
    setTheme(state, action) {
      state.mode = action.payload === 'dark' ? 'light' : action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export const selectTheme = (s) => s.theme.mode;
export default themeSlice.reducer;
