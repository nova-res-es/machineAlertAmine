const express = require("express")
const router = express.Router()
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController")
const { protect } = require("../middlewares/authMiddleware")

const { hasRole } = require("../middlewares/roleMiddleware")
const ADMIN_ROLES = ["Admin"]
// Create a new category - only Admin
router.post("/", protect, hasRole(ADMIN_ROLES), createCategory)

// Get all categories - authenticated users
router.get("/", protect, getAllCategories)

// Get a category by ID - authenticated users
router.get("/:id", protect, getCategoryById)

// Update a category - only Admin
router.put("/:id", protect, hasRole(ADMIN_ROLES), updateCategory)

// Delete a category - only Admin
router.delete("/:id", protect, hasRole(ADMIN_ROLES), deleteCategory)

module.exports = router
