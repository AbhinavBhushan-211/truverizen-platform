import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  /* ---------------- VALIDATION ---------------- */

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(value)) {
      setEmailError('Enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validEmail = validateEmail(email);
    const validPassword = validatePassword(password);

    if (!validEmail || !validPassword) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        'http://16.16.197.117:5050/authenticate',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (!data.is_success) {
        throw new Error('Invalid email or password');
      }

      const apiUser = data.user;

      const user = {
        id: String(apiUser.id),
        name: apiUser.name,
        email: apiUser.email,
        role: 'admin' as const
      };

      const token = 'server-session'; // backend does not provide token yet

      login(user, token);

      if (rememberMe) {
        localStorage.setItem('truverizen_user', JSON.stringify(user));
      }

      toast.success('Login successful', {
        description: `Welcome back, ${user.name}`
      });

      navigate('/applications');
    } catch (err: any) {
      toast.error('Login failed', {
        description: err.message || 'Something went wrong'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-2xl">Welcome to Truverizen</CardTitle>
              <CardDescription>
                Sign in to access your workspace
              </CardDescription>

              <div className="flex justify-center">
                <div className="flex items-center gap-2 mt-2 px-4 py-1.5 bg-green-50 rounded-full">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">
                    Secure Login
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => validateEmail(email)}
                  />
                  {emailError && (
                    <p className="text-sm text-red-600">{emailError}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <Label>Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => validatePassword(password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {passwordError && (
                    <p className="text-sm text-red-600">{passwordError}</p>
                  )}
                </div>

                {/* Remember me */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={rememberMe}
                    // Fix: Explicitly type 'v' as boolean | 'indeterminate'
                    onCheckedChange={(v: boolean | 'indeterminate') => 
                      setRememberMe(v === true)
                    }
                  />
                  <span className="text-sm">Remember me for 30 days</span>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Signing in...'
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            © 2024 Truverizen. All rights reserved.
          </p>
        </motion.div>
      </div>

      <ForgotPasswordModal
        open={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
}
