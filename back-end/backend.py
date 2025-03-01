from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import ingredients_db as ingredients_db

app = Flask(__name__, template_folder='../front-end')
CORS(app)

# Temporary storage for users (replace with a database later)
users = {}

@app.route('/')
def Home():
    return "Welcome to the Food Planner API"

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if username in users:
        return jsonify({"error": "User already exists"}), 400

    users[username] = password
    return jsonify({"message": "User created successfully"})

@app.route('/login')
def get_login():
    return render_template('Login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    print(username, password, users.get(username))
    if users.get(username) == password:
        return jsonify({"message": "Login successful"})

    print("failed")
    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/add_ingredients', methods=['POST'])
def add_ingredients():
    data = request.json
    username = data.get('username')
    ingredients = data.get('ingredients', [])

    if username not in users:
        return jsonify({"error": "User not found"}), 404

    ingredients_db[username].extend(ingredients)
    return jsonify({"message": "Ingredients added successfully", "ingredients": ingredients_db[username]})


if __name__ == '__main__':
    app.run(debug=True)


