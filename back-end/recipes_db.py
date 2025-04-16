import sqlite3
import logging

logger = logging.getLogger(__name__)

def init_recipe_db():
    """Initialize the recipe database tables if they don't exist."""
    conn = sqlite3.connect('food_planner.db')
    cursor = conn.cursor()
    
    # Create recipes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        preparation_time INTEGER,
        cooking_time INTEGER,
        servings INTEGER,
        difficulty TEXT,
        image_url TEXT,
        instructions TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create recipe_ingredients table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        ingredient TEXT NOT NULL,
        quantity TEXT,
        unit TEXT,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
    )
    ''')
    
    # Create user_favorite_recipes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_favorite_recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        recipe_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users (username),
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
    )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Recipe database tables initialized")

def get_recipe_suggestions(username, ingredient_match_threshold=0.5):
    """
    Get recipe suggestions based on user's ingredients.
    
    Args:
        username: The username to get ingredients for
        ingredient_match_threshold: Minimum percentage of recipe ingredients the user must have
        
    Returns:
        List of recipe dictionaries with match percentage
    """
    conn = sqlite3.connect('food_planner.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get user's ingredients
    cursor.execute(
        "SELECT ingredient FROM ingredients WHERE username = ?", 
        (username,)
    )
    user_ingredients = [row['ingredient'].lower() for row in cursor.fetchall()]
    
    if not user_ingredients:
        conn.close()
        return []
    
    # Get all recipes with their ingredients
    cursor.execute("""
        SELECT r.id, r.name, r.description, r.preparation_time, r.cooking_time, 
               r.servings, r.difficulty, r.image_url, COUNT(ri.id) as total_ingredients
        FROM recipes r
        JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        GROUP BY r.id
    """)
    recipes = cursor.fetchall()
    
    suggestions = []
    
    for recipe in recipes:
        # Get ingredients for this recipe
        cursor.execute(
            "SELECT ingredient FROM recipe_ingredients WHERE recipe_id = ?",
            (recipe['id'],)
        )
        recipe_ingredients = [row['ingredient'].lower() for row in cursor.fetchall()]
        
        # Calculate match percentage
        matching_ingredients = [i for i in recipe_ingredients if i in user_ingredients]
        match_percentage = len(matching_ingredients) / len(recipe_ingredients)
        
        # Only include recipes that meet the threshold
        if match_percentage >= ingredient_match_threshold:
            suggestions.append({
                'id': recipe['id'],
                'name': recipe['name'],
                'description': recipe['description'],
                'preparation_time': recipe['preparation_time'],
                'cooking_time': recipe['cooking_time'],
                'servings': recipe['servings'],
                'difficulty': recipe['difficulty'],
                'image_url': recipe['image_url'],
                'match_percentage': match_percentage,
                'matching_ingredients': matching_ingredients,
                'missing_ingredients': [i for i in recipe_ingredients if i not in user_ingredients]
            })
    
    # Sort by match percentage (highest first)
    suggestions.sort(key=lambda x: x['match_percentage'], reverse=True)
    
    conn.close()
    return suggestions

def get_recipe_by_id(recipe_id):
    """Get detailed information about a specific recipe."""
    conn = sqlite3.connect('food_planner.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get recipe details
    cursor.execute(
        "SELECT * FROM recipes WHERE id = ?",
        (recipe_id,)
    )
    recipe = cursor.fetchone()
    
    if not recipe:
        conn.close()
        return None
    
    # Get recipe ingredients
    cursor.execute(
        "SELECT ingredient, quantity, unit FROM recipe_ingredients WHERE recipe_id = ?",
        (recipe_id,)
    )
    ingredients = [dict(row) for row in cursor.fetchall()]
    
    recipe_dict = dict(recipe)
    recipe_dict['ingredients'] = ingredients
    
    conn.close()
    return recipe_dict

def search_recipes(query):
    """Search for recipes by name or description."""
    conn = sqlite3.connect('food_planner.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    search_term = f"%{query}%"
    
    cursor.execute("""
        SELECT r.id, r.name, r.description, r.preparation_time, r.cooking_time, 
               r.servings, r.difficulty, r.image_url
        FROM recipes r
        WHERE r.name LIKE ? OR r.description LIKE ?
    """, (search_term, search_term))
    
    recipes = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return recipes

def add_favorite_recipe(username, recipe_id):
    """Add a recipe to user's favorites."""
    conn = sqlite3.connect('food_planner.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "INSERT INTO user_favorite_recipes (username, recipe_id) VALUES (?, ?)",
            (username, recipe_id)
        )
        conn.commit()
        success = True
    except sqlite3.Error as e:
        logger.error(f"Error adding favorite recipe: {e}")
        success = False
    
    conn.close()
    return success

def get_favorite_recipes(username):
    """Get a user's favorite recipes."""
    conn = sqlite3.connect('food_planner.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT r.id, r.name, r.description, r.preparation_time, r.cooking_time, 
               r.servings, r.difficulty, r.image_url
        FROM recipes r
        JOIN user_favorite_recipes ufr ON r.id = ufr.recipe_id
        WHERE ufr.username = ?
    """, (username,))
    
    recipes = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return recipes

def remove_favorite_recipe(username, recipe_id):
    """Remove a recipe from user's favorites."""
    conn = sqlite3.connect('food_planner.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "DELETE FROM user_favorite_recipes WHERE username = ? AND recipe_id = ?",
            (username, recipe_id)
        )
        conn.commit()
        success = True
    except sqlite3.Error as e:
        logger.error(f"Error removing favorite recipe: {e}")
        success = False
    
    conn.close()
    return success

def init_recipe_db():
    """Initialize the recipe database tables if they don't exist."""
    conn = sqlite3.connect('food_planner.db')
    cursor = conn.cursor()
    
    # Create recipes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        preparation_time INTEGER,
        cooking_time INTEGER,
        servings INTEGER,
        difficulty TEXT,
        image_url TEXT,
        instructions TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Create recipe_ingredients table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        ingredient TEXT NOT NULL,
        quantity TEXT,
        unit TEXT,
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
    )
    ''')
    
    # Create user_favorite_recipes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_favorite_recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        recipe_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users (username),
        FOREIGN KEY (recipe_id) REFERENCES recipes (id)
    )
    ''')

    # Check if sample recipes exist
    cursor.execute("SELECT COUNT(*) FROM recipes")
    if cursor.fetchone()[0] == 0:
        # Add sample recipes
        sample_recipes = [
            {
                'name': 'Avocado Toast',
                'description': 'Simple and delicious avocado on toast',
                'instructions': '1. Toast the bread\n2. Mash the avocado with a fork\n3. Spread avocado on toast\n4. Add salt and pepper to taste',
                'ingredients': ['bread', 'avocado', 'salt', 'pepper']
            },
            {
                'name': 'Scrambled Eggs',
                'description': 'Classic fluffy scrambled eggs',
                'instructions': '1. Beat eggs in a bowl\n2. Heat butter in a pan\n3. Pour eggs into pan\n4. Stir gently until cooked',
                'ingredients': ['eggs', 'butter', 'salt', 'pepper']
            }
        ]
        
        for recipe in sample_recipes:
            cursor.execute('''
                INSERT INTO recipes (name, description, instructions)
                VALUES (?, ?, ?)
            ''', (recipe['name'], recipe['description'], recipe['instructions']))
            recipe_id = cursor.lastrowid
            
            for ingredient in recipe['ingredients']:
                cursor.execute('''
                    INSERT INTO recipe_ingredients (recipe_id, ingredient)
                    VALUES (?, ?)
                ''', (recipe_id, ingredient))
    
    conn.commit()
    conn.close()
    logger.info("Recipe database tables initialized")