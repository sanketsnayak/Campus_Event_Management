import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Clock, MapPin, Users, Star, BookOpen, Trophy, Music, Code, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());

  // Dynamic event icon selector
  const getEventIcon = (title, description) => {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('tech') || text.includes('hack') || text.includes('coding') || text.includes('workshop')) return Code;
    if (text.includes('music') || text.includes('concert') || text.includes('fest')) return Music;
    if (text.includes('sports') || text.includes('competition') || text.includes('tournament')) return Trophy;
    if (text.includes('academic') || text.includes('lecture') || text.includes('seminar')) return BookOpen;
    return Calendar;
  };

  // Simple category colors
  const getEventCategory = (title, description) => {
    const text = (title + ' ' + description).toLowerCase();
    if (text.includes('tech') || text.includes('hack') || text.includes('coding') || text.includes('workshop')) return 'tech';
    if (text.includes('music') || text.includes('concert') || text.includes('fest')) return 'cultural';
    if (text.includes('sports') || text.includes('competition') || text.includes('tournament')) return 'sports';
    if (text.includes('academic') || text.includes('lecture') || text.includes('seminar')) return 'academic';
    return 'general';
  };

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      const response = await api.get('/events/my-registrations');
      const registrations = response.data || [];
      const registeredIds = new Set(registrations.map(reg => reg.event_id));
      setRegisteredEvents(registeredIds);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/register`);
      setRegisteredEvents(prev => new Set([...prev, eventId]));
      
      // Create a clean success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-2xl z-50 transform transition-all duration-300 translate-x-full border border-slate-700';
      notification.innerHTML = `
        <div class="flex items-center">
          <div class="bg-slate-700 rounded-full p-1 mr-3">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p class="font-semibold">Successfully registered!</p>
            <p class="text-sm text-slate-300">You're all set for this event.</p>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Animate in
      setTimeout(() => notification.classList.remove('translate-x-full'), 100);
      
      // Remove after 4 seconds
      setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 4000);
      
    } catch (error) {
      console.error('Failed to register:', error);
      
      // Create a clean error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-900 text-white px-6 py-4 rounded-lg shadow-2xl z-50 transform transition-all duration-300 translate-x-full border border-red-800';
      notification.innerHTML = `
        <div class="flex items-center">
          <div class="bg-red-800 rounded-full p-1 mr-3">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <div>
            <p class="font-semibold">Registration failed</p>
            <p class="text-sm text-red-300">${error.response?.data?.error || 'Please try again later.'}</p>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Animate in
      setTimeout(() => notification.classList.remove('translate-x-full'), 100);
      
      // Remove after 4 seconds
      setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notification), 300);
      }, 4000);
    }
  };

  const handleUnregister = async (eventId) => {
    // Clean confirmation modal
    const confirmModal = document.createElement('div');
    confirmModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    confirmModal.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-md mx-4 transform transition-all duration-300 scale-95 shadow-2xl">
        <div class="text-center">
          <div class="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 mb-2">Unregister from Event?</h3>
          <p class="text-gray-600 mb-6">Are you sure you want to unregister? You can always register again later.</p>
          <div class="flex gap-3">
            <button id="cancel-btn" class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Keep Registration
            </button>
            <button id="confirm-btn" class="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all">
              Yes, Unregister
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmModal);
    setTimeout(() => confirmModal.querySelector('div').classList.remove('scale-95'), 100);
    
    return new Promise((resolve) => {
      confirmModal.querySelector('#cancel-btn').onclick = () => {
        confirmModal.remove();
        resolve(false);
      };
      
      confirmModal.querySelector('#confirm-btn').onclick = async () => {
        confirmModal.remove();
        
        try {
          await api.delete(`/events/${eventId}/unregister`);
          setRegisteredEvents(prev => {
            const newSet = new Set(prev);
            newSet.delete(eventId);
            return newSet;
          });
          
          // Success notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-slate-700 text-white px-6 py-4 rounded-lg shadow-2xl z-50 transform transition-all duration-300 translate-x-full border border-slate-600';
          notification.innerHTML = `
            <div class="flex items-center">
              <div class="bg-slate-600 rounded-full p-1 mr-3">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <p class="font-semibold">Successfully unregistered</p>
                <p class="text-sm text-slate-300">You can register again anytime.</p>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          setTimeout(() => notification.classList.remove('translate-x-full'), 100);
          setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => document.body.removeChild(notification), 300);
          }, 4000);
          
        } catch (error) {
          console.error('Failed to unregister:', error);
            // Error notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-red-900 text-white px-6 py-4 rounded-lg shadow-2xl z-50 transform transition-all duration-300 translate-x-full border border-red-800';
          notification.innerHTML = `
            <div class="flex items-center">
              <div class="bg-red-800 rounded-full p-1 mr-3">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div>
                <p class="font-semibold">Unregistration failed</p>
                <p class="text-sm text-red-300">${error.response?.data?.error || 'Please try again later.'}</p>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          setTimeout(() => notification.classList.remove('translate-x-full'), 100);
          setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => document.body.removeChild(notification), 300);
          }, 4000);
        }
      };
    });
  };

  const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
  const pastEvents = events.filter(event => new Date(event.date) <= new Date());

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-blue-700">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Clean Header */}
      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border-b border-blue-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Campus Events</h1>
            <p className="text-lg text-gray-700">Discover and join exciting campus activities</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border border-blue-300 p-6 text-center shadow-sm">
            <Calendar className="h-8 w-8 text-blue-700 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-blue-800 uppercase tracking-wide">Total Events</h3>
            <p className="text-2xl font-bold text-blue-900">{events.length}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg border border-emerald-300 p-6 text-center shadow-sm">
            <Users className="h-8 w-8 text-emerald-700 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-emerald-800 uppercase tracking-wide">Your Registrations</h3>
            <p className="text-2xl font-bold text-emerald-900">{registeredEvents.size}</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg border border-amber-300 p-6 text-center shadow-sm">
            <Star className="h-8 w-8 text-amber-700 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-amber-800 uppercase tracking-wide">Upcoming</h3>
            <p className="text-2xl font-bold text-amber-900">{upcomingEvents.length}</p>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Upcoming Events</h2>
              <p className="text-gray-600">Events you can register for</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => {
                const EventIcon = getEventIcon(event.title, event.description);
                return (
                  <Card key={event.id} className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 hover:shadow-lg transition-all duration-200 hover:scale-105">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-blue-100">
                            <EventIcon className="h-5 w-5 text-blue-700" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-gray-800 leading-tight">
                            {event.title}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="text-emerald-700 border-emerald-300 bg-emerald-50">
                          Open
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        {event.description || 'Join us for this exciting event!'}
                      </p>
                      
                        <div className="space-y-2 mb-6">
                        <div className="flex items-center text-sm text-gray-700 bg-blue-50 p-2 rounded-lg">
                          <Calendar className="h-4 w-4 mr-3 text-blue-600" />
                          <span>
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700 bg-blue-50 p-2 rounded-lg">
                          <Clock className="h-4 w-4 mr-3 text-blue-600" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700 bg-blue-50 p-2 rounded-lg">
                          <MapPin className="h-4 w-4 mr-3 text-blue-600" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700 bg-blue-50 p-2 rounded-lg">
                          <Users className="h-4 w-4 mr-3 text-blue-600" />
                          <span>Max {event.max_participants} participants</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {registeredEvents.has(event.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUnregister(event.id)}
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Registered • Click to unregister
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleRegister(event.id)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                            size="sm"
                          >
                            Register Now
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Past Events</h2>
              <p className="text-gray-600">Events that have already taken place</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => {
                const EventIcon = getEventIcon(event.title, event.description);
                return (
                  <Card key={event.id} className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 opacity-80 hover:opacity-100 transition-all duration-200">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-slate-100">
                            <EventIcon className="h-5 w-5 text-slate-600" />
                          </div>
                          <CardTitle className="text-lg font-semibold text-slate-700 leading-tight">
                            {event.title}
                          </CardTitle>
                        </div>
                        <Badge variant="outline" className="text-slate-600 border-slate-300 bg-slate-100">
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                        {event.description || 'This event has been completed.'}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <Calendar className="h-4 w-4 mr-3 text-slate-500" />
                          <span>
                            {new Date(event.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <Clock className="h-4 w-4 mr-3 text-slate-500" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <MapPin className="h-4 w-4 mr-3 text-slate-500" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      {/* Simple Empty State */}
      {events.length === 0 && (
        <div className="text-center py-16">
          <Card className="max-w-md mx-auto bg-gradient-to-br from-white to-blue-50 border border-blue-200 shadow-lg">
            <CardContent className="p-12">
              <div className="mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No Events Yet</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Events are being planned. Check back soon for exciting opportunities to connect, learn, and participate!
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Star className="h-4 w-4 mr-2" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
};

export default Events;
