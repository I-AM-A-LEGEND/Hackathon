import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventContentArg } from '@fullcalendar/core';

const StudyPlan: React.FC = () => {
  const [events, setEvents] = useState([
    {
      title: 'Math Study Session',
      start: new Date(),
      end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
    },
  ]);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const title = prompt('Please enter a title for your study session');
    if (title) {
      setEvents([
        ...events,
        {
          title,
          start: selectInfo.start,
          end: selectInfo.end,
        },
      ]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Study Plan</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <FullCalendar
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
          eventContent={(eventInfo: EventContentArg) => (
            <div className="p-1">
              <b>{eventInfo.timeText}</b>
              <i>{eventInfo.event.title}</i>
            </div>
          )}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Add Study Session</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => {
            const title = prompt('Enter session title:');
            if (title) {
              setEvents([
                ...events,
                {
                  title,
                  start: new Date(),
                  end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
                },
              ]);
            }
          }}
        >
          Add Session
        </button>
      </div>
    </div>
  );
};

export default StudyPlan; 