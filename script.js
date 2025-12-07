// -------------------- Initialize Users --------------------
let users = JSON.parse(localStorage.getItem("users") || '[]');

// Ensure admin exists
if (!users.find(u => u.username === "admin")) {
    users.push({
        username: "admin",
        password: "admin123",
        isAdmin: true,
        blocked: false,
        messages: [],
        registered: new Date().toLocaleString()
    });
    localStorage.setItem("users", JSON.stringify(users));
}

let currentUser = localStorage.getItem("currentUser");

// -------------------- Popup --------------------
function showPopup(msg, color = "red") {
    let popup = document.getElementById("popup");
    if (!popup) return;
    popup.style.background = color;
    popup.innerText = msg;
    popup.style.display = "block";
    setTimeout(() => { popup.style.display = "none"; }, 2500);
}

// -------------------- Auth --------------------
function register() {
    let username = document.getElementById("reg-username").value.trim();
    let password = document.getElementById("reg-password").value.trim();
    
    if (!username || !password) {
        showPopup("Fill all fields!");
        return;
    }
    
    let users = JSON.parse(localStorage.getItem("users") || '[]');
    if (users.find(u => u.username === username)) {
        showPopup("Username already exists!");
        return;
    }
    
    users.push({
        username,
        password,
        isAdmin: false,
        blocked: false,
        messages: [],
        registered: new Date().toLocaleString()
    });
    
    localStorage.setItem("users", JSON.stringify(users));
    showPopup("Registered successfully!", "green");
    setTimeout(() => { window.location = "login.html"; }, 1000);
}

function login() {
    let username = document.getElementById("login-username").value.trim();
    let password = document.getElementById("login-password").value.trim();
    
    let users = JSON.parse(localStorage.getItem("users") || '[]');
    let user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        if (user.blocked) {
            showPopup("You are blocked!");
            return;
        }
        
        localStorage.setItem("currentUser", username);
        localStorage.setItem("isAdmin", user.isAdmin ? "true" : "false");
        
        showPopup("Login successful!", "green");
        
        setTimeout(() => {
            if (user.isAdmin) window.location = "admin.html";
            else window.location = "index.html";
        }, 800);
    } else {
        showPopup("Incorrect username or password!");
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAdmin");
    window.location = "login.html";
}

// -------------------- Enforce Login --------------------
window.addEventListener("load", () => {
    let user = localStorage.getItem("currentUser");
    
    if (location.pathname.includes("index.html") || location.pathname.includes("admin.html")) {
        if (!user) {
            showPopup("Please login first!", "red");
            setTimeout(() => { window.location = "login.html"; }, 1000);
        } else {
            if (location.pathname.includes("index.html")) {
                let displayName = document.getElementById("username-display");
                if (displayName) displayName.innerText = "Welcome, " + user;
                let adminBtn = document.getElementById("admin-btn");
                if (adminBtn && localStorage.getItem("isAdmin") === "true") adminBtn.style.display = "block";
                displayUserMessages();
            }
            
            if (location.pathname.includes("admin.html")) {
                displayAdmin();
            }
        }
    }
});

// -------------------- User Portfolio --------------------
function showContact() {
    let form = document.getElementById("contact-form");
    if (localStorage.getItem("currentUser") && form) form.style.display = "block";
    else showPopup("Please login first!", "red");
}

function closeForm(id) {
    let form = document.getElementById(id);
    if (form) form.style.display = "none";
}

function sendMessage() {
    let subject = document.getElementById("contact-subject").value.trim();
    let message = document.getElementById("contact-message").value.trim();
    
    if (subject && message) {
        let users = JSON.parse(localStorage.getItem("users") || '[]');
        let currentUserName = localStorage.getItem("currentUser");
        let userObj = users.find(u => u.username === currentUserName);
        
        if (!userObj.messages) userObj.messages = [];
        userObj.messages.push({
            from: currentUserName,
            subject,
            message,
            time: new Date().toLocaleString()
        });
        
        localStorage.setItem("users", JSON.stringify(users));
        showPopup("Message sent!", "green");
        closeForm('contact-form');
        displayUserMessages();
    } else {
        showPopup("Fill all fields!");
    }
}

