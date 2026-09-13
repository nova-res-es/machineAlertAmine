const express = require("express")
const router = express.Router()

const {
  createPuesto,
  getPuestosByFactory,
  getAllPuestos,
  getPuestoById,
  updatePuesto,
  deletePuesto,
} = require("../controllers/puestoController")

const { protect } = require("../middlewares/authMiddleware")
const { hasRole } = require("../middlewares/roleMiddleware")

const MANAGEMENT_ROLES = ["Admin"]

// Crear puestos: solo Administración o Producción
router.post("/", protect, hasRole(MANAGEMENT_ROLES), createPuesto)
router.get("/", protect, getAllPuestos)

// Ver puestos de una fábrica: cualquier usuario identificado
router.get("/factory/:factoryId", protect, getPuestosByFactory)
router.get("/:id", protect, getPuestoById)
router.put("/:id", protect, hasRole(MANAGEMENT_ROLES), updatePuesto)
router.delete("/:id", protect, hasRole(MANAGEMENT_ROLES), deletePuesto)

module.exports = router