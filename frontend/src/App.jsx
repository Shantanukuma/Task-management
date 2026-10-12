import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

function App() {
  const [mode, setMode] = useState("login");
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
  });

  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  const handleAuthChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleTaskChange = (e) => {
    setTaskForm({
      ...taskForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");

    const endpoint =
      mode === "login"
        ? "/api/auth/login"
        : "/api/auth/register";

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      if (mode === "register") {
        setMessage("Registration successful. You can now login.");
        setMode("login");

        setAuthForm({
          name: "",
          email: authForm.email,
          password: "",
        });

        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setMessage("");

      setAuthForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to backend");
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setTasks(data.tasks);
    } catch (error) {
      console.error(error);
      setMessage("Unable to load tasks");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();

    if (!taskForm.title.trim()) {
      setMessage("Task title is required");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskForm),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setTasks([data.task, ...tasks]);

      setTaskForm({
        title: "",
        description: "",
      });

      setMessage("Task created successfully");
    } catch (error) {
      console.error(error);
      setMessage("Unable to create task");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setTasks(tasks.filter((task) => task.id !== taskId));
      setMessage("Task deleted");
    } catch (error) {
      console.error(error);
      setMessage("Unable to delete task");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTasks([]);
  };

  if (!token) {
    return (
      <div className="page">
        <div className="auth-card">
          <div className="logo">✓</div>

          <h1> Task Manager</h1>

          <p className="subtitle">
            Manage your tasks. Learn by building it.
          </p>

          <div className="tabs">
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              Login
            </button>

            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setMessage("");
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth}>
            {mode === "register" && (
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={authForm.name}
                onChange={handleAuthChange}
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={authForm.email}
              onChange={handleAuthChange}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={authForm.password}
              onChange={handleAuthChange}
            />

            <button className="primary-btn" type="submit">
              {mode === "login" ? "Login" : "Create Account"}
            </button>
          </form>

          {message && <div className="message">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header>
        <div>
          <h1> Task Manager</h1>
          <p>Build. Deploy. Monitor. Learn.</p>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      <main>
        <section className="task-form-card">
          <h2>Create a Task</h2>

          <form onSubmit={createTask}>
            <input
              type="text"
              name="title"
              placeholder="What do you need to do?"
              value={taskForm.title}
              onChange={handleTaskChange}
            />

            <textarea
              name="description"
              placeholder="Add a description..."
              value={taskForm.description}
              onChange={handleTaskChange}
              rows="4"
            />

            <button className="primary-btn" type="submit">
              + Add Task
            </button>
          </form>
        </section>

        <section className="tasks-section">
          <div className="section-heading">
            <h2>Your Tasks</h2>
            <span>{tasks.length} tasks</span>
          </div>

          {tasks.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <h3>No tasks yet</h3>
              <p>Create your first task above.</p>
            </div>
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <div className="task-card" key={task.id}>
                  <div>
                    <h3>{task.title}</h3>
                    <p>
                      {task.description || "No description"}
                    </p>
                  </div>

                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {message && <div className="message">{message}</div>}
      </main>
    </div>
  );
}

export default App;