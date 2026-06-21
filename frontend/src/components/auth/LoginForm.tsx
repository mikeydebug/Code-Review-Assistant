'use client';

import { useState } from 'react';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="glass-panel border-white/10">
        <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your email and password to login to your account.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-white/10"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </Button>

          {/* Demo Account Info */}
          <div className="w-full p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-center">
            <p className="text-slate-300 mb-2">Test out the platform instantly</p>
            <div className="flex flex-col gap-1 mb-3 text-slate-400">
              <span><strong>Email:</strong> demo@example.com</span>
              <span><strong>Password:</strong> password123</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-indigo-500/30 hover:bg-indigo-500/20 text-indigo-300"
              onClick={() => {
                setEmail('demo@example.com');
                setPassword('password123');
              }}
            >
              Auto-Fill Demo Credentials
            </Button>
          </div>

          <div className="text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:underline">
              Register
            </Link>
          </div>
        </CardFooter>
      </form>
      </Card>
    </motion.div>
  );
}
