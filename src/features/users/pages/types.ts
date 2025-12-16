export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'normal';
  status: 'active' | 'revoked';
  lastLogin: string;
  company: string;
  avatar?: string;
  // Password is not stored in the main User object for security, 
  // but handled in the form data.
}

export interface Company {
  id: string;
  name: string;
  pocName: string;
  pocEmail: string;
  pocMobile: string;
  location: string;
  userType: 'admin' | 'normal';
  validity: string;
  status: 'active' | 'expired';
  totalUsers: number;
}