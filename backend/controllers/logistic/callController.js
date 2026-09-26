const Call = require("../../models/logistic/CallModel")
const Machine = require("../../models/gestionStockModels/MachineModel") // Add this import
const Reference = require("../../models/ReferenceModel")
const Factory = require("../../models/FactoryModel")
const excel = require("exceljs")
// Remove this line:
// const { sendCallCreationEmail } = require("../../utils/emailService")

exports.exportCallsToExcel = async (req, res) => {
  try {
    // Get filter parameters
    const { machineId, date, status } = req.query

    // Build filter object
    const filter = {}
    if (machineId) filter.machineId = machineId
    if (status) filter.status = status
    if (date) {
      // Convert date string to Date object range for the entire day
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      filter.date = { $gte: startDate, $lte: endDate }
    }

    // Find calls with filters and populate machine information
    const calls = await Call.find(filter)
      .populate({
        path: "machineId",
        select: "name",
        model: Machine,
      })
      .sort({ date: -1 })

    // Create a new Excel workbook
    const workbook = new excel.Workbook()
    const worksheet = workbook.addWorksheet("Llamadas")

    // Add columns
    worksheet.columns = [
      { header: "Nº DE MÁQUINA", key: "machine", width: 20 },
      { header: "FECHA", key: "date", width: 15 },
      { header: "HORA LLAMADA", key: "callTime", width: 15 },
      { header: "DURACIÓN (MIN)", key: "duration", width: 15 },
      { header: "ESTATUS", key: "status", width: 15 },
      { header: "CREADO POR", key: "createdBy", width: 15 },
      { header: "HORA TAREA TERMINADA", key: "completionTime", width: 20 },
    ]

    // Style the header row
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    }

    // Add rows
    calls.forEach((call) => {
      worksheet.addRow({
        machine: call.machineId ? call.machineId.name : "N/A",
        date: new Date(call.date).toLocaleDateString(),
        callTime: new Date(call.callTime).toLocaleTimeString(),
        duration: call.duration || 90, // Include the duration
        status: call.status,
        createdBy: call.createdBy || "N/A",
        completionTime: call.completionTime ? new Date(call.completionTime).toLocaleTimeString() : "N/A",
      })
    })

    // Set response headers
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    res.setHeader("Content-Disposition", `attachment; filename=llamadas_${new Date().toISOString().split("T")[0]}.xlsx`)

    // Write to response
    await workbook.xlsx.write(res)

    // End the response
    res.end()
  } catch (error) {
    console.error("Error exporting calls to Excel:", error)
    res.status(500).json({ message: "Error exporting calls to Excel" })
  }
}

