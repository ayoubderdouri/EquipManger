import api from "./axiosInstance";

export const CANDIDATURE_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  ARCHIVED: 4,
};

export const getCandidatures = async (
  page = 1,
  itemsPerPage = 10,
  filters = {},
  Corp 
) => {
  const { data } = await api.get("/candidatures", {
    params: {
      PageNumber: page,
      PageSize: itemsPerPage,
      Status:
        filters.status === "all" ||
        filters.status === null ||
        filters.status === undefined ||
        filters.status === ""
          ? undefined
          : Number(filters.status),
      CandidatName: filters.candidatName || undefined,
      CandidatCin: filters.candidatCin || undefined,
      CandidatPpr: filters.candidatPpr || undefined,
      CandidatSexe: filters.candidatSexe || undefined,
      Juridiction: filters.juridiction || undefined,
      Corp: Corp || undefined,
    },
  });

  return data;
};

export const getCandidatureById = async (id) => {
  const { data } = await api.get(`/candidatures/${id}`);
  return data;
};

export const createCandidature = async (payload) => {
  const { data } = await api.post("/candidatures", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const updateCandidature = async (id, payload) => {
  const { data } = await api.put(`/candidatures/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const deleteCandidature = async (id) => {
  await api.delete(`/candidatures/${id}`);
};

export const changeCandidatureStatus = async (id, status, motif) => {
  const { data } = await api.patch(`/candidatures/${id}/change-status`, null, {
    params: {
      status,
      motif: motif || undefined,
    },
  });

  return data;
};

export const downloadCandidaturePicture = async (id) => {
  const response = await api.get(`/candidatures/${id}/download-picture`, {
    responseType: "blob",
  });
  return response;
};

export const downloadCandidatureCv = async (id) => {
  const response = await api.get(`/candidatures/${id}/download-cv`, {
    responseType: "blob",
  });
  return response;
};
