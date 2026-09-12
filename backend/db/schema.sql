CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE "Category" (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    user_id INTEGER NOT NULL REFERENCES "User"(id)
);

CREATE TABLE "Task" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id INTEGER NOT NULL REFERENCES "User"(id),
    category_id INTEGER REFERENCES "Category"(id)
);

CREATE TABLE "Event" (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    location TEXT,
    recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id INTEGER NOT NULL REFERENCES "User"(id),
    category_id INTEGER REFERENCES "Category"(id)
);