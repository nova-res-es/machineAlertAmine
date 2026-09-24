"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Cog, Loader2, Paintbrush } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFactoryById } from "@/apis/factoryApi"
import { toast } from "@/hooks/use-toast"

const ZonasView = () => {
  const { factoryId } = useParams()
  const navigate = useNavigate()

  const [factory, setFactory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFactory = async () => {
      try {
        setLoading(true)
        const factoryData = await getFactoryById(factoryId)
        setFactory(factoryData)
      } catch (error) {
        console.error("Error al cargar la fábrica:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar la fábrica",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFactory()
  }, [factoryId])

  const handleBackToFactories = () => {
    const categoryId = factory?.categoryId?._id || factory?.categoryId

    if (categoryId) {
      navigate(`/factories/${categoryId}`)
    } else {
      navigate("/dashboard")
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center h-[60vh] mx-auto">
        <Loader2 className="w-10 h-10 mr-3 animate-spin" />
        <span className="text-lg">Cargando zonas...</span>
      </div>
    )
  }

  return (
    <div className="container px-4 py-6 mx-auto space-y-8">
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToFactories}
          className="flex items-center gap-1 mb-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Fábricas
        </Button>

        <h1 className="text-4xl font-bold tracking-tight">
          Zonas - {factory?.name}
        </h1>

        <p className="mt-2 text-lg text-muted-foreground">
          Selecciona una zona para gestionar las llamadas
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card
          className="transition-all duration-200 border-2 cursor-pointer hover:shadow-lg hover:border-primary/20"
          onClick={() => navigate(`/puestos/${factoryId}`)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <Paintbrush className="w-7 h-7 text-primary" />
                Pintura
              </CardTitle>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Selecciona un puesto antes de acceder a las llamadas.
            </p>
            <Badge variant="outline">Puestos</Badge>
          </CardContent>
        </Card>

        <Card
          className="transition-all duration-200 border-2 cursor-pointer hover:shadow-lg hover:border-primary/20"
          onClick={() => navigate(`/calls/${factoryId}`)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <Cog className="w-7 h-7 text-primary" />
                Inyección
              </CardTitle>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>

          <CardContent>
            <p className="mb-4 text-muted-foreground">
              Accede directamente a las llamadas de Inyección.
            </p>
            <Badge variant="outline">Llamadas</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ZonasView