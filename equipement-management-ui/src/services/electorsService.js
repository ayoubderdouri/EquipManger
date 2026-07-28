import api from "./axiosInstance";

export const getElectors = async (
  page = 1,
  itemsPerPage = 10,
  filters = {},
) => {
  const { data } = await api.get("/electors", {
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
      AcceptsSms:
        filters.acceptsSms === null || filters.acceptsSms === undefined
          ? undefined
          : filters.acceptsSms,
      EstPresent:
        filters.estPresent === null || filters.estPresent === undefined
          ? undefined
          : filters.estPresent,
      Corps:
        filters.corps === null ||
        filters.corps === undefined ||
        filters.corps === "all"
          ? undefined
          : filters.corps,
    },
  });

  return data;
};

export const searchElectors = async (
  search = "",
  page = 1,
  itemsPerPage = 20,
) => {
  const { data } = await api.get("/electors", {
    params: {
      PageNumber: page,
      PageSize: itemsPerPage,
      Name: search || undefined,
    },
  });

  return data?.items ?? [];
};

export const getElectorById = async (id) => {
  const { data } = await api.get(`/electors/${id}`);
  return data;
};

export const createElector = async (elector) => {
  const { data } = await api.post("/electors", elector);
  return data;
};

export const updateElector = async (id, elector) => {
  const { data } = await api.put(`/electors/${id}`, elector);
  return data;
};

export const deleteElector = async (id) => {
  const { data } = await api.delete(`/electors/${id}`);
  return data;
};

export const updateElectorSmsConsent = async (magId, acceptSms) => {
  const { data } = await api.patch("/electors/accept-sms", null, {
    params: {
      magId,
      acceptSms,
    },
  });

  return data;
};

export const toggleElectorPresence = async (id, estPresent) => {
  const { data } = await api.patch(`/electors/${id}/mark-presence`, null, {
    params: {
      isPresent: estPresent,
    },
  });

  return data;
};

export const changeElectorBureau = async (id, payload) => {
  const formData = new FormData();
  formData.append("NouveauBureauVoteId", payload.nouveauBureauVoteId);

  if (payload.observation) {
    formData.append("Observation", payload.observation);
  }

  if (payload.demandePj) {
    formData.append("DemandePJ", payload.demandePj);
  }

  const { data } = await api.put(`/electors/${id}/bureaux`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const downloadPresentElectorsList = async (bureauId, Corp) => {
  const { data } = await api.get(
    `/bureaux/${bureauId}/download-presence-list`,
    {
      responseType: "blob",
      params: {
        corp: Corp !== null && Corp !== undefined && Corp !== "all" ? Corp : undefined,
      },
    },
  );
  return data;
};
