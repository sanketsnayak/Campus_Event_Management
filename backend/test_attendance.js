const db = require('./database/db');

console.log('Testing attendance API query...');

// Test the exact query from getEventAttendance
const eventId = 1; // Test with event ID 1 which has registrations

const query = `
  SELECT 
    r.student_id,
    s.name,
    s.email,
    s.department,
    s.year,
    r.registered_at,
    COALESCE(a.status, 'not_marked') as attendance_status,
    a.marked_at
  FROM registrations r
  JOIN students s ON r.student_id = s.student_id
  LEFT JOIN attendance a ON r.student_id = a.student_id AND r.event_id = a.event_id
  WHERE r.event_id = ?
  ORDER BY s.name
`;

db.all(query, [eventId], (err, rows) => {
  if (err) {
    console.error('Query error:', err);
  } else {
    console.log(`Results for event ID ${eventId}:`, rows);
    
    // Calculate statistics
    const totalRegistered = rows.length;
    const presentCount = rows.filter(row => row.attendance_status === 'present').length;
    const absentCount = rows.filter(row => row.attendance_status === 'absent').length;
    const notMarkedCount = rows.filter(row => row.attendance_status === 'not_marked').length;

    console.log('Statistics:', {
      total_registered: totalRegistered,
      present: presentCount,
      absent: absentCount,
      not_marked: notMarkedCount,
      attendance_percentage: totalRegistered > 0 ? Math.round((presentCount / totalRegistered) * 100) : 0
    });
  }
  process.exit(0);
});
