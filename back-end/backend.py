from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import logging
import re
import os
import sys
from recipes_db import (
    get_recipe_suggestions, get_recipe_by_id, search_recipes,
    add_favorite_recipe, get_favorite_recipes, remove_favorite_recipe, init_recipe_db
)

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Configure CORS to allow requests from your React development server
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}}, supports_credentials=True)

# Initialize databases
# init_db()  # Initialize ingredients database
init_recipe_db()  # Initialize recipe database

# Add error handler for 500 errors
@app.errorhandler(500)
def handle_500_error(e):
    logger.error(f"500 error: {str(e)}", exc_info=True)
    return jsonify({"error": "Internal server error", "details": str(e)}), 500

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

# Database setup with improved error handling
def get_db_connection():
    # Use absolute path for better reliability
    db_path = os.path.abspath('food_planner.db')
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection error with path {db_path}: {e}", exc_info=True)
        raise Exception(f"Failed to connect to database: {e}")

def ensure_db_exists():
    db_path = 'food_planner.db'
    db_dir = os.path.dirname(os.path.abspath(db_path)) if os.path.dirname(db_path) else '.'
    
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"Database path: {os.path.abspath(db_path)}")
    logger.info(f"Database directory: {db_dir}")
    
    # Check if directory is writable
    if not os.access(db_dir, os.W_OK):
        logger.error(f"Directory {db_dir} is not writable")
        return False
    
    # Try to create an empty file to test permissions
    test_file = os.path.join(db_dir, '.test_write_permission')
    try:
        with open(test_file, 'w') as f:
            f.write('test')
        os.remove(test_file)
        logger.info("Directory write permission test: Passed")
    except Exception as e:
        logger.error(f"Cannot write to directory: {e}")
        return False
    
    # Check if database exists
    if os.path.exists(db_path):
        logger.info(f"Database file exists: {db_path}")
        try:
            # Test if we can open it
            conn = sqlite3.connect(db_path)
            conn.close()
            logger.info("Database connection test: Passed")
            return True
        except sqlite3.Error as e:
            logger.error(f"Cannot open existing database: {e}")
            # If database is corrupted, rename it and create a new one
            backup_path = f"{db_path}.backup"
            logger.info(f"Renaming corrupted database to {backup_path}")
            try:
                os.rename(db_path, backup_path)
            except Exception as e:
                logger.error(f"Cannot rename corrupted database: {e}")
                return False
    else:
        logger.info(f"Database file does not exist: {db_path}")
    
    # Create new database
    try:
        conn = sqlite3.connect(db_path)
        conn.close()
        logger.info("Created new database file")
        return True
    except sqlite3.Error as e:
        logger.error(f"Cannot create database: {e}")
        return False

def check_db_status():
    db_path = 'food_planner.db'
    
    if os.path.exists(db_path):
        file_size = os.path.getsize(db_path)
        file_permissions = oct(os.stat(db_path).st_mode)[-3:]
        logger.info(f"Database file exists: {db_path}")
        logger.info(f"File size: {file_size} bytes")
        logger.info(f"File permissions: {file_permissions}")
        
        # Test connection
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = cursor.fetchall()
            logger.info(f"Database tables: {[table['name'] for table in tables]}")
            conn.close()
            return True
        except sqlite3.Error as e:
            logger.error(f"Database connection error: {e}")
            return False
    else:
        logger.warning(f"Database file does not exist: {db_path}")
        logger.info("Will attempt to create database on initialization")
        return False

def init_db():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create users table with email field
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Create ingredients table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ingredients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            name TEXT NOT NULL,
            checked BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (username) REFERENCES users (username)
        )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Database initialization error: {e}", exc_info=True)
        return False

# Check database before initializing
if not ensure_db_exists():
    logger.error("Critical error: Cannot create or access database")
    sys.exit(1)  # Exit the application if we can't access the database

# Initialize database on startup
if not init_db():
    logger.error("Failed to initialize database schema")
    sys.exit(1)

# Check database status after initialization
check_db_status()

# Helper function to validate email
def is_valid_email(email):
    return EMAIL_REGEX.match(email) is not None

