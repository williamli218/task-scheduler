const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function apiFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Something went wrong" }));
        throw new Error(error.error || "Request failed");
    }

    return res.json();
}