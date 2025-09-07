import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { api } from '../lib/api';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    student_id: '',
    university: '',
    department: '',
    year: '',
    phone: ''
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
      const endpoint = isLogin ? '/auth/student/login' : '/auth/student/signup';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back' : 'Join Campus Events'}
          </h2>
          <p className="text-lg text-gray-700">
            Student Portal - Campus Event Management
          </p>
        </div>

        <Card className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 shadow-lg">
          <CardHeader className="text-center border-b border-purple-100 pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required={!isLogin}
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-purple-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-2">
                      Student ID
                    </label>
                    <Input
                      id="student_id"
                      name="student_id"
                      type="text"
                      required={!isLogin}
                      value={formData.student_id}
                      onChange={handleInputChange}
                      placeholder="Enter your student ID"
                      className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-purple-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-2">
                      University
                    </label>
                    <Input
                      id="university"
                      name="university"
                      type="text"
                      required={!isLogin}
                      value={formData.university}
                      onChange={handleInputChange}
                      placeholder="Enter your university"
                      className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-purple-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <Input
                      id="department"
                      name="department"
                      type="text"
                      required={!isLogin}
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Enter your department"
                      className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-purple-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                      Year
                    </label>
                    <Input
                      id="year"
                      name="year"
                      type="number"
                      required={!isLogin}
                      value={formData.year}
                      onChange={handleInputChange}
                      placeholder="Enter your year (1-4)"
                      min="1"
                      max="4"
                      className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-purple-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone (Optional)
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-purple-50"
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-purple-50"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="border-purple-300 focus:border-purple-500 focus:ring-purple-500 bg-purple-50"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 text-lg font-medium shadow-lg" 
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Create one" 
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

export default AuthPage;
