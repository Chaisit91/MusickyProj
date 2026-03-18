import React, { useState } from 'react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Logic for login goes here
    console.log("Logging in with", email, password);
  };

  const handleGoogleLogin = () => {
    // Google login logic goes here
    console.log("Logging in with Google");
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center p-6">
      <header>
        <h1 className="text-4xl font-bold text-green-500 justify-content">MUSICKY</h1>
        <h2 className="flex flex-col text-xl mt-4 justify-content items-center font-semibold">ADMIN LOGIN</h2>
      </header>
      <div className="mt-8 w-full max-w-md">
        <input
          type="email"
          placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 mb-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 mb-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
    </div>
  );
};

export default AdminLogin;