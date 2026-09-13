const Puesto = require("../models/PuestoModel")
const Factory = require("../models/FactoryModel")

// Crear un puesto dentro de una fábrica
exports.createPuesto = async (req, res) => {
  try {
    const { name, description, factoryId } = req.body

    if (!name?.trim() || !factoryId) {
      return res.status(400).json({
        message: "El nombre del puesto y la fábrica son obligatorios.",
      })
    }

    const factory = await Factory.findById(factoryId)
    if (!factory) {
      return res.status(404).json({ message: "Fábrica no encontrada." })
    }

    const existingPuesto = await Puesto.findOne({
      name: name.trim(),
      factoryId,
    })

    if (existingPuesto) {
      return res.status(400).json({
        message: "Ya existe un puesto con ese nombre en esta fábrica.",
      })
    }

    const puesto = await Puesto.create({
      name: name.trim(),
      description,
      factoryId,
    })

    res.status(201).json(puesto)
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el puesto.",
      error: error.message,
    })
  }
}

// Obtener los puestos de una fábrica
exports.getPuestosByFactory = async (req, res) => {
  try {
    const { factoryId } = req.params

    const factory = await Factory.findById(factoryId)
    if (!factory) {
      return res.status(404).json({ message: "Fábrica no encontrada." })
    }

    const puestos = await Puesto.find({ factoryId }).sort({ name: 1 })

    res.status(200).json(puestos)
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener los puestos.",
      error: error.message,
    })
  }
}