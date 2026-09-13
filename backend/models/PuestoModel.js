const mongoose = require("mongoose")

const puestoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true },
)

// Un mismo puesto no podrá repetirse dentro de la misma fábrica.
puestoSchema.index({ factoryId: 1, name: 1 }, { unique: true })

module.exports = mongoose.model("Puesto", puestoSchema)