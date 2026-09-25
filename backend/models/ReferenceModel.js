const mongoose = require("mongoose")
const { Schema } = mongoose

const referenceSchema = new Schema(
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
    puestoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Puesto",
      required: true,
    },
    duration: {
      type: Number,
      default: 90,
      min: 1,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
)

referenceSchema.index({ puestoId: 1, name: 1 }, { unique: true })

module.exports = mongoose.model("Reference", referenceSchema)