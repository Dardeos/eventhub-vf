import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Sends registration data to the backend and redirects to login on success
      await api.post('/register/', formData);
      alert('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error("Registration Error:", err.response?.data || err.message);
      const serverMsg = err.response?.data;
      setError(typeof serverMsg === 'object' 
        ? Object.values(serverMsg).flat().join(' ') 
        : 'Failed to create account.');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-brand-bg transition-colors duration-300">
      
      <div className="hidden lg:flex flex-col justify-center items-center lg:w-1/2 bg-blue-900 relative">
        <div className="absolute inset-0 bg-cover bg-center opacity-40"></div>
        <div className="relative z-10 text-center px-12">
          <h2 className="text-5xl font-extrabold text-white mb-6 tracking-tight">EventHub</h2>
          <p className="text-xl text-blue-200 leading-relaxed">
            The easiest way to manage your events and participants.
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8 sm:p-12 md:p-20 bg-brand-bg">

        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-text mb-2">Create Account</h1>
            <p className="text-brand-text opacity-60">Enter your details to get started.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 rounded mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-bold text-brand-text uppercase tracking-wider opacity-70">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="john_doe"
                onChange={handleChange}
                className="block w-full p-3 rounded-lg border border-brand-border bg-brand-card text-brand-text placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-bold text-brand-text uppercase tracking-wider opacity-70">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@mail.com"
                onChange={handleChange}
                className="block w-full p-3 rounded-lg border border-brand-border bg-brand-card text-brand-text placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-bold text-brand-text uppercase tracking-wider opacity-70">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
                className="block w-full p-3 rounded-lg border border-brand-border bg-brand-card text-brand-text placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold text-lg py-3 rounded-lg hover:bg-blue-700 shadow-lg transform transition active:scale-[0.98] mt-2"
            >
              Sign Up
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-brand-text">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-600 hover:underline transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;