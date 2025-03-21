// ======= SIGNUP =========
const signupForm = document.getElementById('signup-form');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value.trim();
    const username = document.getElementById('signup-username').value.trim();
    const password = document.getElementById('signup-password').value;

    try {
      const res = await fetch('https://shubhendu-ghosh-whispra.hf.space/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Signup successful! Login now.');
        // Route to Flask's /login route instead of static login.html
        window.location.href = '/login';
      } else {
        alert(data.detail || 'Signup failed.');
      }
    } catch (err) {
      alert('Something went wrong.');
    }
  });
}

// ======= LOGIN =========
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch('https://shubhendu-ghosh-whispra.hf.space/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('loggedIn', true);
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);

        // Redirect to chat route handled by Flask
        window.location.href = '/chat';
      } else {
        alert(data.detail || 'Login failed.');
      }
    } catch (err) {
      alert('Login error.');
    }
  });
}

// ======= CHAT LOGIC =========
const messagesDiv = document.getElementById('messages');
const chatUsersList = document.getElementById('chat-users');
const messageInput = document.getElementById('message-input');
const currentChatHeading = document.getElementById('current-chat');
const newUserBtn = document.getElementById('new-user-btn');

let currentRecipient = null;
let chatHistory = {};
let messageIds = {};

if (messagesDiv && chatUsersList) {
  if (!localStorage.getItem('loggedIn')) {
    window.location.href = 'login.html';
  }

  // Start scanning messages every 5 seconds
  setInterval(scanMessages, 5000);
  scanMessages();
}

async function scanMessages() {
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');
  if (!username || !password) return;

  try {
    const res = await fetch('https://shubhendu-ghosh-whispra.hf.space/scan_messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    const messages = data.messages || [];
    let newMessageFound = false;

    messages.forEach(msg => {
      const fromUser = msg.from_username;
      const toUser = msg.to_username || username;

      const otherUser = (fromUser === username) ? toUser : fromUser;
      const messageId = `${fromUser}-${msg.message}-${msg.timestamp || Date.now()}`;

      if (!messageIds[messageId]) {
        messageIds[messageId] = true;

        if (!chatHistory[otherUser]) {
          chatHistory[otherUser] = [];
        }

        chatHistory[otherUser].push(msg);
        newMessageFound = true;
      }
    });

    if (newMessageFound) {
      updateUserList();
      if (!currentRecipient && Object.keys(chatHistory).length > 0) {
        currentRecipient = Object.keys(chatHistory)[0];
      }
      if (currentRecipient) {
        displayMessages(currentRecipient);
      }
    }
  } catch (err) {
    console.error('Scan failed.', err);
  }
}

function displayMessages(user) {
  if (!user) return;

  const username = localStorage.getItem('username');
  const messages = chatHistory[user] || [];

  currentChatHeading.textContent = `Chatting with ${user}`;
  messagesDiv.innerHTML = '';

  messages.forEach(msg => {
    const p = document.createElement('p');
    p.classList.add('chat-message');

    if (msg.from_username === username) {
      p.classList.add('sent');
      p.textContent = `${msg.message}`;
    } else {
      p.classList.add('received');
      p.textContent = `${msg.message}`;
    }

    messagesDiv.appendChild(p);
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateUserList() {
  chatUsersList.innerHTML = '';
  const users = Object.keys(chatHistory);

  if (users.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No chats yet';
    li.classList.add('empty-list');
    chatUsersList.appendChild(li);
    return;
  }

  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    li.classList.add('user-item');

    if (user === currentRecipient) {
      li.classList.add('active');
    }

    li.onclick = () => {
      currentRecipient = user;
      displayMessages(user);
      updateUserList();
    };

    chatUsersList.appendChild(li);
  });
}

async function sendMessage() {
  const fromUser = localStorage.getItem('username');
  const password = localStorage.getItem('password');

  let toUser = currentRecipient;
  if (!toUser) return alert('Choose or enter a username!');
  const message = messageInput.value.trim();
  if (!message) return alert('Message cannot be empty!');

  try {
    const res = await fetch('https://shubhendu-ghosh-whispra.hf.space/send_message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_username: fromUser,
        password,
        to_username: toUser,
        message
      })
    });

    const data = await res.json();

    if (res.ok) {
      const newMsg = {
        from_username: fromUser,
        to_username: toUser,
        message,
        timestamp: Date.now()
      };

      if (!chatHistory[toUser]) {
        chatHistory[toUser] = [];
      }

      chatHistory[toUser].push(newMsg);
      const messageId = `${fromUser}-${message}-${newMsg.timestamp}`;
      messageIds[messageId] = true;

      displayMessages(toUser);
      updateUserList();

      messageInput.value = '';
      scanMessages();
    } else {
      alert(data.message || 'Failed to send message.');
    }
  } catch (err) {
    alert('Message send error.');
  }
}

function logout() {
  localStorage.clear();
  window.location.href = '/';  // Go to signup page
}

if (newUserBtn) {
  newUserBtn.addEventListener('click', () => {
    const newUser = prompt('Enter new username to chat with:');
    if (newUser) {
      currentRecipient = newUser.trim();
      if (!currentRecipient) return;
      currentChatHeading.textContent = `Chatting with ${currentRecipient}`;
      displayMessages(currentRecipient);
      updateUserList();
    }
  });
}
