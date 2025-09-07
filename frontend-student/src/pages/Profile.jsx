import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Mail, School, BookOpen, Calendar, Phone, Edit2, Save, X } from 'lucide-react';

const Profile = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    student_id: user?.student_id || '',
    university: user?.university || '',
    department: user?.department || '',
    year: user?.year || '',
    phone: user?.phone || ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    // Here you would typically send the updated data to the API
    // For now, we'll just show an alert and exit edit mode
    alert('Profile updated successfully! (Note: This is a demo - changes are not persisted)');
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      student_id: user?.student_id || '',
      university: user?.university || '',
      department: user?.department || '',
      year: user?.year || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Clean Header */}
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 border-b border-emerald-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
              <p className="text-lg text-gray-700">Manage your personal information</p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-200 shadow-lg">
              <CardHeader className="border-b border-emerald-100">
                <CardTitle className="text-xl font-semibold text-gray-800">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <User className="h-4 w-4 inline mr-2 text-emerald-600" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="text-gray-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">{formData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Mail className="h-4 w-4 inline mr-2 text-emerald-600" />
                      Email
                    </label>
                    {isEditing ? (
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="text-gray-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">{formData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <BookOpen className="h-4 w-4 inline mr-2 text-emerald-600" />
                      Student ID
                    </label>
                    {isEditing ? (
                      <Input
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleInputChange}
                        placeholder="Enter your student ID"
                        className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="text-gray-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">{formData.student_id}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Phone className="h-4 w-4 inline mr-2 text-emerald-600" />
                      Phone (Optional)
                    </label>
                    {isEditing ? (
                      <Input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    ) : (
                      <p className="text-gray-800 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        {formData.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Academic Information */}
          <div>
            <Card className="bg-gradient-to-br from-white to-teal-50 border border-teal-200 shadow-lg">
              <CardHeader className="border-b border-teal-100">
                <CardTitle className="text-xl font-semibold text-gray-800">Academic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <School className="h-4 w-4 inline mr-2 text-teal-600" />
                    University
                  </label>
                  {isEditing ? (
                    <Input
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      placeholder="Enter your university"
                      className="border-teal-300 focus:border-teal-500 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="text-gray-800 bg-teal-50 p-3 rounded-lg border border-teal-200">{formData.university}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <BookOpen className="h-4 w-4 inline mr-2 text-teal-600" />
                    Department
                  </label>
                  {isEditing ? (
                    <Input
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="Enter your department"
                      className="border-teal-300 focus:border-teal-500 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="text-gray-800 bg-teal-50 p-3 rounded-lg border border-teal-200">{formData.department}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Calendar className="h-4 w-4 inline mr-2 text-teal-600" />
                    Year
                  </label>
                  {isEditing ? (
                    <Input
                      name="year"
                      type="number"
                      value={formData.year}
                      onChange={handleInputChange}
                      placeholder="Enter your year"
                      min="1"
                      max="4"
                      className="border-teal-300 focus:border-teal-500 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="text-gray-800 bg-teal-50 p-3 rounded-lg border border-teal-200">
                      Year {formData.year}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Account Information */}
        <Card className="bg-gradient-to-br from-white to-cyan-50 border border-cyan-200 shadow-lg mt-6">
          <CardHeader className="border-b border-cyan-100">
            <CardTitle className="text-xl font-semibold text-gray-800">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Type
                </label>
                <p className="text-gray-800 bg-cyan-50 p-3 rounded-lg border border-cyan-200">Student</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Member Since
                </label>
                <p className="text-gray-800 bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
