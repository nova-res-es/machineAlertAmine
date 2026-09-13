"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllPuestos, deletePuesto } from "@/apis/puestoApi"
import { getAllFactories } from "@/apis/factoryApi"
import { getAllCategories } from "@/apis/categoryApi"
import {
  Building2,
  Edit,
  Factory,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

const ShowPuestos = () => {
  const navigate = useNavigate()

  const [puestos, setPuestos] = useState([])
  const [factories, setFactories] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedFactory, setSelectedFactory] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [puestosData, factoriesData, categoriesData] =
          await Promise.all([
            getAllPuestos(),
            getAllFactories(),
            getAllCategories(),
          ])

        setPuestos(puestosData || [])
        setFactories(factoriesData || [])
        setCategories(categoriesData || [])
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

    loadData()
  }, [])

  const handleDelete = async (puesto) => {
    const confirmacion = window.confirm(
      `¿Quieres eliminar el puesto "${puesto.name}"?`,
    )

    if (!confirmacion) return

    try {
      await deletePuesto(puesto._id)

      setPuestos((puestosActuales) =>
        puestosActuales.filter((item) => item._id !== puesto._id),
      )

      toast({
        title: "Puesto eliminado",
        description: "El puesto se ha eliminado correctamente",
        variant: "success",
      })
    } catch (error) {
      console.error("Error al eliminar el puesto:", error)

      toast({
        title: "Error",
        description: "No se pudo eliminar el puesto",
        variant: "destructive",
      })
    }
  }

  const puestosFiltrados = puestos.filter((puesto) => {
    const factoryId = puesto.factoryId?._id || puesto.factoryId
    const categoryId =
      puesto.factoryId?.categoryId?._id || puesto.factoryId?.categoryId

    const coincideFabrica =
      selectedFactory === "all" || factoryId === selectedFactory

    const coincideCategoria =
      selectedCategory === "all" || categoryId === selectedCategory

    return coincideFabrica && coincideCategoria
  })

  return (
    <div className="container p-4 mx-auto">
      <Card className="bg-white shadow-lg dark:bg-zinc-800">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <MapPin className="w-6 h-6" />
              Gestión de Puestos
            </CardTitle>

            <p className="mt-2 text-sm text-muted-foreground">
              Crea y gestiona los puestos de cada fábrica/UAP
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>

                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedFactory}
                onValueChange={setSelectedFactory}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por fábrica" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Todas las fábricas</SelectItem>

                  {factories.map((factory) => (
                    <SelectItem key={factory._id} value={factory._id}>
                      {factory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => navigate("/puestos/create")}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Puesto
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="py-12 text-center">Cargando puestos...</div>
          ) : puestosFiltrados.length === 0 ? (
            <div className="py-12 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />

              <h3 className="mb-2 text-xl font-semibold">
                No hay puestos disponibles
              </h3>

              <p className="text-muted-foreground">
                No hay puestos que coincidan con los filtros seleccionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {puestosFiltrados.map((puesto) => (
                <Card
                  key={puesto._id}
                  className="transition-shadow bg-gray-50 hover:shadow-md dark:bg-zinc-700"
                >
                  <CardContent className="p-4">
                    <h3 className="flex items-center gap-2 mb-2 text-lg font-semibold">
                      <MapPin className="w-5 h-5 text-primary" />
                      {puesto.name}
                    </h3>

                    <p className="mb-4 text-sm text-muted-foreground">
                      {puesto.description || "Sin descripción"}
                    </p>

                    <div className="mb-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-500" />
                        <span>
                          Fábrica: {puesto.factoryId?.name || "Sin fábrica"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Factory className="w-4 h-4 text-green-500" />
                        <span>
                          Categoría:{" "}
                          {puesto.factoryId?.categoryId?.name ||
                            "Sin categoría"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/puestos/edit/${puesto._id}`)
                        }
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>

                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(puesto)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default ShowPuestos