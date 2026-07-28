import api from "./axiosInstance";

export const getCandidaturePjById = async (id) => {
  const { data } = await api.get(`/candidature-pjs/${id}`);
  return data;
};

export const getCandidaturePjsByCandidatureId = async (candidatureId) => {
  const { data } = await api.get("/candidature-pjs", {
    params: {
      candidatureId,
    },
  });

  // Swagger indique un objet, mais le backend peut renvoyer une liste.
  if (Array.isArray(data)) {
    return data;
  }

  return data ? [data] : [];
};

export const addCandidaturePj = async (payload) => {
  const { data } = await api.post("/candidature-pjs", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const deleteCandidaturePj = async (id) => {
  await api.delete(`/candidature-pjs/${id}`);
};

export const downloadCandidaturePj = async (id) => {
  const response = await api.get(`/candidature-pjs/${id}/download`, {
    responseType: "blob",
  });
  return response;
};