// Get all calls with optional filtering
exports.getCalls = async (req, res) => {
  try {
    const {
      machineId,
      referenceId,
      date,
      status,
      factoryId,
      categoryId,
      zone,
      page = 1,
      limit = 10,
      sortByDuration,
    } = req.query

    const filter = {}

    if (machineId) filter.machines = machineId
    if (referenceId) filter.referenceId = referenceId
    if (status) filter.status = status
    if (zone) filter.zone = zone

    if (date) {
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)

      filter.date = {
        $gte: startDate,
        $lt: endDate,
      }
    }

    const pageNum = Math.max(Number.parseInt(page, 10) || 1, 1)
    const limitNum = Math.min(
      Math.max(Number.parseInt(limit, 10) || 10, 1),
      100,
    )
    const skip = (pageNum - 1) * limitNum

    let factoryIds = []

    if (factoryId) {
      factoryIds = [factoryId]
    } else if (categoryId) {
      factoryIds = await Factory.distinct("_id", { categoryId })
    }

    if (factoryId || categoryId) {
      if (factoryIds.length === 0) {
        return res.status(200).json({
          data: {
            calls: [],
            pagination: {
              page: pageNum,
              limit: limitNum,
              total: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
        })
      }

      const machineIds = await Machine.distinct("_id", {
        factoryId: { $in: factoryIds },
      })

      // Incluye llamadas nuevas y llamadas antiguas que solo guardaban la máquina.
      filter.$or = [
        { factoryId: { $in: factoryIds } },
        { machines: { $in: machineIds } },
      ]
    }

    const populateCalls = (query) =>
      query
        .populate("machines", "name description status duration factoryId zone")
        .populate("referenceId", "name description duration puestoId")

    let calls = []
    let total = 0

    if (sortByDuration === "asc" && !status) {
      const groups = [
        { status: "Pendiente", sort: { duration: 1, createdAt: -1 } },
        { status: "Realizada", sort: { createdAt: -1 } },
        { status: "Expirada", sort: { createdAt: -1 } },
      ]

      let remainingSkip = skip
      let remainingLimit = limitNum

      for (const group of groups) {
        const groupFilter = {
          ...filter,
          status: group.status,
        }

        const groupTotal = await Call.countDocuments(groupFilter)
        total += groupTotal

        if (remainingLimit === 0) continue

        if (remainingSkip >= groupTotal) {
          remainingSkip -= groupTotal
          continue
        }

        const groupCalls = await populateCalls(
          Call.find(groupFilter)
            .sort(group.sort)
            .skip(remainingSkip)
            .limit(remainingLimit),
        )

        calls.push(...groupCalls)
        remainingLimit -= groupCalls.length
        remainingSkip = 0
      }
    } else {
      total = await Call.countDocuments(filter)

      const sort =
        sortByDuration === "asc" && status === "Pendiente"
          ? { duration: 1, createdAt: -1 }
          : { createdAt: -1 }

      calls = await populateCalls(
        Call.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum),
      )
    }

    const callsWithRemainingTime = calls.map((call) => {
      const callObj = call.toObject()

      if (callObj.status === "Pendiente") {
        const now = new Date()
        const callTime = new Date(callObj.callTime)
        const duration = callObj.duration || 90
        const elapsedMinutes = Math.floor(
          (now - callTime) / (1000 * 60),
        )

        callObj.remainingTime = Math.max(0, duration - elapsedMinutes) * 60
        if (callObj.remainingTime === 0) {
  callObj.status = "Expirada"
}
      } else {
        callObj.remainingTime = 0
      }

      return callObj
    })

    const totalPages = Math.ceil(total / limitNum)

    return res.status(200).json({
      data: {
        calls: callsWithRemainingTime,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching calls:", error)

    return res.status(500).json({
      message: "Server error while fetching calls.",
      error: error.message,
    })
  }
}
// Update the createCall function to send email notifications
exports.createCall = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized, no token",
      })
    }

    const { machineId, referenceId, duration, callType } = req.body

    if (!machineId && !referenceId) {
      return res.status(400).json({
        message: "Debes seleccionar una máquina o una referencia.",
      })
    }

    if (machineId && referenceId) {
      return res.status(400).json({
        message: "Una llamada solo puede tener una máquina o una referencia.",
      })
    }

    let callData = {}

    if (machineId) {
      const machine = await Machine.findById(machineId)

      if (!machine) {
        return res.status(404).json({
          message: "Machine not found",
        })
      }

      callData = {
        machines: [machineId],
        factoryId: machine.factoryId,
        zone: machine.zone,
        duration: duration || machine.duration,
      }
    }

    if (referenceId) {
      const reference = await Reference.findById(referenceId).populate({
        path: "puestoId",
        populate: {
          path: "factoryId",
          select: "name",
        },
      })

      if (!reference) {
        return res.status(404).json({
          message: "Referencia no encontrada.",
        })
      }

      const isUAP23 =
        reference.puestoId?.factoryId?.name?.trim().toUpperCase() === "UAP2/3"

      if (!isUAP23) {
        return res.status(400).json({
          message: "Las referencias solo pueden utilizarse en Pintura de UAP2/3.",
        })
      }

      callData = {
        referenceId: reference._id,
        factoryId: reference.puestoId.factoryId._id,
        zone: "UAP23_PINTURA",
        duration: duration || reference.duration,
      }
    }

    let creatorRole = "PRODUCCION"

    if (req.user.roles && Array.isArray(req.user.roles)) {
      const isLogistics = req.user.roles.some(
        (role) =>
          role.toUpperCase() === "LOGISTICA" ||
          role.toUpperCase() === "LOGÍSTICA",
      )

      if (isLogistics) {
        creatorRole = "LOGISTICA"
      }
    }

    const newCall = new Call({
      ...callData,
      createdBy: creatorRole,
      callTime: new Date(),
      date: new Date(),
      status: "Pendiente",
      callType: callType || "normal",
    })

    const savedCall = await newCall.save()

    const populatedCall = await Call.findById(savedCall._id)
      .populate("machines", "name description status duration factoryId zone")
      .populate({
        path: "referenceId",
        select: "name description duration puestoId",
        populate: {
          path: "puestoId",
          select: "name factoryId",
        },
      })

    return res.status(201).json(populatedCall)
  } catch (error) {
    console.error("Error in createCall:", error)

    return res.status(500).json({
      message: error.message,
    })
  }
}

