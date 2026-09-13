const express = require("express")
const router = express.Router()
const {
  createFactory,
  getAllFactories,
  getFactoryById,
  updateFactory,
  deleteFactory,
  getFactoriesByCategory,
} = require("../controllers/factoryController")
const { protect } = require("../middlewares/authMiddleware")

const { hasRole } = require("../middlewares/roleMiddleware")
const ADMIN_ROLES = ["Admin"]
// Create a new factory - only Admin
router.post("/", protect, hasRole(ADMIN_ROLES), createFactory)

// Get all factories - authenticated users (with optional category filter)
router.get("/", protect, getAllFactories)

// Get factories by category - authenticated users
router.get("/category/:categoryId", protect, getFactoriesByCategory)

// Get a factory by ID - authenticated users
router.get("/:id", protect, getFactoryById)

// Update a factory - only Admin
router.put("/:id", protect, hasRole(ADMIN_ROLES), updateFactory)

// Delete a factory - only Admin
router.delete("/:id", protect, hasRole(ADMIN_ROLES), deleteFactory)

module.exports = router
