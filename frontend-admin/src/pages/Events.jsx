import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Plus, Edit, Trash2, Eye, Users, MessageSquare, CheckSquare } from 'lucide-react';
import { api } from '../lib/api.js';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [eventFeedback, setEventFeedback] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    max_participants: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure max_participants is a number
      const eventData = {
        ...formData,
        max_participants: parseInt(formData.max_participants, 10)
      };

      // Validate required fields
      if (!eventData.title || !eventData.date || !eventData.time || !eventData.location || !eventData.max_participants) {
        alert('Please fill in all required fields');
        return;
      }

      if (editingEvent) {
        await api.put(`/events/${editingEvent.id}`, eventData);
      } else {
        await api.post('/events', eventData);
      }
      
      setShowForm(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        max_participants: ''
      });
      fetchEvents();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      max_participants: event.max_participants
    });
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        fetchEvents();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const handleViewRegistrations = async (event) => {
    try {
      setSelectedEvent(event);
      setLoadingRegistrations(true);
      setShowRegistrations(true);
      const response = await api.get(`/events/${event.id}/registrations`);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      setRegistrations([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleViewFeedback = async (event) => {
    try {
      setSelectedEvent(event);
      setLoadingFeedback(true);
      setShowFeedback(true);
      const response = await api.get(`/feedback/events/${event.id}/feedback`);
      setEventFeedback(response.data.feedback);
      setFeedbackSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      setEventFeedback([]);
      setFeedbackSummary(null);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleViewAttendance = async (event) => {
    try {
      setSelectedEvent(event);
      setLoadingAttendance(true);
      setShowAttendance(true);
      const response = await api.get(`/events/${event.id}/attendance`);
      setAttendanceData(response.data.students || []);
      setAttendanceStats(response.data.statistics);
      
      // Initialize attendance records state
      const initialRecords = {};
      response.data.students?.forEach(student => {
        initialRecords[student.student_id] = student.attendance_status;
      });
      setAttendanceRecords(initialRecords);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setAttendanceData([]);
      setAttendanceStats(null);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      // Convert attendance records to the format expected by the API
      const attendance_records = Object.entries(attendanceRecords).map(([student_id, status]) => ({
        student_id: parseInt(student_id),
        status
      })).filter(record => record.status !== 'not_marked');

      await api.post(`/events/${selectedEvent.id}/attendance`, { attendance_records });
      
      // Refresh attendance data
      handleViewAttendance(selectedEvent);
      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      alert('Failed to save attendance. Please try again.');
    }
  };

  const closeRegistrations = () => {
    setShowRegistrations(false);
    setSelectedEvent(null);
    setRegistrations([]);
  };

  const closeFeedbackModal = () => {
    setShowFeedback(false);
    setSelectedEvent(null);
    setEventFeedback([]);
    setFeedbackSummary(null);
  };

  const closeAttendanceModal = () => {
    setShowAttendance(false);
    setSelectedEvent(null);
    setAttendanceData([]);
    setAttendanceStats(null);
    setAttendanceRecords({});
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      max_participants: ''
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-teal-700">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-teal-100 to-cyan-100 p-6 rounded-lg border border-teal-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Events</h1>
          <p className="text-gray-700 mt-2">Manage campus events and activities</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Event Form */}
      {showForm && (
        <Card className="bg-gradient-to-br from-white to-teal-50 border border-teal-200 shadow-lg">
          <CardHeader className="border-b border-teal-100">
            <CardTitle className="text-gray-800">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <Input
                    type="number"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm} className="border-teal-300 text-teal-700 hover:bg-teal-50">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Events Table */}
      <Card className="bg-gradient-to-br from-white to-cyan-50 border border-cyan-200 shadow-lg">
        <CardHeader className="border-b border-cyan-100">
          <CardTitle className="text-gray-800">All Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Registered/Max</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{formatDate(event.date)}</TableCell>
                    <TableCell>{event.time}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        event.registered_count >= event.max_participants 
                          ? 'text-red-600' 
                          : event.registered_count >= event.max_participants * 0.8 
                            ? 'text-yellow-600' 
                            : 'text-green-600'
                      }`}>
                        {event.registered_count || 0}
                      </span>
                      <span className="text-gray-500">/{event.max_participants}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewRegistrations(event)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewFeedback(event)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewAttendance(event)}
                        >
                          <CheckSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No events found. Create your first event!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registrations Modal */}
      {showRegistrations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full m-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Registrations for "{selectedEvent?.title}"
              </h2>
              <Button variant="outline" size="sm" onClick={closeRegistrations}>
                ✕
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingRegistrations ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading registrations...</div>
                </div>
              ) : (
                <div>
                  {registrations.length > 0 ? (
                    <div>
                      <div className="mb-4 text-sm text-gray-600">
                        Total Registrations: {registrations.length} / {selectedEvent?.max_participants}
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Registered At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations.map((registration) => (
                            <TableRow key={registration.registration_id}>
                              <TableCell className="font-medium">{registration.student_id}</TableCell>
                              <TableCell>{registration.name}</TableCell>
                              <TableCell>{registration.email}</TableCell>
                              <TableCell>{registration.department}</TableCell>
                              <TableCell>Year {registration.year}</TableCell>
                              <TableCell>{new Date(registration.registered_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No students have registered for this event yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full m-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Feedback for "{selectedEvent?.title}"
              </h2>
              <Button variant="outline" size="sm" onClick={closeFeedbackModal}>
                ✕
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingFeedback ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading feedback...</div>
                </div>
              ) : (
                <div>
                  {eventFeedback.length > 0 ? (
                    <div>
                      <div className="mb-4 text-sm text-gray-600">
                        Average Rating: 
                        <span className="font-semibold text-gray-800">
                          {' '}
                          {feedbackSummary?.average_rating ? renderStars(feedbackSummary.average_rating) : 'No ratings yet'}
                        </span>
                      </div>
                      
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead>Comment</TableHead>
                            <TableHead>Submitted At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {eventFeedback.map((feedback) => (
                            <TableRow key={feedback.id}>
                              <TableCell className="font-medium">{feedback.student_id}</TableCell>
                              <TableCell>{feedback.name}</TableCell>
                              <TableCell>{feedback.email}</TableCell>
                              <TableCell>{feedback.department}</TableCell>
                              <TableCell>Year {feedback.year}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <span className="text-yellow-500 mr-1">
                                    {renderStars(feedback.rating)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>{feedback.comment}</TableCell>
                              <TableCell>{new Date(feedback.submitted_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No feedback received for this event yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full m-4 max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Take Attendance for "{selectedEvent?.title}"
              </h2>
              <Button variant="outline" size="sm" onClick={closeAttendanceModal}>
                ✕
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingAttendance ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading registered students...</div>
                </div>
              ) : (
                <div>
                  {attendanceData.length > 0 ? (
                    <div>
                      {/* Attendance Statistics */}
                      {attendanceStats && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Summary</h3>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Total Registered:</span>
                              <span className="ml-2 font-semibold">{attendanceStats.total_registered}</span>
                            </div>
                            <div>
                              <span className="text-green-600">Present:</span>
                              <span className="ml-2 font-semibold text-green-600">{attendanceStats.present}</span>
                            </div>
                            <div>
                              <span className="text-red-600">Absent:</span>
                              <span className="ml-2 font-semibold text-red-600">{attendanceStats.absent}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Not Marked:</span>
                              <span className="ml-2 font-semibold text-gray-600">{attendanceStats.not_marked}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-gray-600">Attendance Rate:</span>
                            <span className="ml-2 font-semibold text-blue-600">{attendanceStats.attendance_percentage}%</span>
                          </div>
                        </div>
                      )}

                      {/* Save Button */}
                      <div className="mb-4 flex justify-end">
                        <Button onClick={handleSaveAttendance} className="bg-blue-600 hover:bg-blue-700">
                          Save Attendance
                        </Button>
                      </div>
                      
                      {/* Attendance Table */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Registered At</TableHead>
                            <TableHead>Attendance Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendanceData.map((student) => (
                            <TableRow key={student.student_id}>
                              <TableCell className="font-medium">{student.student_id_string}</TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>{student.department}</TableCell>
                              <TableCell>Year {student.year}</TableCell>
                              <TableCell>{new Date(student.registered_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={attendanceRecords[student.student_id] === 'present' ? 'default' : 'outline'}
                                    className={attendanceRecords[student.student_id] === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                                    onClick={() => handleAttendanceChange(student.student_id, 'present')}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={attendanceRecords[student.student_id] === 'absent' ? 'default' : 'outline'}
                                    className={attendanceRecords[student.student_id] === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                                    onClick={() => handleAttendanceChange(student.student_id, 'absent')}
                                  >
                                    Absent
                                  </Button>
                                  {attendanceRecords[student.student_id] !== 'not_marked' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleAttendanceChange(student.student_id, 'not_marked')}
                                    >
                                      Clear
                                    </Button>
                                  )}
                                </div>
                                {student.marked_at && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Last marked: {new Date(student.marked_at).toLocaleString()}
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No students have registered for this event yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
