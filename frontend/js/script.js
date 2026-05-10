const BASE_URL = "https://task-manager-production-00e5.up.railway.app";

/* ---------------------------
   PROTECT DASHBOARD PAGE
----------------------------*/
if (window.location.pathname.includes("dashboard.html")) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
  }
}

/* ---------------------------
   REGISTER USER
----------------------------*/
async function register() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert(data.message || "Registered successfully");
    window.location.href = "index.html";

  } catch (error) {
    alert("Server error. Please try again.");
  }
}

/* ---------------------------
   LOGIN USER
----------------------------*/
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log("Sending email:", email);
  console.log("Sending password:", password);

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  console.log("LOGIN RESPONSE:", data);

  if (res.ok && data.token) {
    localStorage.setItem("token", data.token);
    alert("Login successful!");
    
    // 👇 ADD THIS LINE
    window.location.href = "dashboard.html";

  } else {
    alert(data.message);
  }
}
/* ---------------------------
   LOGOUT
----------------------------*/
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

/* ---------------------------
   CREATE TASK
----------------------------*/
async function createTask() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const due_date = document.getElementById("due_date").value;

  const token = localStorage.getItem("token");

  try {
    await fetch(`${BASE_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ title, description, due_date })
    });

    loadTasks();

  } catch (error) {
    alert("Failed to create task");
  }
}

/* ---------------------------
   LOAD TASKS
----------------------------*/
async function loadTasks() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      headers: { 
        "Authorization": `Bearer ${token}`   // ✅ FIXED
      }
    });

    if (!res.ok) {
      alert("Invalid credentials. Please login again.");
      window.location.href = "login.html";
      return;
    }

    const tasks = await res.json();

    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
      taskList.innerHTML += `
        <div class="col-md-4">
          <div class="card p-3 shadow mb-3">
            <h5>${task.title}</h5>
            <p>${task.description}</p>

            <select onchange="updateStatus(${task.id}, this.value)" class="form-select mb-2">
              <option ${task.status === "Pending" ? "selected" : ""}>Pending</option>
              <option ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
              <option ${task.status === "Completed" ? "selected" : ""}>Completed</option>
            </select>

            <p>Due: ${task.due_date ? task.due_date.split("T")[0] : ""}</p>

            <button onclick="editTask(${task.id}, '${task.title}', '${task.description}', '${task.due_date ? task.due_date.split("T")[0] : ""}')"
              class="btn btn-warning btn-sm mb-1">Edit</button>

            <button onclick="deleteTask(${task.id})"
              class="btn btn-danger btn-sm">Delete</button>
          </div>
        </div>
      `;
    });

  } catch (error) {
    alert("Failed to load tasks");
  }
}

/* ---------------------------
   DELETE TASK
----------------------------*/
async function deleteTask(id) {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: "DELETE",
      headers: { "Authorization": token }
    });

    loadTasks();

  } catch (error) {
    alert("Failed to delete task");
  }
}

/* ---------------------------
   UPDATE STATUS
----------------------------*/
async function updateStatus(id, status) {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        status: status
      })
    });

    loadTasks();

  } catch (error) {
    alert("Failed to update status");
  }
}

/* ---------------------------
   EDIT TASK
----------------------------*/
async function editTask(id, oldTitle, oldDescription, oldDueDate) {
  const title = prompt("Edit Title:", oldTitle);
  const description = prompt("Edit Description:", oldDescription);
  const due_date = prompt("Edit Due Date (YYYY-MM-DD):", oldDueDate);

  if (!title || !description || !due_date) return;

  const token = localStorage.getItem("token");

  try {
    await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({
        title,
        description,
        status: "Pending",
        due_date
      })
    });

    loadTasks();

  } catch (error) {
    alert("Failed to edit task");
  }
}

/* ---------------------------
   AUTO LOAD TASKS
----------------------------*/
if (window.location.pathname.includes("dashboard.html")) {
  loadTasks();
}

function checkAuth() {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "index.html"; // or login.html if separate
  }
}