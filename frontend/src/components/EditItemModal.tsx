import { useState } from "react";
import { apiFetch } from "../api/client";

interface Category {
  id: number;
  name: string;
  color: string | null;
}

interface EditItemModalProps {
  itemType: "task" | "event";
  item: any;
  onClose: () => void;
  onSaved: () => void;
  categories: Category[];
}

export default function EditItemModal({ itemType, item, onClose, onSaved, categories }: EditItemModalProps) {
  const [title, setTitle] = useState(item.title || "");
  const [description, setDescription] = useState(item.description || "");
  const [dueDate, setDueDate] = useState(
    item.due_date ? toLocalInputValue(item.due_date) : ""
  );
  const [startTime, setStartTime] = useState(
    item.start_time ? toLocalInputValue(item.start_time) : ""
  );
  const [endTime, setEndTime] = useState(
    item.end_time ? toLocalInputValue(item.end_time) : ""
  );
  const [location, setLocation] = useState(item.location || "");
  const [completed, setCompleted] = useState(item.completed || false);
  const [categoryId, setCategoryId] = useState<string>(
    item.category_id ? String(item.category_id) : ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function toLocalInputValue(isoString: string) {
    const d = new Date(isoString);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (itemType === "task") {
        await apiFetch(`/tasks/${item.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title,
            description: description || undefined,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            completed,
            categoryId: categoryId ? Number(categoryId) : undefined,
          }),
        });
      } else {
        await apiFetch(`/events/${item.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title,
            description: description || undefined,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            location: location || undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
          }),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setError("");
    setDeleting(true);
    try {
      const path = itemType === "task" ? `/tasks/${item.id}` : `/events/${item.id}`;
      await apiFetch(path, { method: "DELETE" });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">
          Edit {itemType === "task" ? "Task" : "Event"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="rounded border border-gray-300 px-3 py-2"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          />

          {itemType === "task" ? (
            <>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
              />
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                />
                Completed
              </label>
            </>
          ) : (
            <>
              <label className="text-sm text-gray-600">Start</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="rounded border border-gray-300 px-3 py-2"
              />
              <label className="text-sm text-gray-600">End</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="rounded border border-gray-300 px-3 py-2"
              />
              <input
                type="text"
                placeholder="Location (optional)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded border border-gray-300 px-3 py-2"
              />
            </>
          )}

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded bg-red-100 px-4 py-2 text-red-700 hover:bg-red-200 disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded bg-gray-200 py-2 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}