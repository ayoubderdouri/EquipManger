import api from "./axiosInstance";

export const getAllUsers = async (email = "", role = "", username = "") => {
  const params = {};
  if (username) params.username = username;
  if (email) params.email = email;
  if (role) params.role = role;

  const { data } = await api.get("/users", {
    params: params,
  });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/users/${id}`);
  return data;
};

export const getRoles = async () => {
  const { data } = await api.get("/users/roles");
  return data;
};

export const createUser = async (user) => {
  const { data } = await api.post("/users", user);
  return data;
};

export const updateUserRole = async (id, role) => {
  const { data } = await api.patch(`/users/${id}/role`, { role });
  return data;
};

export const updateUser = async (id, user) => {
  const { data } = await api.put(`/users/${id}`, user);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/users/${id}`);
  return data;
};

export const updateUserPassword = async (id, password) => {
  await api.patch(`/users/${id}/password`, {
    newPassword: password,
  });
};
