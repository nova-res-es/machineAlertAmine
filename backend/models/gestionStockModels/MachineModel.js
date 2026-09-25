const mongoose = require("mongoose")
const { Schema } = mongoose

const machineSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "No description provided." },
    status: { type: String, enum: ["active", "inactive", "maintenance"], default: "active" },
    duration: { type: Number, default: 90 }, // Duration field with default of 90 minutes
    zone: {
  type: String,
  enum: ["UAP1_INYECCION", "UAP23_PINTURA", "UAP23_INYECCION"],
  default: null,
},
    factoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Factory",
      required: true,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Machine", machineSchema)
