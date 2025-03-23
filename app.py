from flask import Flask, render_template, redirect, url_for

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('signup.html')


@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/chat')
def chat():
    return render_template('index.html')


if __name__ == '__main__':
    app.run(debug=True)
