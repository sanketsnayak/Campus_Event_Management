import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { api } from '../lib/api.js';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalStudents: 0,
    upcomingEvents: 0,
    todayRegistrations: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch events
      const eventsResponse = await api.get('/events');
      const events = eventsResponse.data;
      
      // Fetch students
      const studentsResponse = await api.get('/students');
      const students = studentsResponse.data;
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const upcomingEvents = events.filter(event => 
        new Date(event.date) >= new Date(today)
      ).length;
      
      // Get recent 5 events
      const sortedEvents = events
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      setStats({
        totalEvents: events.length,
        totalStudents: students.length,
        upcomingEvents,
        todayRegistrations: 0 // This would need registration data
      });
      
      setRecentEvents(sortedEvents);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'text-blue-700 bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-emerald-700 bg-gradient-to-br from-emerald-100 to-emerald-200 border-emerald-300'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Clock,
      color: 'text-purple-700 bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300'
    },
    {
      title: 'Today Registrations',
      value: stats.todayRegistrations,
      icon: TrendingUp,
      color: 'text-orange-700 bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-indigo-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-lg border border-indigo-200">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800">Dashboard</h1>
        <p className="mt-2 text-gray-700">Overview of your campus event management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg border ${stat.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Events */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 shadow-lg">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-gray-800">Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length > 0 ? (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 hover:bg-blue-100 transition-colors">
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium text-gray-800">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.date}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-800">{event.location}</p>
                      <p className="text-xs text-gray-600">
                        Max: {event.max_participants}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-blue-600">No events found</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-white to-purple-50 border border-purple-200 shadow-lg">
          <CardHeader className="border-b border-purple-100">
            <CardTitle className="text-gray-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button 
                className="w-full rounded-lg border border-purple-200 bg-purple-50 p-3 text-left transition-colors hover:bg-purple-100"
                onClick={() => window.location.href = '/events'}
              >
                <div className="font-medium text-gray-800">Create New Event</div>
                <div className="text-sm text-gray-600">Add a new campus event</div>
              </button>
              
              <button 
                className="w-full rounded-lg border border-purple-200 bg-purple-50 p-3 text-left transition-colors hover:bg-purple-100"
                onClick={() => window.location.href = '/students'}
              >
                <div className="font-medium text-gray-800">Manage Students</div>
                <div className="text-sm text-gray-600">View and manage student records</div>
              </button>
              
              <button 
                className="w-full rounded-lg border border-purple-200 bg-purple-50 p-3 text-left transition-colors hover:bg-purple-100"
                onClick={() => window.location.href = '/reports'}
              >
                <div className="font-medium text-gray-800">View Reports</div>
                <div className="text-sm text-gray-600">Generate event and attendance reports</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
