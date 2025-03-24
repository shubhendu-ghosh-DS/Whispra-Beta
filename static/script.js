// ======= Toast Function =======
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    console.error('Toast container not found.');
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // Trigger the transition by adding .show (after it's in the DOM)
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);  // Delay helps ensure CSS transitions fire properly

  // Remove toast after 10 seconds (fade-out + removal)
  setTimeout(() => {
    toast.classList.remove('show');
    // Wait for fade-out to finish before removing the element (400ms = CSS transition)
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 6000);
}

// ========== SIGNUP ==========
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
        showToast(data.detail || 'Signup successful! Login now.', 'success');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        showToast(data.detail || 'Signup failed.', 'error');
      }
    } catch (err) {
      showToast('Something went wrong during signup.', 'error');
    }
  });
}

// ========== LOGIN ==========
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
        // Don't store passwords in localStorage! (Security issue)
        localStorage.setItem('password', password);
        showToast(data.detail || 'Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/chat';
        }, 1500);
      } else {
        showToast(data.detail || 'Login failed.', 'error');
      }
    } catch (err) {
      showToast('Something went wrong during login.', 'error');
    }
  });
}

const messagesDiv = document.getElementById('messages');
const chatUsersList = document.getElementById('chat-users');
const messageInput = document.getElementById('message-input');
const currentChatHeading = document.getElementById('current-chat');
const newUserBtn = document.getElementById('new-user-btn');
const searchFriendsInput = document.getElementById('search-friends-input');

let currentRecipient = null;
let chatHistory = {};
let messageIds = {};
let friendsList = [];

// ====================== INITIALIZATION ======================

if (messagesDiv && chatUsersList) {
  if (!localStorage.getItem('loggedIn')) {
    showToast('You must be logged in to access chat.', 'error');
    window.location.href = 'login.html';
  }

  fetchFriends();
  scanMessages();
  setInterval(scanMessages, 5000);
}

// ====================== SCAN MESSAGES ======================