// Complete a call
exports.completeCall = async (req, res) => {
  try {
    const { id } = req.params

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no token" })
    }

    // Check if the user has the LOGISTICA role
    const isLogistics =
      req.user.roles &&
      Array.isArray(req.user.roles) &&
      req.user.roles.some((role) =>
  ["LOGISTICA", "LOGÍSTICA", "ADMIN"].includes(role.toUpperCase()),
)

    if (!isLogistics) {
      return res.status(403).json({ message: "Only LOGISTICA users can complete calls" })
    }

    const call = await Call.findById(id)

    if (!call) {
      return res.status(404).json({ message: "Call not found" })
    }

    call.status = "Realizada"
    call.completionTime = new Date()

    await call.save()

    res.json(call)
  } catch (error) {
    console.error("Error completing call:", error)
    res.status(500).json({ message: error.message })
  }
}

// Update the exportCalls function to include duration in the output
exports.exportCalls = async (req, res) => {
  try {
    // Get token from query params for direct browser access
    const { token, ...queryParams } = req.query;

    const calls = await Call.find(queryParams).populate("machines", "name").sort({ callTime: -1 });
    console.log("Calls to export:", calls);

    // Format for CSV
    const csvData = [
      [
        "Nº DE MÁQUINA",
        "FECHA",
        "HORA LLAMADA",
        "DURACIÓN (MIN)",
        "TIPO",
        "TIEMPO RESTANTE",
        "ESTATUS",
        "HORA TAREA TERMINADA",
      ],
      ...calls.map((call) => [
        call.machines
          .map((machine) => machine.name)
          .join(", "), // Join machine names if multiple
        new Date(call.date).toLocaleDateString(),
        new Date(call.callTime).toLocaleTimeString(),
        call.duration || 90, // Include the duration
        call.callType === "mole" ? "MOLE" : "NORMAL", // Include call type
        formatTime(call.remainingTime),
        call.status,
        call.completionTime ? new Date(call.completionTime).toLocaleTimeString() : "",
      ]),
    ];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=tabla_logistica.csv");

    // Simple CSV formatting
    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    res.send(csvContent);
  } catch (error) {
    console.error("Error in exportCalls:", error);
    res.status(500).json({ message: error.message });
  }
};
// Update the checkExpiredCalls function to use the call's duration
exports.checkExpiredCalls = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no token" })
    }

    // Find all pending calls
    const pendingCalls = await Call.find({ status: "Pendiente" })

    let updatedCount = 0
    const errors = []

    // Check each call's remaining time
    for (const call of pendingCalls) {
      try {
        // Calculate remaining time
        const callTime = new Date(call.callTime).getTime()
        const currentTime = new Date().getTime()
        const elapsedSeconds = Math.floor((currentTime - callTime) / 1000)
        const totalSeconds = (call.duration || 90) * 60 // Use the call's duration or default to 90 minutes
        const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds)

        // If remaining time is 0, mark as expired
        if (remainingSeconds <= 0) {
          call.status = "Expirada"
          call.completionTime = new Date()
          await call.save()
          updatedCount++
        }
      } catch (callError) {
        console.error(`Error updating call ${call._id}:`, callError)
        errors.push({ id: call._id, error: callError.message })
      }
    }

    res.json({
      message: `${updatedCount} expired calls marked as completed`,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Error in checkExpiredCalls:", error)
    res.status(500).json({ message: error.message })
  }
}

// Delete a call by ID
exports.deleteCall = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no token" })
    }

    const { id } = req.params

    // Check if the user has the LOGISTICA role
    const isLogistics =
      req.user.roles &&
      Array.isArray(req.user.roles) &&
      req.user.roles.some((role) =>
  ["LOGISTICA", "LOGÍSTICA", "ADMIN"].includes(role.toUpperCase()),
)

    if (!isLogistics) {
      return res.status(403).json({ message: "Only LOGISTICA users can delete calls" })
    }

    const deletedCall = await Call.findByIdAndDelete(id)

    if (!deletedCall) {
      return res.status(404).json({ message: "Call not found" })
    }

    res.status(200).json({ message: "Call deleted successfully" })
  } catch (error) {
    console.error("Error deleting call:", error)
    res.status(500).json({ message: error.message })
  }
}

// Helper function to format time
function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
}
