import { useState } from "react";
import { apiFetch } from "../api/client";

interface Category {
  id: number;
  name: string;
  color: string | null;
}

interface Props {
  onClose: () => void;
  onCreated: () => void;
  categories: Category[];
}

export default function CreateItemModal({ onClose, onCreated, categories }: Props) {
  const [type, setType] = useState<"task" | "event" | "category">("task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#3b82f6");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (type === "task") {
        await apiFetch("/tasks", {
          method: "POST",
          body: JSON.stringify({
            title,
            description: description || undefined,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
          }),
        });
      } else if (type === "event") {
        await apiFetch("/events", {
          method: "POST",
          body: JSON.stringify({
            title,
            description: description || undefined,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            location: location || undefined,
            categoryId: categoryId ? Number(categoryId) : undefined,
          }),
        });
      } else {
        await apiFetch("/categories", {
          method: "POST",
          body: JSON.stringify({
            name: categoryName,
            color: categoryColor,
          }),
        });
      }
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Create New</h2>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setType("task")}
            className={`flex-1 rounded py-2 ${type === "task" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            Task
          </button>
          <button
            onClick={() => setType("event")}
            className={`flex-1 rounded py-2 ${type === "event" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            Event
          </button>
          <button
            onClick={() => setType("category")}
            className={`flex-1 rounded py-2 ${type === "category" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            Category
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {type === "category" ? (
            <>
              <input
                type="text"
                placeholder="Category name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                className="rounded border border-gray-300 px-3 py-2"
              />
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600">Color</label>
                <input
                  type="color"
                  value={categoryColor}
                  onChange={(e) => setCategoryColor(e.target.value)}
                  className="h-10 w-16 rounded border border-gray-300"
                />
              </div>
            </>
          ) : (
            <>
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

              {type === "task" ? (
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="rounded border border-gray-300 px-3 py-2"
                />
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
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="mt-2 flex gap-2">
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