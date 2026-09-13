import { apiRequest } from "./api"

const BASE_URL = "api/puestos"

// Obtener los puestos de una fábrica
export const getPuestosByFactory = (factoryId) => {
  return apiRequest("GET", `${BASE_URL}/factory/${factoryId}`)
}

// Crear un puesto
export const createPuesto = (data) => {
  return apiRequest("POST", BASE_URL, data)
}