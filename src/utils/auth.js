import { jwtDecode } from 'jwt-decode';

// Check if token exists and is not expired
export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Convert to seconds
    
    // Check if token is expired
    if (decoded.exp < currentTime) {
      // Token is expired, remove it
      logout();
      return false;
    }
    
    return true;
  } catch (err) {
    // Invalid token, remove it
    logout();
    return false;
  }
};

// Get user role only if token is valid
export const getUserRole = () => {
  if (!isTokenValid()) return null;
  
  const token = localStorage.getItem('token');
  try {
    const decoded = jwtDecode(token);
    return decoded.user.role;
  } catch (err) {
    return null;
  }
};

// Get user data only if token is valid
export const getUserData = () => {
  if (!isTokenValid()) return null;
  
  const token = localStorage.getItem('token');
  try {
    const decoded = jwtDecode(token);
    return decoded.user;
  } catch (err) {
    return null;
  }
};

// Check if user is authenticated (token exists and is valid)
export const isAuthenticated = () => {
  return isTokenValid();
};

// Check if user is admin
export const isAdmin = () => {
  const role = getUserRole();
  return role === 'club-admin';
};

// Logout function that clears localStorage
export const logout = () => {
  localStorage.removeItem('token');
  // Optionally redirect to login page
  // window.location.href = '/login';
};

// Get token expiration time
export const getTokenExpiration = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return new Date(decoded.exp * 1000); // Convert to milliseconds
  } catch (err) {
    return null;
  }
};
