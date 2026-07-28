import api from "./axiosInstance";

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { username: email, password });
  return data;
};

export const logout = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  try {
    await api.post("/auth/logout", {});
  } catch (err) {
    console.warn("Logout failed on server, ignoring...");
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
};


export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
