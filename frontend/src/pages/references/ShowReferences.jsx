"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, Loader2, Plus, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllReferences, deleteReference } from "@/apis/referenceApi"
import { toast } from "@/hooks/use-toast"

const ShowReferences = () => {
  const navigate = useNavigate()

  const [references, setReferences] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReferences = async () => {
    try {
      setLoading(true)
      const referencesData = await getAllReferences()
      setReferences(referencesData || [])
    } catch (error) {
      console.error("Error al cargar referencias:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las referencias.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferences()
  }, [])

  const handleDelete = async (reference) => {
    const confirmed = window.confirm(
      `¿Quieres eliminar la referencia "${reference.name}"?`,
    )

    if (!confirmed) return

    try {
      await deleteReference(reference._id)

      setReferences((currentReferences) =>
        currentReferences.filter((item) => item._id !== reference._id),
      )

      toast({
        title: "Referencia eliminada",
        description: "La referencia se ha eliminado correctamente.",
        variant: "success",
      })
    } catch (error) {
      console.error("Error al eliminar referencia:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la referencia.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center h-[60vh] mx-auto">
        <Loader2 className="w-10 h-10 mr-3 animate-spin" />
        <span className="text-lg">Cargando referencias...</span>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 mx-auto space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-4xl font-bold tracking-tight">
            <BookOpen className="w-8 h-8 text-primary" />
            Gestión de Referencias
          </h1>

          <p className="mt-2 text-lg text-muted-foreground">
            Crea referencias de Pintura y asígnalas a un puesto de UAP2/3.
          </p>
        </div>

        <Button
          onClick={() => navigate("/references/create")}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Referencia
        </Button>
      </div>

      {references.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />

            <h3 className="mb-2 text-xl font-semibold">
              No hay referencias creadas
            </h3>

            <p className="mb-4 text-muted-foreground">
              Crea una referencia para asignarla a un puesto de Pintura.
            </p>

            <Button onClick={() => navigate("/references/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Crear primera referencia
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {references.map((reference) => (
            <Card key={reference._id} className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="w-6 h-6 text-primary" />
                  {reference.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {reference.description || "Sin descripción"}
                </p>

                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Puesto: </span>
                    <Badge variant="secondary">
                      {reference.puestoId?.name || "Sin puesto"}
                    </Badge>
                  </p>

                  <p>
                    <span className="text-muted-foreground">Fábrica: </span>
                    <Badge variant="outline">
                      {reference.puestoId?.factoryId?.name || "UAP2/3"}
                    </Badge>
                  </p>

                  <p>
                    <span className="text-muted-foreground">Duración: </span>
                    {reference.duration} minutos
                  </p>

                  <Badge
                    variant={
                      reference.status === "active" ? "default" : "secondary"
                    }
                  >
                    {reference.status === "active" ? "Activa" : "Inactiva"}
                  </Badge>
                </div>

                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(reference)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ShowReferences