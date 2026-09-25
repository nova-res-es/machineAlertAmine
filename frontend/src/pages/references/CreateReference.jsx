"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getAllPuestos } from "@/apis/puestoApi"
import { createReference } from "@/apis/referenceApi"
import { toast } from "@/hooks/use-toast"

const CreateReference = () => {
  const navigate = useNavigate()

  const [reference, setReference] = useState({
    name: "",
    description: "",
    puestoId: "",
    duration: 90,
    status: "active",
  })

  const [puestos, setPuestos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchPuestos = async () => {
      try {
        setLoading(true)
        const puestosData = await getAllPuestos()
        setPuestos(puestosData || [])
      } catch (error) {
        console.error("Error al cargar puestos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los puestos de Pintura.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPuestos()
  }, [])

  const puestosPintura = puestos.filter(
    (puesto) => puesto.factoryId?.name?.trim().toUpperCase() === "UAP2/3",
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setReference((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!reference.name.trim() || !reference.puestoId) {
      toast({
        title: "Error",
        description: "El nombre y el puesto son obligatorios.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await createReference(reference)

      toast({
        title: "Referencia creada",
        description: "La referencia se ha asignado correctamente al puesto.",
        variant: "success",
      })

      navigate("/references")
    } catch (error) {
      console.error("Error al crear referencia:", error)
      toast({
        title: "Error",
        description: error?.message || "No se pudo crear la referencia.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center h-[60vh] mx-auto">
        <Loader2 className="w-10 h-10 mr-3 animate-spin" />
        <span className="text-lg">Cargando puestos de Pintura...</span>
      </div>
    )
  }

  return (
    <div className="container flex items-center justify-center min-h-[70vh] px-4 py-6 mx-auto">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="w-6 h-6 text-primary" />
            Nueva Referencia
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Referencia *
              </label>
              <Input
                id="name"
                name="name"
                value={reference.name}
                onChange={handleChange}
                placeholder="Ejemplo: REF-HHN-001"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <Textarea
                id="description"
                name="description"
                value={reference.description}
                onChange={handleChange}
                placeholder="Descripción opcional"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="puestoId" className="text-sm font-medium">
                Puesto de Pintura *
              </label>
              <Select
                value={reference.puestoId}
                onValueChange={(value) =>
                  handleChange({
                    target: {
                      name: "puestoId",
                      value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar puesto" />
                </SelectTrigger>

                <SelectContent>
                  {puestosPintura.map((puesto) => (
                    <SelectItem key={puesto._id} value={puesto._id}>
                      {puesto.name} — {puesto.factoryId?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Duración de la llamada (minutos) *
              </label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={reference.duration}
                onChange={(event) =>
                  handleChange({
                    target: {
                      name: "duration",
                      value: Number.parseInt(event.target.value) || 90,
                    },
                  })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Estado
              </label>

              <Select
                value={reference.status}
                onValueChange={(value) =>
                  handleChange({
                    target: {
                      name: "status",
                      value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="active">Activa</SelectItem>
                  <SelectItem value="inactive">Inactiva</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/references")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear referencia"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default CreateReference