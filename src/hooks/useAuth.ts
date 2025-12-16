import { useAuthStore } from '../store';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    hasRole,
    isAdmin: user?.role === 'admin',
  };
};
