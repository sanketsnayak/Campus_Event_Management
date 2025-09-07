import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

const AdminAuth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/admin/login' : '/auth/admin/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await api.post(endpoint, payload);
      
      if (response.data.token) {
        // Store token and user info
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        alert(response.data.message);
        
        // Call onLogin callback to update parent component
        if (onLogin) {
          onLogin(response.data.user);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-800">
            {isLogin ? 'Admin Sign In' : 'Create Admin Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-700">
            Admin Portal - Campus Event Management
          </p>
        </div>

        <Card className="bg-gradient-to-br from-white to-orange-50 border border-orange-200 shadow-lg">
          <CardHeader className="border-b border-orange-100">
            <CardTitle className="text-gray-800">{isLogin ? 'Admin Login' : 'Admin Sign Up'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      required={!isLogin}
                      value={formData.full_name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-orange-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      required={!isLogin}
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Enter a username"
                      className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-orange-50"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-orange-50"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-orange-50"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg" 
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAuth;
