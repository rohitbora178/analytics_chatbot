import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading auth state from localStorage:', err);
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }
};

const saveAuthState = (state) => {
  try {
    const serializedState = JSON.stringify({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      // Don't save isLoading and error to localStorage
    });
    localStorage.setItem('authState', serializedState);
  } catch (err) {
    console.error('Error saving auth state to localStorage:', err);
  }
};

const clearAuthState = () => {
  try {
    localStorage.removeItem('authState');
  } catch (err) {
    console.error('Error clearing auth state from localStorage:', err);
  }
};

const initialState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
      saveAuthState(state);
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;
      saveAuthState(state);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.error = null;
      state.isLoading = false;
      clearAuthState();
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;