function displayUserMessages() {
    let container = document.getElementById("user-messages");
    if (!container) return;
    container.innerHTML = "<h3>Messages</h3>";
    
    let users = JSON.parse(localStorage.getItem("users") || '[]');
    let user = users.find(u => u.username === localStorage.getItem("currentUser"));
    
    if (user.messages) {
        user.messages.forEach(m => {
            let card = document.createElement("div");
            card.className = "message-card";
            card.innerHTML = `<strong>${m.from}</strong> [${m.time}]: ${m.subject} - ${m.message}`;
            container.appendChild(card);
        });
    }
}

// -------------------- Admin --------------------
function goToAdmin() {
    if (localStorage.getItem("isAdmin") === "true") window.location = "admin.html";
    else showPopup("Only admin can access!", "red");
}

function goToPortfolio() {
    window.location = "index.html";
}

function displayAdmin() {
    let usersTable = document.getElementById("admin-users-table");
    let messagesTable = document.getElementById("admin-messages-table");
    let users = JSON.parse(localStorage.getItem("users") || '[]');
    
    // Users Table
    if (usersTable) {
        usersTable.innerHTML = `<tr><th>Username</th><th>Registered At</th><th>Status</th><th>Actions</th></tr>`;
        users.forEach(u => {
            if (u.username === "admin") return;
            let tr = document.createElement("tr");
            tr.innerHTML = `<td>${u.username}</td>
                            <td>${u.registered}</td>
                            <td>${u.blocked ? "Blocked":"Active"}</td>
                            <td>
                                <button onclick="blockUser('${u.username}')">Block/Unblock</button>
                                <button onclick="removeUser('${u.username}')">Remove</button>
                            </td>`;
            usersTable.appendChild(tr);
        });
    }
    
    // Messages Table
    if (messagesTable) {
        messagesTable.innerHTML = `<tr><th>From</th><th>Time</th><th>Subject</th><th>Message</th><th>Action</th></tr>`;
        users.forEach(u => {
            if (!u.messages) return;
            u.messages.forEach(m => {
                if (m.from !== "Admin") {
                    let tr = document.createElement("tr");
                    tr.innerHTML = `<td>${u.username}</td><td>${m.time}</td><td>${m.subject}</td><td>${m.message}</td>
                                    <td><button onclick="adminReply('${u.username}','${m.subject}')">Reply</button></td>`;
                    messagesTable.appendChild(tr);
                }
            });
        });
    }
}

// -------------------- Admin Actions --------------------
function blockUser(username) {
    let users = JSON.parse(localStorage.getItem("users") || '[]');
    let user = users.find(u => u.username === username);
    if (user) {
        user.blocked = !user.blocked;
        localStorage.setItem("users", JSON.stringify(users));
        displayAdmin();
        showPopup(user.blocked ? "User blocked" : "User unblocked", "green");
    }
}

function removeUser(username) {
    let users = JSON.parse(localStorage.getItem("users") || '[]');
    users = users.filter(u => u.username !== username);
    localStorage.setItem("users", JSON.stringify(users));
    displayAdmin();
    showPopup("User removed", "green");
}

function adminReply(username, subject) {
    let reply = prompt(`Reply to ${username} (${subject}):`);
    if (reply) {
        let users = JSON.parse(localStorage.getItem("users") || '[]');
        let user = users.find(u => u.username === username);
        if (!user.messages) user.messages = [];
        user.messages.push({
            from: "Admin",
            subject,
            message: reply,
            time: new Date().toLocaleString()
        });
        localStorage.setItem("users", JSON.stringify(users));
        displayAdmin();
        showPopup("Reply sent", "green");
    }
}