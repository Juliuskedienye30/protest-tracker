const BASE_URL = "https://tracker-api-knvr.onrender.com";
const USERS_URL = `${BASE_URL}/users`;
const PROTESTS_URL = `${BASE_URL}/protests`;

const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const logoutBtn = document.getElementById("logout-btn");
const protestForm = document.getElementById("protest-form");
const filterStatus = document.getElementById("filter-status");
const searchInput = document.getElementById("search");

const authSection = document.getElementById("auth-section");
const mainApp = document.getElementById("main-app");
const protestsContainer = document.getElementById("protests-container");
const detailContainer = document.getElementById("detail-container");

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  loginForm.addEventListener("submit", loginUser);
  registerForm.addEventListener("submit", registerUser);
  logoutBtn.addEventListener("click", logout);
  protestForm.addEventListener("submit", addProtest);
  filterStatus.addEventListener("change", filterProtests);
  searchInput.addEventListener("input", searchProtests);
});

function checkAuth() {
  const user = localStorage.getItem("currentUser");
  if (user) {
    authSection.style.display = "none";
    mainApp.style.display = "block";
    loadProtests();
  }
}

function loginUser(e) {
  e.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  fetch(`${USERS_URL}?username=${username}&password=${password}`)
    .then(res => res.json())
    .then(users => {
      if (users.length > 0) {
        localStorage.setItem("currentUser", JSON.stringify(users[0]));
        checkAuth();
      } else {
        alert("Invalid credentials.");
      }
    });
}

function registerUser(e) {
  e.preventDefault();
  const username = document.getElementById("register-username").value;
  const password = document.getElementById("register-password").value;

  fetch(USERS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(user => {
      localStorage.setItem("currentUser", JSON.stringify(user));
      checkAuth();
    });
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

function loadProtests() {
  fetch(PROTESTS_URL)
    .then(res => res.json())
    .then(displayProtests);
}

function displayProtests(protests) {
  protestsContainer.innerHTML = "";
  protests.forEach(protest => {
    const div = document.createElement("div");
    div.className = "protest-item";
    div.textContent = `${protest.title} - ${protest.status}`;
    div.addEventListener("click", () => showDetails(protest));
    protestsContainer.appendChild(div);
  });
}

function showDetails(protest) {
  detailContainer.innerHTML = `
    <h3>${protest.title}</h3>
    <p><strong>Cause:</strong> ${protest.cause}</p>
    <p><strong>Date:</strong> ${protest.date}</p>
    <p><strong>Status:</strong> ${protest.status}</p>
    <p><strong>Location:</strong> ${protest.location}</p>
    ${protest.link ? `<img src="${protest.link}" alt="Protest Image" class="protest-image" />` : ""}
    <div class="button-group">
      <button id="edit-btn">Edit</button>
      <button id="delete-btn">Delete</button>
    </div>
  `;

  // Dynamically attach event listeners to new buttons
  document.getElementById("edit-btn").addEventListener("click", () => editProtest(protest.id));
  document.getElementById("delete-btn").addEventListener("click", () => deleteProtest(protest.id));
}

function addProtest(e) {
  e.preventDefault();
  const newProtest = {
    title: document.getElementById("title").value,
    cause: document.getElementById("cause").value,
    location: document.getElementById("location").value,
    date: document.getElementById("date").value,
    status: document.getElementById("status").value,
    link: document.getElementById("link").value
  };

  fetch(PROTESTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newProtest)
  })
    .then(res => res.json())
    .then(() => {
      protestForm.reset();
      loadProtests();
    });
}

function deleteProtest(id) {
  if (confirm("Are you sure you want to delete this protest?")) {
    fetch(`${PROTESTS_URL}/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        detailContainer.innerHTML = "Protest deleted.";
        loadProtests();
      });
  }
}

function editProtest(id) {
  fetch(`${PROTESTS_URL}/${id}`)
    .then(res => res.json())
    .then(protest => {
      document.getElementById("title").value = protest.title;
      document.getElementById("cause").value = protest.cause;
      document.getElementById("location").value = protest.location;
      document.getElementById("date").value = protest.date;
      document.getElementById("status").value = protest.status;
      document.getElementById("link").value = protest.link;

      // Override form submission for editing
      protestForm.onsubmit = function (e) {
        e.preventDefault();

        const updatedProtest = {
          title: document.getElementById("title").value,
          cause: document.getElementById("cause").value,
          location: document.getElementById("location").value,
          date: document.getElementById("date").value,
          status: document.getElementById("status").value,
          link: document.getElementById("link").value
        };

        fetch(`${PROTESTS_URL}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProtest)
        })
          .then(() => {
            protestForm.reset();
            protestForm.onsubmit = addProtest; // Restore default
            loadProtests();
            detailContainer.innerHTML = "Protest updated successfully.";
          });
      };
    });
}

function filterProtests() {
  const status = filterStatus.value;
  fetch(PROTESTS_URL)
    .then(res => res.json())
    .then(protests => {
      const filtered = status === "all" ? protests : protests.filter(p => p.status === status);
      displayProtests(filtered);
    });
}

function searchProtests() {
  const term = searchInput.value.toLowerCase();
  fetch(PROTESTS_URL)
    .then(res => res.json())
    .then(protests => {
      const filtered = protests.filter(p =>
        p.location.toLowerCase().includes(term) ||
        p.cause.toLowerCase().includes(term)
      );
      displayProtests(filtered);
    });
}

function toggleNav() {
  document.getElementById("nav-links").classList.toggle("active");
}
