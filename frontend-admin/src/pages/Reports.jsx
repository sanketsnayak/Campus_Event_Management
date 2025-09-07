import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Download, Calendar, Users, TrendingUp, BarChart3, FileText, PieChart } from 'lucide-react';
import { api } from '../lib/api.js';

const Reports = () => {
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data for reports
      const [eventsRes, studentsRes] = await Promise.all([
        api.get('/events'),
        api.get('/students')
      ]);
      
      setEvents(eventsRes.data || []);
      setStudents(studentsRes.data || []);
      
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setEvents([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const generateEventReport = async () => {
    try {
      const csvContent = generateEventsCSV();
      downloadCSV(csvContent, 'events_report.csv');
    } catch (error) {
      console.error('Failed to generate event report:', error);
      alert('Failed to generate event report');
    }
  };

  const generateStudentReport = async () => {
    try {
      const csvContent = generateStudentsCSV();
      downloadCSV(csvContent, 'students_report.csv');
    } catch (error) {
      console.error('Failed to generate student report:', error);
      alert('Failed to generate student report');
    }
  };

  const generateSummaryReport = async () => {
    try {
      const csvContent = generateSummaryCSV();
      downloadCSV(csvContent, 'summary_report.csv');
    } catch (error) {
      console.error('Failed to generate summary report:', error);
      alert('Failed to generate summary report');
    }
  };

  const generateEventsCSV = () => {
    const headers = ['ID', 'Title', 'Description', 'Date', 'Time', 'Location', 'Max Participants', 'Created At'];
    const rows = events.map(event => [
      event.id,
      event.title,
      event.description || '',
      event.date,
      event.time,
      event.location,
      event.max_participants,
      event.created_at
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const generateStudentsCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Student ID', 'Department', 'Year', 'Created At'];
    const rows = students.map(student => [
      student.id,
      student.name,
      student.email,
      student.student_id,
      student.department,
      student.year,
      student.created_at
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const generateSummaryCSV = () => {
    const stats = calculateStats();
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Events', stats.totalEvents],
      ['Total Students', stats.totalStudents],
      ['Total Registrations', stats.totalRegistrations],
      ['Average Attendance', `${stats.averageAttendance}%`]
    ];
    
    return [headers, ...rows].map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateStats = () => {
    return {
      totalEvents: events.length,
      totalStudents: students.length,
      totalRegistrations: Math.floor(students.length * 0.6), // Simulated data
      averageAttendance: 85.5 // Simulated data
    };
  };

  // Calculate additional metrics
  const eventsByMonth = events.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const departmentDistribution = students.reduce((acc, student) => {
    acc[student.department] = (acc[student.department] || 0) + 1;
    return acc;
  }, {});

  const recentEvents = events
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-violet-700">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-100 to-purple-100 p-6 rounded-lg border border-violet-200">
        <h1 className="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
        <p className="text-gray-700 mt-2">Generate comprehensive reports and view analytics for campus events</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-white to-blue-50 border border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalRegistrations}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Attendance</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageAttendance}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Generate Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Report Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={generateEventReport} className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Events Report
              </Button>
              <Button onClick={generateStudentReport} className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Students Report
              </Button>
              <Button onClick={generateSummaryReport} className="justify-start">
                <Download className="mr-2 h-4 w-4" />
                Summary Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Max Participants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell>{event.time}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>{event.max_participants}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-500 mt-2">No events found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Events by Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(eventsByMonth).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(eventsByMonth).map(([month, count]) => (
                  <div key={month} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{month}</span>
                    <span className="font-medium">{count} events</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No event data available</p>
            )}
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Students by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(departmentDistribution).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(departmentDistribution).map(([department, count]) => (
                  <div key={department} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{department}</span>
                    <span className="font-medium">{count} students</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No student data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
