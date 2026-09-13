"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createPuesto } from "@/apis/puestoApi"
import { ArrowLeft, MapPin } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const CreatePuesto = () => {
  const { factoryId } = useParams()
  const navigate = useNavigate()

  const [puesto, setPuesto] = useState({
    name: "",
    description: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setPuesto((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!puesto.name.trim()) {
      toast({
        title: "Error",
        description: "Escribe un nombre para el puesto",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      await createPuesto({
        ...puesto,
        factoryId,
      })

      toast({
        title: "Puesto creado",
        description: "El puesto se ha creado correctamente",
        variant: "success",
      })

      navigate(`/puestos/${factoryId}`)
    } catch (error) {
      console.error("Error al crear el puesto:", error)

      toast({
        title: "Error",
        description: "No se pudo crear el puesto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900">
      <Card className="w-full max-w-md bg-white shadow-lg dark:bg-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <MapPin className="w-6 h-6" />
            Crear nuevo puesto
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nombre del puesto
              </label>

              <Input
                id="name"
                name="name"
                value={puesto.name}
                onChange={handleChange}
                placeholder="Por ejemplo: Puesto 01"
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
                value={puesto.description}
                onChange={handleChange}
                placeholder="Descripción opcional"
                rows={3}
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/puestos/${factoryId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear puesto"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default CreatePuesto