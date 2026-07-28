import api from "./axiosInstance";

export const getMembres = async (page = 1, itemsPerPage = 10, filters = {}) => {
  const { data } = await api.get("/membres", {
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
      EstPresent:
        filters.estPresent === null || filters.estPresent === undefined
          ? undefined
          : filters.estPresent,
      Role: filters.role && filters.role !== "all" ? filters.role : undefined,
    },
  });

  return data;
};

export const createMembre = async (membre) => {
  const { data } = await api.post("/membres", membre);
  return data;
};

export const updateMembre = async (id, membre) => {
  const { data } = await api.put(`/membres/${id}`, membre);
  return data;
};

export const deleteMembre = async (id) => {
  const { data } = await api.delete(`/membres/${id}`);
  return data;
};

export const toggleMembrePresence = async (id, estPresent) => {
  const { data } = await api.patch(
    `membres/${id}/mark-presence?isPresent=${estPresent}`,
  );
  return data;
};
