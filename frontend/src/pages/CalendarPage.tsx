import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { apiFetch } from "../api/client";

interface Task {
  id: number;
  title: string;
  due_date: string | null;
  completed: boolean;
}

interface EventItem {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [tasksData, eventsData] = await Promise.all([
          apiFetch("/tasks"),
          apiFetch("/events"),
        ]);
        setTasks(tasksData);
        setEvents(eventsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  // Map tasks and events into FullCalendar's expected format
  const calendarEvents: CalendarEvent[] = [
    ...tasks
      .filter((t) => t.due_date)
      .map((t) => ({
        id: `task-${t.id}`,
        title: `📝 ${t.title}`,
        start: t.due_date as string,
        color: t.completed ? "#9ca3af" : "#3b82f6",
      })),
    ...events.map((e) => ({
      id: `event-${e.id}`,
      title: e.title,
      start: e.start_time,
      end: e.end_time,
      color: "#10b981",
    })),
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">My Calendar</h1>
          <button
            onClick={handleLogout}
            className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
          >
            Log Out
          </button>
        </div>

        {error && <p className="mb-4 text-red-500">{error}</p>}

        <div className="rounded-lg bg-white p-4 shadow">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            height="auto"
          />
        </div>
      </div>
    </div>
  );
}