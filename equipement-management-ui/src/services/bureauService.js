import api from "./axiosInstance";

export const getBureaux = async (
  page = 1,
  itemsPerPage = 10,
  search = "",
  techId = "all",
) => {
  const { data } = await api.get("/bureaux", {
    params: {
      PageNumber: page,
      PageSize: itemsPerPage,
      Libelle: search,
      TechnicienId: techId !== "all" ? techId : undefined,
    },
  });

  return data;
};

export const getBureauById = async (id) => {
  const { data } = await api.get(`/bureaux/${id}`);
  return data;
};

export const createBureau = async (bureau) => {
  const { data } = await api.post("/bureaux", bureau);
  return data;
};

export const updateBureau = async (id, data) => {
  const { data: updatedData } = await api.put(`/bureaux/${id}`, {
    technicienId: data.technicienId,
    label: data.label,
  });
  return updatedData;
};

export const searchBureauxByLibelle = async (
  libelle = "",
  page = 1,
  itemsPerPage = 20,
) => {
  const { data } = await api.get("/bureaux", {
    params: {
      PageNumber: page,
      PageSize: itemsPerPage,
      Label: libelle,
    },
  });

  return data?.items ?? [];
};


