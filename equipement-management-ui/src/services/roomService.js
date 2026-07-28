import api from "./axiosInstance";

const ROOM_TYPE = "SALLE";

export const getRooms = async () => {
  const response = await api.get("/locations", {
    params: { type: ROOM_TYPE },
  });
  return response.data;
};

export const createRoom = async (payload) => {
  const response = await api.post("/locations", {
    ...payload,
    type: ROOM_TYPE,
  });
  return response.data;
};

export const updateRoom = async (id, payload) => {
  const response = await api.put(`/locations/${id}`, {
    ...payload,
    type: ROOM_TYPE,
  });
  return response.data;
};

export const deleteRoom = async (id) => {
  await api.delete(`/locations/${id}`);
};
