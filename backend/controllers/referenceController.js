const Reference = require("../models/ReferenceModel")
const Puesto = require("../models/PuestoModel")

const referencePopulate = {
  path: "puestoId",
  select: "name factoryId",
  populate: {
    path: "factoryId",
    select: "name categoryId",
    populate: {
      path: "categoryId",
      select: "name",
    },
  },
}

const getPuestoForReference = async (puestoId) => {
  const puesto = await Puesto.findById(puestoId).populate("factoryId", "name")

  if (!puesto) {
    return { error: "Puesto no encontrado.", status: 404 }
  }

  const isUAP23 = puesto.factoryId?.name?.trim().toUpperCase() === "UAP2/3"

  if (!isUAP23) {
    return {
      error: "Las referencias solo se pueden asignar a puestos de Pintura de UAP2/3.",
      status: 400,
    }
  }

  return { puesto }
}

exports.createReference = async (req, res) => {
  try {
    const { name, description, puestoId, duration, status } = req.body

    if (!name?.trim() || !puestoId) {
      return res.status(400).json({
        message: "El nombre y el puesto son obligatorios.",
      })
    }

    const puestoResult = await getPuestoForReference(puestoId)

    if (puestoResult.error) {
      return res.status(puestoResult.status).json({
        message: puestoResult.error,
      })
    }

    const existingReference = await Reference.findOne({
      name: name.trim(),
      puestoId,
    })

    if (existingReference) {
      return res.status(400).json({
        message: "Ya existe una referencia con ese nombre en este puesto.",
      })
    }

    const reference = await Reference.create({
      name: name.trim(),
      description,
      puestoId,
      duration: duration || 90,
      status: status || "active",
    })

    const populatedReference = await Reference.findById(reference._id).populate(referencePopulate)

    return res.status(201).json(populatedReference)
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear la referencia.",
      error: error.message,
    })
  }
}

exports.getAllReferences = async (req, res) => {
  try {
    const filter = {}

    if (req.query.puestoId) {
      filter.puestoId = req.query.puestoId
    }

    const references = await Reference.find(filter)
      .populate(referencePopulate)
      .sort({ name: 1 })

    return res.status(200).json(references)
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las referencias.",
      error: error.message,
    })
  }
}
exports.getReferencesByPuesto = async (req, res) => {
  try {
    const references = await Reference.find({
      puestoId: req.params.puestoId,
      status: "active",
    })
      .populate(referencePopulate)
      .sort({ name: 1 })

    return res.status(200).json(references)
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener las referencias del puesto.",
      error: error.message,
    })
  }
}
exports.getReferenceById = async (req, res) => {
  try {
    const reference = await Reference.findById(req.params.id).populate(referencePopulate)

    if (!reference) {
      return res.status(404).json({
        message: "Referencia no encontrada.",
      })
    }

    return res.status(200).json(reference)
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener la referencia.",
      error: error.message,
    })
  }
}

exports.updateReference = async (req, res) => {
  try {
    const { name, description, puestoId, duration, status } = req.body

    if (!name?.trim() || !puestoId) {
      return res.status(400).json({
        message: "El nombre y el puesto son obligatorios.",
      })
    }

    const puestoResult = await getPuestoForReference(puestoId)

    if (puestoResult.error) {
      return res.status(puestoResult.status).json({
        message: puestoResult.error,
      })
    }

    const existingReference = await Reference.findOne({
      name: name.trim(),
      puestoId,
      _id: { $ne: req.params.id },
    })

    if (existingReference) {
      return res.status(400).json({
        message: "Ya existe una referencia con ese nombre en este puesto.",
      })
    }

    const reference = await Reference.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        description,
        puestoId,
        duration: duration || 90,
        status: status || "active",
      },
      {
        new: true,
        runValidators: true,
      },
    ).populate(referencePopulate)

    if (!reference) {
      return res.status(404).json({
        message: "Referencia no encontrada.",
      })
    }

    return res.status(200).json(reference)
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar la referencia.",
      error: error.message,
    })
  }
}

exports.deleteReference = async (req, res) => {
  try {
    const reference = await Reference.findByIdAndDelete(req.params.id)

    if (!reference) {
      return res.status(404).json({
        message: "Referencia no encontrada.",
      })
    }

    return res.status(200).json({
      message: "Referencia eliminada correctamente.",
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar la referencia.",
      error: error.message,
    })
  }
}