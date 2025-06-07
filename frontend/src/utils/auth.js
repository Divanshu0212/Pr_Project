export const setUserToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  export const getUserToken = () => {
    return localStorage.getItem('token');
  };
  
  export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
  };