# migration.py
import sqlite3

def migrate_database():
    conn = sqlite3.connect('food_planner.db')
    cursor = conn.cursor()
    
    # Check if email column exists
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    column_names = [column[1] for column in columns]
    
    if 'email' not in column_names:
        print("Adding email column to users table...")
        
        # Create a temporary table with the new schema
        cursor.execute('''
        CREATE TABLE users_new (
            username TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Get existing users
        cursor.execute("SELECT username, password, created_at FROM users")
        users = cursor.fetchall()
        
        # Insert users into new table with default email
        for user in users:
            username, password, created_at = user
            default_email = f"{username}@example.com"
            
            cursor.execute(
                "INSERT INTO users_new (username, email, password, created_at) VALUES (?, ?, ?, ?)",
                (username, default_email, password, created_at)
            )
        
        # Drop old table and rename new one
        cursor.execute("DROP TABLE users")
        cursor.execute("ALTER TABLE users_new RENAME TO users")
        
        print(f"Migration complete. {len(users)} users updated with default emails.")
    else:
        print("Email column already exists. No migration needed.")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate_database()