# API Routes
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    logger.info(f"Signup request received: {data}")
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not password or not email:
        logger.warning("Signup failed: Username, email, and password are required")
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    # Validate email format
    if not is_valid_email(email):
        logger.warning(f"Signup failed: Invalid email format: {email}")
        return jsonify({"error": "Invalid email format"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
        if cursor.fetchone():
            conn.close()
            logger.warning(f"Signup failed: Username '{username}' already exists")
            return jsonify({"error": "Username already exists"}), 400
        
        # Check if email exists
        cursor.execute("SELECT email FROM users WHERE email = ?", (email,))
        if cursor.fetchone():
            conn.close()
            logger.warning(f"Signup failed: Email '{email}' already exists")
            return jsonify({"error": "Email already exists"}), 400
        
        # Create new user
        cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
                      (username, email, password))
        conn.commit()
        conn.close()
        
        logger.info(f"User '{username}' created successfully")
        return jsonify({"message": "User created successfully", "username": username})
    except Exception as e:
        logger.error(f"Database error during signup: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    logger.info(f"Login request received: {data}")
    
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        logger.warning("Login failed: Username and password are required")
        return jsonify({"error": "Username and password are required"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT username, password FROM users WHERE username = ?", (username,))
        user = cursor.fetchone()
        conn.close()
        
        if user and user['password'] == password:
            logger.info(f"User '{username}' logged in successfully")
            return jsonify({"message": "Login successful", "username": username})
        
        logger.warning(f"Login failed for user '{username}': Invalid credentials")
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        logger.error(f"Database error during login: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500

@app.route('/api/ingredients', methods=['GET'])
def get_ingredients():
    username = request.args.get('username')
    
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT id, name, checked FROM ingredients WHERE username = ? ORDER BY created_at DESC", 
            (username,)
        )
        
        rows = cursor.fetchall()
        conn.close()
        
        ingredients = []
        for row in rows:
            ingredients.append({
                "id": row['id'],
                "name": row['name'],
                "checked": bool(row['checked'])
            })
        
        return jsonify({"ingredients": ingredients})
    except Exception as e:
        logger.error(f"Error getting ingredients: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500

@app.route('/api/add_ingredients', methods=['POST'])
def add_ingredients():
    data = request.json
    username = data.get('username')
    ingredients = data.get('ingredients', [])
    
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    if not ingredients:
        return jsonify({"error": "No ingredients provided"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify user exists
        cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
        if not cursor.fetchone():
            conn.close()
            return jsonify({"error": "User not found"}), 404
        
        # Add ingredients
        for ingredient in ingredients:
            if isinstance(ingredient, dict):
                name = ingredient.get('name')
                checked = ingredient.get('checked', False)
            else:
                name = ingredient
                checked = False
                
            cursor.execute(
                "INSERT INTO ingredients (username, name, checked) VALUES (?, ?, ?)",
                (username, name, checked)
            )
        
        conn.commit()
        
        # Get updated ingredients list
        cursor.execute(
            "SELECT id, name, checked FROM ingredients WHERE username = ? ORDER BY created_at DESC", 
            (username,)
        )
        
        rows = cursor.fetchall()
        conn.close()
        
        updated_ingredients = []
        for row in rows:
            updated_ingredients.append({
                "id": row['id'],
                "name": row['name'],
                "checked": bool(row['checked'])
            })
        
        return jsonify({
            "message": "Ingredients added successfully",
            "ingredients": updated_ingredients
        })
    except Exception as e:
        logger.error(f"Error adding ingredients: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500

@app.route('/api/update_ingredient_status', methods=['POST'])
def update_ingredient_status():
    data = request.json
    username = data.get('username')
    ingredients = data.get('ingredients', [])
    
    if not username or not ingredients:
        return jsonify({"error": "Username and ingredients are required"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for ingredient in ingredients:
            if isinstance(ingredient, dict):
                name = ingredient.get('name')
                checked = ingredient.get('checked', False)
                
                cursor.execute(
                    "UPDATE ingredients SET checked = ? WHERE username = ? AND name = ?",
                    (checked, username, name)
                )
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Ingredients updated successfully"})
    except Exception as e:
        logger.error(f"Error updating ingredients: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500

@app.route('/api/remove_ingredient', methods=['POST'])
def remove_ingredient():
    data = request.json
    username = data.get('username')
    ingredient = data.get('ingredient')
    
    if not username or not ingredient:
        return jsonify({"error": "Username and ingredient are required"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "DELETE FROM ingredients WHERE username = ? AND name = ?",
            (username, ingredient)
        )
        
        conn.commit()
        conn.close()
        
        return jsonify({"message": "Ingredient removed successfully"})
    except Exception as e:
        logger.error(f"Error removing ingredient: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
# Adding ingrediants
@app.route('/api/chat/recipes', methods=['POST'])
def chat_recipes():
    data = request.json
    ingredients = data.get('ingredients', [])
    username = data.get('username')
    
    if not ingredients:
        return jsonify({"error": "Please provide ingredients"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Convert ingredients to lowercase for case-insensitive matching
        ingredients_lower = [i.lower() for i in ingredients]
        
        # Find recipes that contain any of the provided ingredients
        placeholders = ','.join(['?'] * len(ingredients_lower))
        query = f"""
            SELECT r.id, r.name, r.description, r.instructions,
                   GROUP_CONCAT(ri.ingredient) as all_ingredients,
                   SUM(CASE WHEN LOWER(ri.ingredient) IN ({placeholders}) THEN 1 ELSE 0 END) as match_count,
                   COUNT(ri.id) as total_ingredients
            FROM recipes r
            JOIN recipe_ingredients ri ON r.id = ri.recipe_id
            GROUP BY r.id
            HAVING match_count > 0
            ORDER BY match_count DESC, total_ingredients ASC
            LIMIT 5
        """
        
        cursor.execute(query, ingredients_lower * 2)  # *2 because we use placeholders twice
        recipes = cursor.fetchall()
        
        formatted_recipes = []
        for recipe in recipes:
            all_ingredients = recipe['all_ingredients'].split(',')
            matching = [i for i in all_ingredients if i.lower() in ingredients_lower]
            missing = [i for i in all_ingredients if i.lower() not in ingredients_lower]
            
            formatted_recipes.append({
                'id': recipe['id'],
                'name': recipe['name'],
                'description': recipe['description'],
                'matching_ingredients': matching,
                'missing_ingredients': missing,
                'match_percentage': round(recipe['match_count'] / recipe['total_ingredients'], 2),
                'instructions': recipe['instructions'].split('\n') if recipe['instructions'] else []
            })
        
        conn.close()
        return jsonify({"recipes": formatted_recipes})
        
    except Exception as e:
        logger.error(f"Error in chat_recipes: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

# Add a simple test route to verify the API is working
@app.route('/api/test', methods=['GET'])
def test_api():
    return jsonify({"message": "API is working correctly"})

# Add database test endpoint
@app.route('/api/test_db', methods=['GET'])
def test_db():
    try:
        # Test database connection
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get list of tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row['name'] for row in cursor.fetchall()]
        
        # Test users table
        user_count = 0
        if 'users' in tables:
            cursor.execute("SELECT COUNT(*) as count FROM users")
            user_count = cursor.fetchone()['count']
        
        # Test ingredients table
        ingredient_count = 0
        if 'ingredients' in tables:
            cursor.execute("SELECT COUNT(*) as count FROM ingredients")
            ingredient_count = cursor.fetchone()['count']
        
        conn.close()
        
        return jsonify({
            "status": "success",
            "database_connected": True,
            "tables": tables,
            "user_count": user_count,
            "ingredient_count": ingredient_count,
            "database_path": os.path.abspath('food_planner.db')
        })
    except Exception as e:
        logger.error(f"Database test error: {e}", exc_info=True)
        return jsonify({
            "status": "error",
            "database_connected": False,
            "error": str(e),
            "database_path": os.path.abspath('food_planner.db')
        }), 500

@app.route('/api/db_status', methods=['GET'])
def db_status():
    status = check_db_status()
    return jsonify({
        "database_exists": os.path.exists('food_planner.db'),
        "connection_successful": status,
        "working_directory": os.getcwd()
    })

if __name__ == '__main__':
    logger.info("Starting Flask server on port 5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
@app.route('/api/recipes/suggest', methods=['GET'])
def suggest_recipes():
    username = request.args.get('username')
    threshold = request.args.get('threshold', default=0.5, type=float)
    
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    try:
        suggestions = get_recipe_suggestions(username, threshold)
        return jsonify({"recipes": suggestions})
    except Exception as e:
        logger.error(f"Error suggesting recipes: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500

@app.route('/api/recipes/<int:recipe_id>', methods=['GET'])
def get_recipe(recipe_id):
    try:
        recipe = get_recipe_by_id(recipe_id)
        if recipe:
            return jsonify({"recipe": recipe})
        else:
            return jsonify({"error": "Recipe not found"}), 404
    except Exception as e:
        logger.error(f"Error getting recipe: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500

@app.route('/api/recipes/search', methods=['GET'])
def search_recipe():
    query = request.args.get('query', '')
    
    if not query:
        return jsonify({"error": "Search query is required"}), 400
    
    try:
        recipes = search_recipes(query)
        return jsonify({"recipes": recipes})
    except Exception as e:
        logger.error(f"Error searching recipes: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500

@app.route('/api/recipes/favorite', methods=['POST'])
def favorite_recipe():
    data = request.json
    username = data.get('username')
    recipe_id = data.get('recipe_id')
    
    if not username or not recipe_id:
        return jsonify({"error": "Username and recipe_id are required"}), 400
    
    try:
        success = add_favorite_recipe(username, recipe_id)
        if success:
            return jsonify({"message": "Recipe added to favorites"})
        else:
            return jsonify({"error": "Failed to add recipe to favorites"}), 500
    except Exception as e:
        logger.error(f"Error adding favorite recipe: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500

@app.route('/api/recipes/favorite', methods=['DELETE'])
def unfavorite_recipe():
    data = request.json
    username = data.get('username')
    recipe_id = data.get('recipe_id')
    
    if not username or not recipe_id:
        return jsonify({"error": "Username and recipe_id are required"}), 400
    
    try:
        success = remove_favorite_recipe(username, recipe_id)
        if success:
            return jsonify({"message": "Recipe removed from favorites"})
        else:
            return jsonify({"error": "Failed to remove recipe from favorites"}), 500
    except Exception as e:
        logger.error(f"Error removing favorite recipe: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500

@app.route('/api/recipes/favorites', methods=['GET'])
def get_favorites():
    username = request.args.get('username')
    
    if not username:
        return jsonify({"error": "Username is required"}), 400
    
    try:
        recipes = get_favorite_recipes(username)
        return jsonify({"recipes": recipes})
    except Exception as e:
        logger.error(f"Error getting favorite recipes: {e}", exc_info=True)
        return jsonify({"error": f"Database error occurred: {str(e)}"}), 500
