import api from "./axiosInstance";

export const getRepresentants = async (page = 1, itemsPerPage = 10, filters = {}) => {
  const { data } = await api.get("/representants", {
    params: {
      PageNumber: page,
      PageSize: itemsPerPage,
      BureauId: filters.bureauId || undefined,
      Name: filters.name || undefined,
      PPR: filters.ppr || undefined,
      CIN: filters.cin || undefined,
      Sexe: filters.sexe || undefined,
      Juridiction: filters.juridiction || undefined,
      Poste: filters.poste || undefined,
    },
  });

  return data;
};

export const createRepresentant = async (payload) => {
  const { data } = await api.post("/representants", payload);
  return data;
};

export const updateRepresentant = async (id, payload) => {
  const { data } = await api.put(`/representants/${id}`, payload);
  return data;
};

export const deleteRepresentant = async (id) => {
  const { data } = await api.delete(`/representants/${id}`);
  return data;
};
