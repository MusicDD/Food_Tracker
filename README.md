### Food Planner Application Setup Guide

This guide will help you set up and run the Food Planner application on your local machine after downloading all the files.

## Prerequisites

- Python 3.7+ (for the Flask backend)
- Node.js 14+ and npm (for the React frontend)
- Git (optional, for cloning the repository)


## Directory Structure

Ensure your files are organized in the following structure:

```plaintext
food-planner/
├── backend/
│   ├── backend.py
│   ├── recipes_db.py
│   ├── ingredients_db.py
│   └── migration.py
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.css
│       ├── index.js
│       ├── reportWebVitals.js
│       ├── setupTests.js
│       ├── context/
│       │   └── AuthContext.js
│       └── front-end/
│           └── components/
│               ├── App.js
│               ├── Dashboard.js
│               ├── FavoriteRecipes.js
│               ├── HeartButton.js
│               ├── Home.js
│               ├── IngredientList.js
│               ├── Login.js
│               ├── RecipeCard.js
│               ├── RecipeChat.js
│               ├── RecipeDetail.js
│               ├── RecipeSuggestions.js
│               └── Signup.js
```

## Setting Up the Backend

1. **Create a virtual environment** (recommended):

```shellscript
cd food-planner/backend
python -m venv venv
```


2. **Activate the virtual environment**:

1. Windows:

```shellscript
venv\Scripts\activate
```


2. macOS/Linux:

```shellscript
source venv/bin/activate
```





3. **Install required Python packages**:

```shellscript
pip install flask flask-cors sqlite3
```


4. **Initialize the database**:

```shellscript
python migration.py
```


5. **Start the Flask server**:

```shellscript
python backend.py
```

The backend server should now be running on `http://localhost:5000`.




## Setting Up the Frontend

1. **Navigate to the frontend directory**:

```shellscript
cd food-planner/frontend
```


2. **Create a package.json file** if it doesn't exist:

```shellscript
npm init -y
```


3. **Install required npm packages**:

```shellscript
npm install react react-dom react-router-dom react-scripts web-vitals lucide-react @testing-library/jest-dom @testing-library/react @testing-library/user-event
```

4.**Start the React development server**:

```shellscript
npm start
```

The frontend should now be running on `http://localhost:3000`.

### Food Planner Application Setup Guide

This guide will help you set up and run the Food Planner application on your local machine after downloading all the files.

## Prerequisites

- Python 3.7+ (for the Flask backend)
- Node.js 14+ and npm (for the React frontend)
- Git (optional, for cloning the repository)


## Directory Structure

Ensure your files are organized in the following structure:

```plaintext
food-planner/
├── backend/
│   ├── backend.py
│   ├── recipes_db.py
│   ├── ingredients_db.py
│   └── migration.py
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.css
│       ├── index.js
│       ├── reportWebVitals.js
│       ├── setupTests.js
│       ├── context/
│       │   └── AuthContext.js
│       └── front-end/
│           └── components/
│               ├── App.js
│               ├── Dashboard.js
│               ├── FavoriteRecipes.js
│               ├── HeartButton.js
│               ├── Home.js
│               ├── IngredientList.js
│               ├── Login.js
│               ├── RecipeCard.js
│               ├── RecipeChat.js
│               ├── RecipeDetail.js
│               ├── RecipeSuggestions.js
│               └── Signup.js
```

## Setting Up the Backend

1. **Create a virtual environment** (recommended):

```shellscript
cd food-planner/backend
python -m venv venv
```


2. **Activate the virtual environment**:

1. Windows:

```shellscript
venv\Scripts\activate
```


2. macOS/Linux:

```shellscript
source venv/bin/activate
```





3. **Install required Python packages**:

```shellscript
pip install flask flask-cors sqlite3
```


4. **Initialize the database**:

```shellscript
python migration.py
```


5. **Start the Flask server**:

```shellscript
python backend.py
```

The backend server should now be running on `http://localhost:5000`.




## Setting Up the Frontend

1. **Navigate to the frontend directory**:

```shellscript
cd food-planner/frontend
```


2. **Create a package.json file** if it doesn't exist:

```shellscript
npm init -y
```


3. **Install required npm packages**:

```shellscript
npm install react react-dom react-router-dom react-scripts web-vitals lucide-react @testing-library/jest-dom @testing-library/react @testing-library/user-event
```

4. **Start the React development server**:

```shellscript
npm start
```

The frontend should now be running on `http://localhost:3000`.




## Using the Application

1. **Open your browser** and navigate to `http://localhost:3000`
2. **Create an account** using the Signup page
3. **Log in** with your new account
4. **Add ingredients** on the My Ingredients page
5. **Get recipe suggestions** based on your ingredients
6. **Use the Recipe Chat** to find recipes by entering ingredients
7. **View and favorite recipes** that you like


## Troubleshooting

### Backend Issues

1. **Database connection errors**:

1. Ensure you've run `migration.py` to initialize the database
2. Check file permissions in the backend directory
3. Verify the database file path in `backend.py`



2. **Port already in use**:

1. Change the port in `backend.py` by modifying the line:

```python
app.run(debug=True, host='0.0.0.0', port=5000)
```


2. Update the frontend API URLs accordingly



3. **CORS errors**:

1. Verify the CORS configuration in `backend.py` includes your frontend URL:

```python
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}}, supports_credentials=True)
```

### Frontend Issues
1. **Module not found errors**:

- Run `npm install` to ensure all dependencies are installed
- Check import paths in your components



2. **API connection errors**:

- Ensure the backend server is running
- Check that API URLs in the frontend code point to the correct backend address
- Verify network connectivity between frontend and backend



3. **Authentication issues**:

- Clear browser localStorage and try logging in again
- Check browser console for error messages

