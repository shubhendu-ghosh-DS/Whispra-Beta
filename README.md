# Whispra-Beta

**Whispra-Beta** is the user-facing web application for the Whispra platform—a seamless and interactive chat interface that connects users to the Whispra backend APIs. Built using Flask for server-side routing and HTML/CSS/JavaScript for a modern frontend experience, this app provides a secure and elegant flow for signing up, logging in, and engaging in real-time conversations.

## 🌐 Live Demo

The application is hosted on [Hugging Face Spaces](https://huggingface.co/spaces/shubhendu-ghosh-whispra).

---

## 📁 Project Structure

```
C:.
│   .gitattributes
│   app.py
│   Dockerfile
│   README.md
│   requirements.txt
│
├───static
│       modern-style.css
│       script.js
│       style.css
│
└───templates
        index.html
        login.html
        signup.html
```

---

## 🚀 Features

- ✨ Beautiful and responsive UI built with HTML/CSS and Vanilla JavaScript
- 🔐 Signup and login pages with real-time feedback
- 💬 Chat UI with modal-based new chat creation and message threads
- 🔁 Interacts with secure backend APIs for authentication and messaging
- 🔔 Toast notifications for actions like login, signup, and error feedback
- 📱 Mobile-responsive layout and modern UI elements

---

## 📜 Pages

### 1. `/signup` - Create Account
- Collects **email**, **username**, and **password**
- Sends data to the backend `/signup` API
- Shows success or error feedback via toast notifications

### 2. `/login` - User Login
- Accepts **username** and **password**
- Sends data to `/login` API and stores session data in localStorage
- Redirects to `/chat` on success

### 3. `/chat` - Main Chat Interface
- Sidebar with user search and chat list
- Dynamic message display with chat history
- Input box for sending messages
- Modal for initiating a new chat

---

## ⚙️ Tech Stack

| Layer       | Tech                      |
|-------------|---------------------------|
| Backend     | Flask                     |
| Frontend    | HTML, CSS, JavaScript     |
| Server      | Gunicorn                  |
| Deployment  | Docker, Hugging Face Spaces |

---

## 🐳 Docker Usage

To run the app using Docker:

```bash
# Build the Docker image
docker build -t whispra-beta .

# Run the container
docker run -p 7860:7860 whispra-beta
```

This will expose the application at `http://localhost:7860`.

---

## 📦 Installation (Local Development)

```bash
# Clone the repository
git clone https://github.com/your-username/whispra-beta.git
cd whispra-beta

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

By default, the app runs on `http://127.0.0.1:5000`.

---

## 🔒 Security Notes

- User credentials are sent over HTTPS (when hosted properly).
- **Passwords should never be stored in localStorage** (currently only used for demo purposes).
- For production, implement secure session management and OAuth or JWT-based authentication.

---

## 🛠️ Future Enhancements

- Real-time chat via WebSockets
- Avatar upload and profile pages
- AI-generated message suggestions
- End-to-end message encryption

---

## 🙌 Acknowledgments

This is the frontend application that interacts with the **Whispra** backend service. Built and maintained by [Shubhendu Ghosh](https://github.com/shubhendu-ghosh-DS).

---

## 📄 License

This project is licensed under the MIT License. See `LICENSE` for more details.

