import { useState } from "react";

// components/RegisterForm.js

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error('Registration failed');
      const data = await response.json();
      console.log('User registered:', data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

  return (
    <form onSubmit={handleRegister}>
      <h2>Register for the Game</h2>
      <div>
        <label htmlFor="email">Email:</label>
        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}