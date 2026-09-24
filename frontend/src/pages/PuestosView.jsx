"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFactoryById } from "@/apis/factoryApi"
import { getPuestosByFactory } from "@/apis/puestoApi"
import { useAuth } from "@/context/AuthContext"
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Plus,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const PuestosView = () => {
  const { factoryId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [factory, setFactory] = useState(null)
  const [puestos, setPuestos] = useState([])
  const [loading, setLoading] = useState(true)

  const canManagePuestos = user?.roles?.some((role) => role === "Admin")
  const isUAP23 = factory?.name?.trim().toUpperCase() === "UAP2/3"

  useEffect(() => {
    const fetchFactoryAndPuestos = async () => {
      try {
        setLoading(true)

        const [factoryData, puestosData] = await Promise.all([
          getFactoryById(factoryId),
          getPuestosByFactory(factoryId),
        ])

        setFactory(factoryData)
        setPuestos(puestosData || [])
      } catch (error) {
        console.error("Error al cargar los puestos:", error)

        toast({
          title: "Error",
          description: "No se pudieron cargar los puestos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFactoryAndPuestos()
  }, [factoryId])

  const handleBackToFactories = () => {
  if (isUAP23) {
    navigate(`/zonas/${factoryId}`)
    return
  }

  const categoryId = factory?.categoryId?._id || factory?.categoryId

  if (categoryId) {
    navigate(`/factories/${categoryId}`)
  } else {
    navigate("/dashboard")
  }
}

  const handlePuestoClick = (puestoId) => {
    navigate(`/calls/${factoryId}/puesto/${puestoId}`)
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center h-[60vh] mx-auto">
        <Loader2 className="w-10 h-10 mr-3 animate-spin" />
        <span className="text-lg">Cargando puestos...</span>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 mx-auto space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToFactories}
            className="flex items-center gap-1 mb-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            {isUAP23 ? "Volver a Zonas" : "Volver a Fábricas"}
          </Button>

          <h1 className="text-4xl font-bold tracking-tight">
            Puestos - {factory?.name}
          </h1>

          <p className="mt-2 text-lg text-muted-foreground">
            Selecciona un puesto para gestionar las llamadas
          </p>
        </div>

        {canManagePuestos && (
          <Button
            onClick={() => navigate(`/puestos/create/${factoryId}`)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Puesto
          </Button>
        )}
      </div>

      {puestos.length === 0 ? (
        <Card className="py-12 text-center">
          <CardContent>
            <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="mb-2 text-xl font-semibold">
              No hay puestos en esta fábrica
            </h3>
            <p className="mb-4 text-muted-foreground">
              Crea un puesto para empezar a gestionar llamadas
            </p>

            {canManagePuestos && (
              <Button onClick={() => navigate(`/puestos/create/${factoryId}`)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear primer puesto
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {puestos.map((puesto) => (
            <Card
              key={puesto._id}
              className="transition-all duration-200 border-2 cursor-pointer hover:shadow-lg hover:border-primary/20"
              onClick={() => handlePuestoClick(puesto._id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <MapPin className="w-6 h-6 text-primary" />
                    {puesto.name}
                  </CardTitle>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>

              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  {puesto.description || "Sin descripción"}
                </p>

                <div className="flex items-center justify-between">
                  <Badge variant="outline">Puesto</Badge>
                  <span className="text-sm text-muted-foreground">
                    Creado: {new Date(puesto.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default PuestosView