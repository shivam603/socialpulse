import React, { useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCalendarEventsByMonth } from '../store/selectors/postSelectors';
import {
  incrementCalendarMonth,
  setActiveView,
  showNotification,
  selectProfilerEnabled,
  recordComponentRender,
} from '../store/slices/uiSlice';
import { setEditingDraft } from '../store/slices/draftsSlice';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CalendarView = () => {
  const dispatch = useDispatch();
  const calendarData = useSelector(selectCalendarEventsByMonth);
  const profilerEnabled = useSelector(selectProfilerEnabled);

  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  useEffect(() => {
    dispatch(recordComponentRender('CalendarView'));
  });

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleEventClick = (post) => {
    dispatch(setEditingDraft(post));
    dispatch(setActiveView('composer'));
    dispatch(showNotification({ message: `Opened "${post.title}" for editing.`, type: 'info' }));
  };

  return (
    <div className="panel">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--line)',
          paddingBottom: 16,
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>EXP 1.2.2 DERIVED CALENDAR MATRIX</span>
            {profilerEnabled && (
              <span className="render-badge">
                renders: {renderCountRef.current}
              </span>
            )}
          </div>
          <h2>Publishing Calendar</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>
            Memoized date grouping derived via <code>selectCalendarEventsByMonth</code> selector.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => dispatch(incrementCalendarMonth(-1))}
            title="Previous Month"
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <span style={{ fontSize: 16, fontWeight: 700, minWidth: 150, textAlign: 'center', color: '#102c2a' }}>
            {calendarData.monthLabel}
          </span>

          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => dispatch(incrementCalendarMonth(1))}
            title="Next Month"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {weekdays.map((day) => (
          <div key={day} className="calendar-header-day">
            {day}
          </div>
        ))}

        {calendarData.days.map((dayObj, idx) => (
          <div
            key={idx}
            className={`calendar-cell ${!dayObj.inCurrentMonth ? 'muted' : ''} ${dayObj.isToday ? 'today' : ''}`}
          >
            <div className="cell-date-num" style={{ color: dayObj.isToday ? 'var(--coral)' : 'inherit' }}>
              {dayObj.dayNumber}
            </div>

            <div>
              {dayObj.events.map((ev) => (
                <div
                  key={ev._id || ev.id}
                  className="cell-event-pill"
                  onClick={() => handleEventClick(ev)}
                  title={`${ev.title} (${ev.platform}) - Click to edit`}
                >
                  <strong style={{ marginRight: 3 }}>[{ev.platform}]</strong>
                  {ev.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
