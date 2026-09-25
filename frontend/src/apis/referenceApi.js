import { apiRequest } from "./api"

const BASE_URL = "api/references"

export const getAllReferences = () => {
  return apiRequest("GET", BASE_URL)
}

export const getReferencesByPuesto = (puestoId) => {
  return apiRequest("GET", `${BASE_URL}/puesto/${puestoId}`)
}

export const createReference = (data) => {
  return apiRequest("POST", BASE_URL, data)
}

export const getReferenceById = (id) => {
  return apiRequest("GET", `${BASE_URL}/${id}`)
}

export const updateReference = (id, data) => {
  return apiRequest("PUT", `${BASE_URL}/${id}`, data)
}

export const deleteReference = (id) => {
  return apiRequest("DELETE", `${BASE_URL}/${id}`)
}