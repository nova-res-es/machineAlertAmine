const express = require("express")
const router = express.Router()

const {
  createPuesto,
  getPuestosByFactory,
} = require("../controllers/puestoController")

const { protect } = require("../middlewares/authMiddleware")
const { hasRole } = require("../middlewares/roleMiddleware")

const MANAGEMENT_ROLES = ["Admin", "PRODUCCION"]

// Crear puestos: solo Administración o Producción
router.post("/", protect, hasRole(MANAGEMENT_ROLES), createPuesto)

// Ver puestos de una fábrica: cualquier usuario identificado
router.get("/factory/:factoryId", protect, getPuestosByFactory)

module.exports = router