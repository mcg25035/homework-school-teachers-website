import React, { useState } from 'react';

function Login({ login }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const result = await login(username, password);
    if (result.success) {
      // SWR in App.js will handle state update and re-render
    } else {
      setError(result.error);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <h1>Login</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
