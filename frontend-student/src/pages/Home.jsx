import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Users, Star, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';

const Home = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    myRegistrations: 0,
    upcomingEvents: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all events
      const eventsResponse = await api.get('/events');
      const allEvents = eventsResponse.data || [];
      
      // Fetch user registrations
      const registrationsResponse = await api.get('/events/my-registrations');
      const userRegistrations = registrationsResponse.data || [];
      
      // Calculate stats
      const upcoming = allEvents.filter(event => new Date(event.date) > new Date());
      
      setStats({
        totalEvents: allEvents.length,
        myRegistrations: userRegistrations.length,
        upcomingEvents: upcoming.length
      });
      
      // Set upcoming events (limit to 3)
      setUpcomingEvents(upcoming.slice(0, 3));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-emerald-700">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Clean Header */}
      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 border-b border-emerald-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to Campus Events</h1>
            <p className="text-xl text-gray-700">Discover and register for exciting campus events</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg border border-emerald-300 p-8 text-center shadow-sm">
            <Calendar className="h-12 w-12 text-emerald-700 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-emerald-800 uppercase tracking-wide mb-2">Total Events</h3>
            <p className="text-4xl font-bold text-emerald-900">{stats.totalEvents}</p>
          </div>

          <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg border border-teal-300 p-8 text-center shadow-sm">
            <Users className="h-12 w-12 text-teal-700 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-teal-800 uppercase tracking-wide mb-2">My Registrations</h3>
            <p className="text-4xl font-bold text-teal-900">{stats.myRegistrations}</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-lg border border-cyan-300 p-8 text-center shadow-sm">
            <Star className="h-12 w-12 text-cyan-700 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-cyan-800 uppercase tracking-wide mb-2">Upcoming Events</h3>
            <p className="text-4xl font-bold text-cyan-900">{stats.upcomingEvents}</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-200 shadow-sm">
            <CardHeader className="border-b border-emerald-100">
              <CardTitle className="text-xl font-semibold text-gray-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <Link to="/events">
                <Button className="w-full justify-between bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg py-6 shadow-lg">
                  Browse All Events
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/my-registrations">
                <Button variant="outline" className="w-full justify-between border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-lg py-6">
                  View My Registrations
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Events Preview */}
          <Card className="bg-gradient-to-br from-white to-teal-50 border border-teal-200 shadow-sm">
            <CardHeader className="border-b border-teal-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-800">Upcoming Events</CardTitle>
                <Link to="/events">
                  <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-800 hover:bg-teal-50">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {upcomingEvents.length > 0 ? (
                <div className="space-y-6">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-teal-400 pl-6 py-2 bg-teal-50 rounded-r-lg">
                      <h4 className="font-semibold text-gray-800 text-lg">{event.title}</h4>
                      <p className="text-gray-700 mt-1">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} at {event.time}
                      </p>
                      <p className="text-gray-600 text-sm mt-1">{event.location}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-teal-400 mx-auto mb-4" />
                  <p className="text-teal-600">No upcoming events found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
