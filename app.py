from flask import Flask, render_template, redirect, url_for

app = Flask(__name__)

# Home route displays the signup page
@app.route('/')
def home():
    return render_template('signup.html')

# Login page route
@app.route('/login')
def login():
    return render_template('login.html')

# Chat page route
@app.route('/chat')
def chat():
    return render_template('index.html')

# Static files (JS/CSS) are served from /static by default.

if __name__ == '__main__':
    app.run(debug=True)
