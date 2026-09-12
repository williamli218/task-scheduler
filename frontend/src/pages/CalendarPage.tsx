import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { apiFetch } from "../api/client";
import CreateItemModal from "../components/CreateItemModal";
import EditItemModal from "../components/EditItemModal";

interface Task {
  id: number;
  title: string;
  due_date: string | null;
  completed: boolean;
  category_id: number | null;
}

interface EventItem {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  category_id: number | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
}

interface Category {
  id: number;
  name: string;
  color: string | null;
}

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: "task" | "event"; item: any } | null>(null);


  async function loadData() {
    try {
      const [tasksData, eventsData, categoriesData] = await Promise.all([
        apiFetch("/tasks"),
        apiFetch("/events"),
        apiFetch("/categories"),
      ]);
      setTasks(tasksData);
      setEvents(eventsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  function handleEventClick(clickInfo: any) {
    const [type, idStr] = clickInfo.event.id.split("-");
    const id = Number(idStr);

    if (type === "task") {
      const task = tasks.find((t) => t.id === id);
      if (task) setEditingItem({ type: "task", item: task });
    } else {
      const event = events.find((e) => e.id === id);
      if (event) setEditingItem({ type: "event", item: event });
    }
  }

  // Map tasks and events into FullCalendar's expected format
  const calendarEvents: CalendarEvent[] = [
    ...tasks
      .filter((t) => t.due_date)
      .map((t) => {
        const category = categories.find((c) => c.id === t.category_id);
        return {
          id: `task-${t.id}`,
          title: `📝 ${t.title}`,
          start: t.due_date as string,
          color: t.completed
            ? "#9ca3af"
            : category?.color || "#3b82f6",
        };
      }),
    ...events.map((e) => {
      const category = categories.find((c) => c.id === e.category_id);
      return {
        id: `event-${e.id}`,
        title: e.title,
        start: e.start_time,
        end: e.end_time,
        color: category?.color || "#10b981",
      };
    }),
  ];

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">My Calendar</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              + New
            </button>
            <button
              onClick={handleLogout}
              className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
            >
              Log Out
            </button>
          </div>
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
            eventClick={handleEventClick}
            height="auto"
          />
        </div>
      </div>
      {showModal && (
        <CreateItemModal
          onClose={() => setShowModal(false)}
          onCreated={loadData}
          categories={categories}
        />
      )}
      {editingItem && (
        <EditItemModal
          itemType={editingItem.type}
          item={editingItem.item}
          onClose={() => setEditingItem(null)}
          onSaved={loadData}
          categories={categories}
        />
      )}
    </div>
  );
}