import sqlite3

def init_db():
    conn = sqlite3.connect('food_planner.db')
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS ingredients (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT,
                        ingredient TEXT,
                        FOREIGN KEY (username) REFERENCES users(username))''')
    conn.commit()
    conn.close()

def add_ingredients(username, ingredients):
    conn = sqlite3.connect('food_planner.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return {"error": "User not found"}
    
    for ingredient in ingredients:
        cursor.execute("INSERT INTO ingredients (username, ingredient) VALUES (?, ?)", (username, ingredient))
    
    conn.commit()
    conn.close()
    return {"message": "Ingredients added successfully"}

def get_ingredients(username):
    conn = sqlite3.connect('food_planner.db')
    cursor = conn.cursor()
    cursor.execute("SELECT ingredient FROM ingredients WHERE username = ?", (username,))
    ingredients = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    return {"ingredients": ingredients}
