import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventContentArg } from '@fullcalendar/core';
import { EventClickArg } from '@fullcalendar/common';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

interface StudyEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  subject?: string;
  color?: string;
  notes?: string;
}

const SUBJECT_COLORS = {
  math: '#4F46E5',
  science: '#10B981',
  history: '#F59E0B',
  language: '#EC4899',
  computer: '#3B82F6',
  other: '#6B7280',
};

const StudyPlan: React.FC = () => {
  const [events, setEvents] = useState<StudyEvent[]>([
    {
      id: '1',
      title: 'Math Study Session',
      start: new Date(),
      end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      subject: 'math',
      notes: 'Focus on algebra equations',
      color: SUBJECT_COLORS.math,
    },
  ]);
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<StudyEvent> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const calendarRef = useRef<typeof FullCalendar>(null);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const newEvent = {
      id: String(new Date().getTime()),
      start: selectInfo.start,
      end: selectInfo.end,
      subject: 'other',
    };
    
    setCurrentEvent(newEvent);
    setIsEditing(false);
    setShowEventModal(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setCurrentEvent(event);
      setIsEditing(true);
      setShowEventModal(true);
    }
  };

  const saveEvent = () => {
    if (!currentEvent || !currentEvent.title || !currentEvent.start || !currentEvent.end) {
      return;
    }

    const newEvent: StudyEvent = {
      id: currentEvent.id || String(new Date().getTime()),
      title: currentEvent.title,
      start: currentEvent.start,
      end: currentEvent.end,
      subject: currentEvent.subject || 'other',
      notes: currentEvent.notes,
      color: SUBJECT_COLORS[currentEvent.subject as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.other,
    };

    if (isEditing) {
      setEvents(events.map(event => (event.id === newEvent.id ? newEvent : event)));
    } else {
      setEvents([...events, newEvent]);
    }

    setShowEventModal(false);
    setCurrentEvent(null);
  };

  const deleteEvent = () => {
    if (currentEvent && currentEvent.id) {
      setEvents(events.filter(event => event.id !== currentEvent.id));
      setShowEventModal(false);
      setCurrentEvent(null);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Study Plan Calendar</h1>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-150 flex items-center"
              onClick={() => {
                setCurrentEvent({
                  id: String(new Date().getTime()),
                  start: new Date(),
                  end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
                  subject: 'other',
                });
                setIsEditing(false);
                setShowEventModal(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Study Session
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  initialView="dayGridMonth"
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={events}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventContent={(eventInfo: EventContentArg) => (
                    <div className="p-1 overflow-hidden">
                      <div className="text-xs font-bold">{eventInfo.timeText}</div>
                      <div className="text-sm font-medium truncate">{eventInfo.event.title}</div>
                      {eventInfo.view.type !== 'dayGridMonth' && eventInfo.event.extendedProps.notes && (
                        <div className="text-xs italic mt-1 truncate">{eventInfo.event.extendedProps.notes}</div>
                      )}
                    </div>
                  )}
                  eventClassNames={(arg: { event: { backgroundColor: string } }) => {
                    return [`bg-${arg.event.backgroundColor}`];
                  }}
                  height="auto"
                />
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Legend</h2>
                <div className="space-y-2">
                  {Object.entries(SUBJECT_COLORS).map(([subject, color]) => (
                    <div key={subject} className="flex items-center">
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
                      <span className="capitalize">{subject}</span>
                    </div>
                  ))}
                </div>
                
                <h2 className="text-xl font-semibold mt-8 mb-4">Upcoming Sessions</h2>
                <div className="space-y-3">
                  {events
                    .filter(event => new Date(event.start) >= new Date())
                    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
                    .slice(0, 3)
                    .map(event => (
                      <div key={event.id} className="p-3 rounded-md" style={{ backgroundColor: `${event.color}20` }}>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(event.start).toLocaleDateString()} at {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  {events.filter(event => new Date(event.start) >= new Date()).length === 0 && (
                    <p className="text-gray-500 italic">No upcoming sessions</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-medium">{isEditing ? 'Edit Study Session' : 'Add Study Session'}</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowEventModal(false)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Title
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="title"
                  type="text"
                  placeholder="Study Session Title"
                  value={currentEvent?.title || ''}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
                  Subject
                </label>
                <select
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="subject"
                  value={currentEvent?.subject || 'other'}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, subject: e.target.value })}
                >
                  {Object.keys(SUBJECT_COLORS).map(subject => (
                    <option key={subject} value={subject} className="capitalize">{subject}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start-date">
                    Start Date
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="start-date"
                    type="datetime-local"
                    value={currentEvent?.start ? new Date(currentEvent.start).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, start: new Date(e.target.value) })}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end-date">
                    End Date
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="end-date"
                    type="datetime-local"
                    value={currentEvent?.end ? new Date(currentEvent.end).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, end: new Date(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="notes"
                  placeholder="Study notes, topics to cover, etc."
                  rows={3}
                  value={currentEvent?.notes || ''}
                  onChange={(e) => setCurrentEvent({ ...currentEvent, notes: e.target.value })}
                ></textarea>
              </div>
            </div>
            
            <div className="px-5 py-4 border-t flex justify-between">
              {isEditing && (
                <button
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={deleteEvent}
                >
                  Delete
                </button>
              )}
              <div className="ml-auto">
                <button
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                  type="button"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={saveEvent}
                >
                  {isEditing ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
};

export default StudyPlan; 