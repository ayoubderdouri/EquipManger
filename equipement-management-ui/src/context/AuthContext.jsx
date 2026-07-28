// AuthContext.jsx
import { createContext, useReducer, useContext, useEffect } from "react";
import { authReducer, initialAuthState } from "../reducers/authReducer";
import * as authService from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/axiosInstance";
import { isTokenExpired } from "../utils/jwt";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { scheduleTokenExpiration } from "../utils/scheduleTokenExpiration";

const AuthContext = createContext();







export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = authService.getCurrentUser();

    if (token && user && !isTokenExpired(token)) {
      dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });

      if (location.pathname === "/login") {
        navigate("/");
      }
    } else {
      logout();
    }
  }, []);


  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" });
    try {
      
      const data = await authService.login(email, password);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      scheduleTokenExpiration(data.token, navigate);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { token: data.token, user: data.user },
      });

      navigate("/"); 
    } catch (err) {
      console.error("Login error:", err);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: err.response?.data?.message || err.message,
      });
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch { }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  // ✅ Intercepteur global 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401) {
          logout(); // auto logout si backend dit 401
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
