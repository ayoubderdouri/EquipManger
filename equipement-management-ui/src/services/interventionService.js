import api from "./axiosInstance";

export const getInterventions = async () => {
  const { data } = await api.get("/interventions");
  return data;
};

export const getInterventionById = async (id) => {
  const { data } = await api.get(`/interventions/${id}`);
  return data;
};

export const createIntervention = async (payload) => {
  const { data } = await api.post("/interventions", payload);
  return data;
};

export const assignIntervention = async (id, assignedToUserId) => {
  const { data } = await api.post(`/interventions/${id}/assign`, {
    assignedToUserId,
  });
  return data;
};

export const addInterventionComment = async (id, payload) => {
  const { data } = await api.post(`/interventions/${id}/comments`, payload);
  return data;
};