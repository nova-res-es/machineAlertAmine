"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getPuestoById, updatePuesto } from "@/apis/puestoApi"
import { getAllCategories } from "@/apis/categoryApi"
import { getAllFactories, getFactoryById } from "@/apis/factoryApi"
import { ArrowLeft, MapPin } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const EditPuesto = () => {
  const { factoryId: initialFactoryId, puestoId } = useParams()
  const navigate = useNavigate()

  const [puesto, setPuesto] = useState({
    name: "",
    description: "",
    factoryId: "",
  })

  const [categories, setCategories] = useState([])
  const [factories, setFactories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadPuesto = async () => {
      try {
        const [puestoData, categoriesData] = await Promise.all([
          getPuestoById(puestoId),
          getAllCategories(),
        ])

        const factoryId = puestoData.factoryId?._id || puestoData.factoryId
        const factoryData = await getFactoryById(factoryId)
        const categoryId =
          factoryData.categoryId?._id || factoryData.categoryId || ""

        const factoriesData = await getAllFactories(categoryId)

        setCategories(categoriesData || [])
        setFactories(factoriesData || [])
        setSelectedCategory(categoryId)

        setPuesto({
          name: puestoData.name || "",
          description: puestoData.description || "",
          factoryId,
        })
      } catch (error) {
        console.error("Error al cargar el puesto:", error)

        toast({
          title: "Error",
          description: "No se pudo cargar el puesto",
          variant: "destructive",
        })

        navigate(initialFactoryId ? `/puestos/${initialFactoryId}` : "/puestos")
      } finally {
        setLoading(false)
      }
    }

    loadPuesto()
  }, [initialFactoryId, navigate, puestoId])

  const handleChange = (event) => {
    const { name, value } = event.target

    setPuesto((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId)
    setPuesto((previous) => ({
      ...previous,
      factoryId: "",
    }))

    try {
      const factoriesData = await getAllFactories(categoryId)
      setFactories(factoriesData || [])
    } catch (error) {
      console.error("Error al cargar las fábricas:", error)

      toast({
        title: "Error",
        description: "No se pudieron cargar las fábricas",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!puesto.name.trim() || !selectedCategory || !puesto.factoryId) {
      toast({
        title: "Error",
        description: "Indica el nombre, la categoría y la fábrica",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      await updatePuesto(puestoId, puesto)

      toast({
        title: "Puesto actualizado",
        description: "Los cambios se han guardado correctamente",
        variant: "success",
      })

      navigate(initialFactoryId ? `/puestos/${puesto.factoryId}` : "/puestos")
    } catch (error) {
      console.error("Error al actualizar el puesto:", error)

      toast({
        title: "Error",
        description: "No se pudo actualizar el puesto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando puesto...
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-zinc-900">
      <Card className="w-full max-w-md bg-white shadow-lg dark:bg-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <MapPin className="w-6 h-6" />
            Editar puesto
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
              <label className="text-sm font-medium">Categoría</label>

              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fábrica / UAP</label>

              <Select
                value={puesto.factoryId}
                disabled={!selectedCategory}
                onValueChange={(value) =>
                  handleChange({
                    target: {
                      name: "factoryId",
                      value,
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar fábrica" />
                </SelectTrigger>

                <SelectContent>
                  {factories.map((factory) => (
                    <SelectItem key={factory._id} value={factory._id}>
                      {factory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              onClick={() => navigate(initialFactoryId ? `/puestos/${initialFactoryId}` : "/puestos")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default EditPuesto