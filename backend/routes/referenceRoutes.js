const express = require("express")
const router = express.Router()

const {
  createReference,
  getAllReferences,
  getReferencesByPuesto,
  getReferenceById,
  updateReference,
  deleteReference,
} = require("../controllers/referenceController")

const { protect } = require("../middlewares/authMiddleware")
const { hasRole } = require("../middlewares/roleMiddleware")

const ADMIN_ROLES = ["Admin"]

// Producción puede leer solo las referencias activas del puesto seleccionado.
router.get("/puesto/:puestoId", protect, getReferencesByPuesto)

// Administración gestiona todas las referencias.
router.get("/", protect, hasRole(ADMIN_ROLES), getAllReferences)
router.post("/", protect, hasRole(ADMIN_ROLES), createReference)
router.get("/:id", protect, hasRole(ADMIN_ROLES), getReferenceById)
router.put("/:id", protect, hasRole(ADMIN_ROLES), updateReference)
router.delete("/:id", protect, hasRole(ADMIN_ROLES), deleteReference)

module.exports = router