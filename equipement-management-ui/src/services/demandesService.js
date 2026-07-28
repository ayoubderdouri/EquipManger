import api from "./axiosInstance";

export const getDemandeDetails = async (id) => {
  const { data } = await api.get(`/admin/demandes/${id}`);
  return data;
};
