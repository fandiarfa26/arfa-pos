'use client';

import { useState } from 'react';
import { register } from '@/features/auth/services/auth.service';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    try {
      await register(email, password);
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleRegister();
      }}>
        <input onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email" required />
        <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
