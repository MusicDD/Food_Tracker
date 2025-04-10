import React, { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in when app loads
    const loggedInUser = localStorage.getItem("username")
    if (loggedInUser) {
      setUser({ username: loggedInUser })
    }
    setIsLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      console.log("Attempting login for:", username)

      // Use explicit URL instead of relying on proxy
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      })

      console.log("Login response status:", response.status)

      // Only try to parse JSON if the response exists
      let data
      try {
        data = await response.json()
        console.log("Login response data:", data)
      } catch (e) {
        console.error("Error parsing JSON response:", e)
        data = { error: "Invalid server response" }
      }

      if (response.ok) {
        setUser({ username })
        localStorage.setItem("username", username)
        return { success: true }
      } else {
        return { success: false, error: data?.error || "Login failed" }
      }
    } catch (error) {
      console.error("Login error details:", error)
      return { success: false, error: "Error connecting to server: " + error.message }
    }
  }

  const signup = async (username, email, password) => {
    try {
      console.log("Attempting signup for:", username, "with email:", email)

      // Use explicit URL instead of relying on proxy
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
        credentials: "include",
      })

      console.log("Signup response status:", response.status)

      // Only try to parse JSON if the response exists
      let data
      try {
        data = await response.json()
        console.log("Signup response data:", data)
      } catch (e) {
        console.error("Error parsing JSON response:", e)
        data = { error: "Invalid server response" }
      }

      if (response.ok) {
        setUser({ username })
        localStorage.setItem("username", username)
        return { success: true }
      } else {
        return { success: false, error: data?.error || "Signup failed" }
      }
    } catch (error) {
      console.error("Signup error details:", error)
      return { success: false, error: "Error connecting to server: " + error.message }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("username")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