async function scanMessages() {
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');

  if (!username || !password) {
    showToast('Authentication details missing.', 'error');
    return;
  }

  try {
    const res = await fetch('https://shubhendu-ghosh-whispra.hf.space/scan_messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.detail || 'Failed to scan messages.', 'error');
      console.error('Scan messages error:', data);
      return;
    }

    const messages = data.messages || [];
    let newMessageFound = false;

    messages.forEach(msg => {
      const fromUser = msg.from_username;
      const toUser = msg.to_username || username;
      const otherUser = (fromUser === username) ? toUser : fromUser;
      const decodedMsg = decodeMessage(msg.message);

      const messageId = `${msg.timestamp}-${fromUser}-${toUser}`;

      if (!messageIds[messageId]) {
        messageIds[messageId] = true;

        if (!chatHistory[otherUser]) {
          chatHistory[otherUser] = [];
          if (!friendsList.includes(otherUser)) {
            friendsList.push(otherUser);
            updateUserList();
            saveFriend(otherUser);
          }
        }

        chatHistory[otherUser].push({
          ...msg,
          message: decodedMsg
        });

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
    showToast('Error scanning messages.', 'error');
    console.error('Scan messages catch error:', err);
  }
}

// ====================== DISPLAY MESSAGES ======================

function displayMessages(user) {
  if (!user) {
    showToast('No user selected.', 'error');
    return;
  }

  const username = localStorage.getItem('username');
  const messages = chatHistory[user] || [];

  currentChatHeading.textContent = `Chatting with ${user}`;
  messagesDiv.innerHTML = '';

  messages.forEach(msg => {
    const p = document.createElement('p');
    p.classList.add('chat-message');

    if (msg.from_username === username) {
      p.classList.add('sent');
    } else {
      p.classList.add('received');
    }

    p.textContent = msg.message;
    messagesDiv.appendChild(p);
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ====================== UPDATE USER LIST ======================

function updateUserList(filter = '') {
  chatUsersList.innerHTML = '';

  const filteredFriends = friendsList.filter(friend =>
    friend.toLowerCase().includes(filter.toLowerCase())
  );

  if (filteredFriends.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No friends found';
    li.classList.add('empty-list');
    chatUsersList.appendChild(li);
    return;
  }

  filteredFriends.forEach(friend => {
    const li = document.createElement('li');
    li.textContent = friend;
    li.classList.add('user-item');

    if (friend === currentRecipient) {
      li.classList.add('active');
    }

    li.onclick = () => {
      currentRecipient = friend;
      displayMessages(friend);
      updateUserList();
    };

    chatUsersList.appendChild(li);
  });
}

// ====================== SEND MESSAGE ======================

async function sendMessage() {
  const fromUser = localStorage.getItem('username');
  const password = localStorage.getItem('password');

  if (!fromUser || !password) {
    showToast('Authentication error.', 'error');
    return;
  }

  const toUser = currentRecipient;
  if (!toUser) {
    showToast('Please select a recipient!', 'error');
    return;
  }

  const message = messageInput.value.trim();
  if (!message) {
    showToast('Message cannot be empty!', 'error');
    return;
  }

  const encodedMessage = encodeMessage(message);

  try {
    const res = await fetch('https://shubhendu-ghosh-whispra.hf.space/send_message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_username: fromUser,
        password,
        to_username: toUser,
        message: encodedMessage
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.detail || 'Failed to send message.', 'error');
      console.error('Send message error:', data);
      return;
    }

    const newMsg = {
      from_username: fromUser,
      to_username: toUser,
      message,
      timestamp: Date.now()
    };

    if (!chatHistory[toUser]) {
      chatHistory[toUser] = [];
      if (!friendsList.includes(toUser)) {
        friendsList.push(toUser);
        saveFriend(toUser);
      }
    }

    chatHistory[toUser].push(newMsg);

    const messageId = `${newMsg.timestamp}-${fromUser}-${toUser}`;
    messageIds[messageId] = true;

    displayMessages(toUser);
    updateUserList();

    messageInput.value = '';
    scanMessages();

    showToast('Message sent!', 'success');
  } catch (err) {
    showToast('Message send error.', 'error');
    console.error('Send message catch error:', err);
  }
}

// ====================== FETCH FRIENDS ======================

async function fetchFriends() {
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');

  if (!username || !password) {
    showToast('Authentication error fetching friends.', 'error');
    return;
  }

  try {
    const res = await fetch(`https://shubhendu-ghosh-whispra.hf.space/get_friends?username=${username}&password=${password}`);

    const data = await res.json();

    if (!res.ok) {
      showToast(data.detail || 'Failed to fetch friends.', 'error');
      console.error('Fetch friends error:', data);
      return;
    }

    friendsList = data || [];
    updateUserList();
  } catch (err) {
    showToast('Error fetching friends.', 'error');
    console.error('Fetch friends catch error:', err);
  }
}

// ====================== SAVE FRIEND ======================

async function saveFriend(friendUsername) {
  const username = localStorage.getItem('username');
  const password = localStorage.getItem('password');

  if (!username || !password) {
    showToast('Authentication error saving friend.', 'error');
    return;
  }

  try {
    const res = await fetch('https://shubhendu-ghosh-whispra.hf.space/save_friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        friend_username: friendUsername
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.detail || 'Failed to save friend.', 'error');
      console.error('Save friend error:', data);
      return;
    }

    showToast(`Friend "${friendUsername}" saved!`, 'success');
  } catch (err) {
    showToast('Error saving friend.', 'error');
    console.error('Save friend catch error:', err);
  }
}

// ====================== LOGOUT ======================

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

// ====================== EVENT LISTENERS ======================

if (newUserBtn) {
  newUserBtn.addEventListener('click', () => {
    const newUser = prompt('Enter new friend\'s username to chat with:');
    if (newUser) {
      const trimmedUser = newUser.trim();
      if (!trimmedUser) return;

      currentRecipient = trimmedUser;

      if (!friendsList.includes(trimmedUser)) {
        friendsList.push(trimmedUser);
        saveFriend(trimmedUser);
      }

      currentChatHeading.textContent = `Chatting with ${trimmedUser}`;
      displayMessages(trimmedUser);
      updateUserList();
    }
  });
}

if (searchFriendsInput) {
  searchFriendsInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    updateUserList(searchTerm);
  });
}


// ====================== MESSAGE ENCODER / DECODER ======================

function encodeMessage(message) {
  return btoa(message);
}

function decodeMessage(encodedMessage) {
  try {
    return atob(encodedMessage);
  } catch (e) {
    return encodedMessage;
  }
}


// ========================== togglr 
const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('toggleBtn');

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
  });
