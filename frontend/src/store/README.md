# Redux Store Structure

## Overview
This project uses Redux Toolkit for global state management, specifically for handling authentication state across the application.

## Store Structure

### Auth Slice (`store/authSlice.js`)
Manages authentication-related state including:
- `user`: Current user object (null when not authenticated)
- `isAuthenticated`: Boolean indicating authentication status
- `isLoading`: Boolean for loading states during auth operations
- `error`: Error message string (null when no error)

### Available Actions
- `loginStart()`: Sets loading state to true
- `loginSuccess(user)`: Updates state with authenticated user
- `loginFailure(error)`: Sets error state and clears user data
- `logout()`: Clears all authentication state
- `clearError()`: Clears error messages
- `setLoading(boolean)`: Manually set loading state

### Usage in Components

```javascript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);

  // Use the state and dispatch actions as needed
};
```

## Protected Routes
The `ProtectedRoute` component automatically redirects unauthenticated users to the login page.

## Navigation
The main navigation conditionally shows different links based on authentication status:
- Unauthenticated: Register/Login links
- Authenticated: Home link only

## Benefits
- Centralized authentication state
- Type-safe with TypeScript support
- Automatic re-rendering when state changes
- Protected routes with automatic redirects
- Loading states and error handling