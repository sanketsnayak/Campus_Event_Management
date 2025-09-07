import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, MapPin, Users, Star, MessageSquare } from 'lucide-react';
import { api } from '../lib/api.js';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      
      // Fetch actual user registrations from API
      const response = await api.get('/events/my-registrations');
      const userRegistrations = response.data || [];
      
      // Transform the data to match the expected format
      const formattedRegistrations = userRegistrations.map(reg => ({
        id: reg.event_id,
        title: reg.title,
        description: reg.description,
        date: reg.date,
        time: reg.time,
        location: reg.location,
        max_participants: reg.max_participants,
        registrationDate: reg.registered_at,
        registration_id: reg.registration_id,
        status: new Date(reg.date) > new Date() ? 'upcoming' : 'past',
        feedbackGiven: false // Can be enhanced later
      }));
        
      setRegistrations(formattedRegistrations);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      // If API fails, show empty array instead of mock data
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (eventId) => {
    if (window.confirm('Are you sure you want to unregister from this event?')) {
      try {
        await api.delete(`/events/${eventId}/unregister`);
        
        // Refresh the registrations list
        await fetchMyRegistrations();
        alert('Successfully unregistered from the event!');
      } catch (error) {
        console.error('Failed to unregister:', error);
        alert(error.response?.data?.error || 'Failed to unregister. Please try again.');
      }
    }
  };

  const handleFeedback = (eventId, eventTitle) => {
    // Create a simple feedback modal using prompt (can be enhanced with a proper modal later)
    const rating = prompt(`Rate your experience for "${eventTitle}" (1-5 stars):`);
    
    if (rating === null) return; // User cancelled
    
    const numRating = parseInt(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      alert('Please enter a valid rating between 1 and 5');
      return;
    }
    
    const comment = prompt(`Please share your feedback about "${eventTitle}":`);
    
    if (comment === null) return; // User cancelled
    
    if (!comment.trim()) {
      alert('Please provide some feedback comments');
      return;
    }
    
    submitFeedback(eventId, numRating, comment.trim());
  };

  const submitFeedback = async (eventId, rating, comment) => {
    try {
      await api.post(`/feedback/events/${eventId}/feedback`, {
        rating,
        comment
      });
      
      alert('Thank you for your feedback!');
      
      // Refresh registrations to update feedback status
      await fetchMyRegistrations();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert(error.response?.data?.error || 'Failed to submit feedback. Please try again.');
    }
  };

  const upcomingRegistrations = registrations.filter(reg => reg.status === 'upcoming');
  const pastRegistrations = registrations.filter(reg => reg.status === 'past');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-rose-700">Loading your registrations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50">
      {/* Clean Header */}
      <div className="bg-gradient-to-r from-rose-100 to-pink-100 border-b border-rose-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">My Registrations</h1>
            <p className="text-lg text-gray-700">View and manage your event registrations</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg border border-rose-300 p-6 text-center shadow-sm">
            <Users className="h-8 w-8 text-rose-700 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-rose-800 uppercase tracking-wide">Total Registrations</h3>
            <p className="text-2xl font-bold text-rose-900">{registrations.length}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg border border-emerald-300 p-6 text-center shadow-sm">
            <Calendar className="h-8 w-8 text-emerald-700 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-emerald-800 uppercase tracking-wide">Upcoming Events</h3>
            <p className="text-2xl font-bold text-emerald-900">{upcomingRegistrations.length}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg border border-purple-300 p-6 text-center shadow-sm">
            <Star className="h-8 w-8 text-purple-700 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Events Attended</h3>
            <p className="text-2xl font-bold text-gray-900">{pastRegistrations.length}</p>
          </div>
        </div>

        {/* Upcoming Registrations */}
        {upcomingRegistrations.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
              <p className="text-gray-600">Events you're registered for</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingRegistrations.map((registration) => (
                <Card key={registration.id} className="bg-gradient-to-br from-white to-rose-50 border border-rose-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-800 leading-tight">{registration.title}</CardTitle>
                      <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">Upcoming</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                      {registration.description || 'No description available'}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-700 bg-rose-50 p-2 rounded-lg">
                        <Calendar className="h-4 w-4 mr-3 text-rose-600" />
                        <span>
                          {new Date(registration.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700 bg-rose-50 p-2 rounded-lg">
                        <Clock className="h-4 w-4 mr-3 text-rose-600" />
                        <span>{registration.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700 bg-rose-50 p-2 rounded-lg">
                        <MapPin className="h-4 w-4 mr-3 text-rose-600" />
                        <span>{registration.location}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnregister(registration.id)}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Unregister
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Past Registrations */}
        {pastRegistrations.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Past Events</h2>
              <p className="text-gray-600">Events you have attended</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastRegistrations.map((registration) => (
                <Card key={registration.id} className="bg-white border border-gray-200 opacity-75 hover:opacity-100 transition-opacity duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-700 leading-tight">{registration.title}</CardTitle>
                      <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">Attended</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                      {registration.description || 'No description available'}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                        <span>
                          {new Date(registration.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-3 text-gray-400" />
                        <span>{registration.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                        <span>{registration.location}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant={registration.feedbackGiven ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleFeedback(registration.id, registration.title)}
                      className={`w-full ${registration.feedbackGiven ? 'text-gray-600 border-gray-300' : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {registration.feedbackGiven ? 'Update Feedback' : 'Give Feedback'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Simple Empty State */}
        {registrations.length === 0 && (
          <div className="text-center py-16">
            <Card className="max-w-md mx-auto bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-12">
                <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">No registrations yet</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  You haven't registered for any events yet. Browse events to get started!
                </p>
                <Button className="bg-gray-800 hover:bg-gray-700 text-white">
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;
