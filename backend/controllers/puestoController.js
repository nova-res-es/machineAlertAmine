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

exports.getAllPuestos = async (req, res) => {
  try {
    const puestos = await Puesto.find()
      .populate({
        path: "factoryId",
        populate: {
          path: "categoryId",
          select: "name",
        },
      })
      .sort({ name: 1 })

    return res.status(200).json(puestos)
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener los puestos.",
      error: error.message,
    })
  }
}

exports.getPuestoById = async (req, res) => {
  try {
    const puesto = await Puesto.findById(req.params.id)

    if (!puesto) {
      return res.status(404).json({ message: "Puesto no encontrado." })
    }

    return res.status(200).json(puesto)
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener el puesto.",
      error: error.message,
    })
  }
}
exports.updatePuesto = async (req, res) => {
  try {
    const { name, description, factoryId } = req.body

    if (!name?.trim() || !factoryId) {
      return res.status(400).json({
        message: "El nombre del puesto y la fábrica son obligatorios.",
      })
    }

    const factory = await Factory.findById(factoryId)

    if (!factory) {
      return res.status(404).json({
        message: "Fábrica no encontrada.",
      })
    }

    const puesto = await Puesto.findById(req.params.id)

    if (!puesto) {
      return res.status(404).json({ message: "Puesto no encontrado." })
    }

    const puestoExistente = await Puesto.findOne({
      name: name.trim(),
      factoryId,
      _id: { $ne: puesto._id },
    })

    if (puestoExistente) {
      return res.status(400).json({
        message: "Ya existe un puesto con ese nombre en esta fábrica.",
      })
    }

    puesto.name = name.trim()
    puesto.description = description?.trim() || ""
    puesto.factoryId = factoryId

    await puesto.save()

    return res.status(200).json(puesto)
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar el puesto.",
      error: error.message,
    })
  }
}

exports.deletePuesto = async (req, res) => {
  try {
    const puesto = await Puesto.findByIdAndDelete(req.params.id)

    if (!puesto) {
      return res.status(404).json({ message: "Puesto no encontrado." })
    }

    return res.status(200).json({
      message: "Puesto eliminado correctamente.",
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar el puesto.",
      error: error.message,
    })
  }
}