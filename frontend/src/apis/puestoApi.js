import { apiRequest } from "./api"

const BASE_URL = "api/puestos"

export const getAllPuestos = () => {
  return apiRequest("GET", BASE_URL)
}

// Obtener los puestos de una fábrica
export const getPuestosByFactory = (factoryId) => {
  return apiRequest("GET", `${BASE_URL}/factory/${factoryId}`)
}

// Crear un puesto
export const createPuesto = (data) => {
  return apiRequest("POST", BASE_URL, data)
}

export const getPuestoById = (id) =>
  apiRequest("GET", `${BASE_URL}/${id}`)

export const updatePuesto = (id, data) =>
  apiRequest("PUT", `${BASE_URL}/${id}`, data)

export const deletePuesto = (id) =>
  apiRequest("DELETE", `${BASE_URL}/${id}`)