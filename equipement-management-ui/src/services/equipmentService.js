import api from "./axiosInstance";

export const getEquipments = async () => {
  const response = await api.get("/equipments");
  return response.data;
};

export const getEquipmentById = async (id) => {
  const response = await api.get(`/equipments/${id}`);
  return response.data;
};

export const getLocations = async () => {
  const response = await api.get("/locations");
  return response.data;
};

export const createEquipment = async (payload, photoFile) => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );

  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const response = await api.post("/equipments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const updateEquipment = async (id, payload, photoFile) => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );

  if (photoFile) {
    formData.append("photo", photoFile);
  }

  const response = await api.put(`/equipments/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteEquipment = async (id) => {
  await api.delete(`/equipments/${id}`);
};
