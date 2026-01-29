import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Constants
const API_URL = import.meta.env.VITE_API_URL || "/api";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common["Authorization"];
    setCurrentUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    // Check for stored token on initial load
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    const isTokenValid = (token) => {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
      } catch (error) {
        return false;
      }
    };

    if (token && user) {
      if (isTokenValid(token)) {
        setCurrentUser(JSON.parse(user));
        // Set default header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        // Token expired, clear storage
        logout();
      }
    }

    // Axios Interceptor to handle expired tokens in API responses
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          (error.response.status === 401 ||
            (error.response.status === 400 &&
              error.response.data?.error === "Invalid token."))
        ) {
          logout();
        }
        return Promise.reject(error);
      },
    );

    setLoading(false);

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
      });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setCurrentUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
