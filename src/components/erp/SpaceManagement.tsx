import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Users,
  DollarSign,
  Settings,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search,
  Calendar,
  PenTool as Tool,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  Download,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useERPStore } from "../../store/erpStore";
import { formatCurrency } from "../../utils/formatters";
import { Space, MaintenanceRequest } from "../../types/erp";

const SpaceManagement = () => {
  const {
    spaces,
    addSpace,
    updateSpace,
    deleteSpace,
    getSpaceById,
    maintenanceRequests,
    addMaintenanceRequest,
  } = useERPStore();

  const [loading, setLoading] = useState(true);
  const [showSpaceModal, setShowSpaceModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [formData, setFormData] = useState({
    name: "",
    type: "desk",
    capacity: 1,
    hourlyRate: 0,
    dailyRate: 0,
    monthlyRate: 0,
    description: "",
    amenities: [] as string[],
    location: "",
    floor: 1,
    area: 0,
    images: [] as string[],
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
  });

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => setLoading(false), 500);
  }, []);

  const spaceTypes = {
    desk: "Poste de travail",
    meeting_room: "Salle de réunion",
    office: "Bureau fermé",
    event_space: "Espace événementiel",
  };

  const amenitiesList = [
    "WiFi",
    "Électricité",
    "Climatisation",
    "Café",
    "Projecteur",
    "Tableau blanc",
    "Système audio",
    "Isolation acoustique",
    "Micros",
    "Table de mixage",
    "Éclairage",
    "Imprimante",
    "Écran TV",
    "Visioconférence",
    "Cuisine",
    "Casiers",
  ];

  const handleCreateSpace = () => {
    const newSpace: Space = {
      id: `space-${Date.now()}`,
      name: formData.name,
      type: formData.type as any,
      capacity: formData.capacity,
      pricePerHour: formData.hourlyRate,
      pricePerDay: formData.dailyRate,
      hourlyRate: formData.hourlyRate,
      dailyRate: formData.dailyRate,
      monthlyRate: formData.monthlyRate,
      available: true,
      status: "available",
      description: formData.description,
      amenities: formData.amenities,
      location: formData.location,
      floor: formData.floor,
      area: formData.area,
      images: formData.images,
      maintenanceStatus: "good",
    };

    addSpace(newSpace);
    resetForm();
    setShowSpaceModal(false);
  };

  const handleUpdateSpace = () => {
    if (!selectedSpace) return;

    updateSpace(selectedSpace.id, {
      name: formData.name,
      type: formData.type as any,
      capacity: formData.capacity,
      hourlyRate: formData.hourlyRate,
      dailyRate: formData.dailyRate,
      monthlyRate: formData.monthlyRate,
      description: formData.description,
      amenities: formData.amenities,
      location: formData.location,
      floor: formData.floor,
      area: formData.area,
      images: formData.images,
    });

    resetForm();
    setShowSpaceModal(false);
    setIsEditing(false);
    setSelectedSpace(null);
  };

  const handleDeleteSpace = (spaceId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet espace ?")) {
      deleteSpace(spaceId);
    }
  };

  const handleToggleAvailability = (
    spaceId: string,
    currentStatus: boolean,
  ) => {
    updateSpace(spaceId, { available: !currentStatus });
  };

  const openEditModal = (space: Space) => {
    setSelectedSpace(space);
    setFormData({
      name: space.name,
      type: space.type,
      capacity: space.capacity,
      hourlyRate: space.hourlyRate,
      dailyRate: space.dailyRate,
      monthlyRate: space.monthlyRate,
      description: space.description,
      amenities: space.amenities,
      location: space.location,
      floor: space.floor,
      area: space.area,
      images: space.images,
    });
    setIsEditing(true);
    setShowSpaceModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "desk",
      capacity: 1,
      hourlyRate: 0,
      dailyRate: 0,
      monthlyRate: 0,
      description: "",
      amenities: [],
      location: "",
      floor: 1,
      area: 0,
      images: [],
    });
    setSelectedSpace(null);
    setIsEditing(false);
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleCreateMaintenanceRequest = () => {
    if (!selectedSpace) return;

    const newRequest: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      spaceId: selectedSpace.id,
      requestedBy: "current-user-id", // Dans une vraie application, ce serait l'ID de l'utilisateur connecté
      title: maintenanceForm.title,
      description: maintenanceForm.description,
      priority: maintenanceForm.priority,
      status: "pending",
      requestDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    addMaintenanceRequest(newRequest);

    // Mettre à jour le statut de l'espace
    updateSpace(selectedSpace.id, { maintenanceStatus: "under_maintenance" });

    setMaintenanceForm({
      title: "",
      description: "",
      priority: "medium",
    });

    setShowMaintenanceModal(false);
  };

  const getMaintenanceStatusVariant = (status: string) => {
    switch (status) {
      case "operational":
        return "success";
      case "maintenance":
        return "warning";
      case "out_of_order":
        return "error";
      default:
        return "default";
    }
  };

  const getMaintenanceStatusLabel = (status: string) => {
    switch (status) {
      case "operational":
        return "Opérationnel";
      case "maintenance":
        return "En maintenance";
      case "out_of_order":
        return "Hors service";
      default:
        return status;
    }
  };

  // Filtrage et tri des espaces
  const filteredSpaces = spaces
    .filter((space) => {
      const matchesSearch =
        space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || space.type === typeFilter;
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && space.available) ||
        (availabilityFilter === "unavailable" && !space.available);

      return matchesSearch && matchesType && matchesAvailability;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "capacity":
          comparison = a.capacity - b.capacity;
          break;
        case "hourlyRate":
          comparison = a.hourlyRate - b.hourlyRate;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportSpaces = () => {
    const spacesData = spaces.map((space) => ({
      id: space.id,
      name: space.name,
      type: spaceTypes[space.type as keyof typeof spaceTypes],
      capacity: space.capacity,
      hourlyRate: space.hourlyRate,
      dailyRate: space.dailyRate,
      monthlyRate: space.monthlyRate,
      available: space.available ? "Oui" : "Non",
      location: space.location,
      floor: space.floor,
      area: space.area,
      amenities: space.amenities.join(", "),
      maintenanceStatus: getMaintenanceStatusLabel(space.maintenanceStatus),
    }));

    const dataStr = JSON.stringify(spacesData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `coffice-spaces-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary">
            Gestion des Espaces
          </h1>
          <p className="text-gray-600">
            Gérez tous les espaces de votre coworking
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportSpaces}>
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowSpaceModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvel espace
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Espaces</p>
              <p className="text-2xl font-bold text-primary">{spaces.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Espaces Disponibles</p>
              <p className="text-2xl font-bold text-primary">
                {
                  spaces.filter(
                    (e) => e.available && e.maintenanceStatus === "good",
                  ).length
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-warm/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-warm" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Capacité Totale</p>
              <p className="text-2xl font-bold text-primary">
                {spaces.reduce((sum, e) => sum + e.capacity, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Tool className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En Maintenance</p>
              <p className="text-2xl font-bold text-primary">
                {spaces.filter((e) => e.maintenanceStatus !== "good").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Rechercher un espace..."
            icon={<Search className="w-5 h-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
          >
            <option value="all">Tous les types</option>
            {Object.entries(spaceTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
          >
            <option value="all">Toutes disponibilités</option>
            <option value="available">Disponibles</option>
            <option value="unavailable">Non disponibles</option>
          </select>

          <Button variant="outline">
            <Filter className="w-5 h-5 mr-2" />
            Plus de filtres
          </Button>
        </div>
      </Card>

      {/* Spaces Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Espace
                    {sortBy === "name" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("type")}
                >
                  <div className="flex items-center">
                    Type
                    {sortBy === "type" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("capacity")}
                >
                  <div className="flex items-center">
                    Capacité
                    {sortBy === "capacity" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("hourlyRate")}
                >
                  <div className="flex items-center">
                    Tarif
                    {sortBy === "hourlyRate" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSpaces.map((space, index) => (
                <motion.tr
                  key={space.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-accent" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {space.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {space.location}, Étage {space.floor}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {spaceTypes[space.type as keyof typeof spaceTypes]}
                    </div>
                    <div className="text-sm text-gray-500">{space.area} m²</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {space.capacity} personnes
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(space.hourlyRate)}/h
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(space.dailyRate)}/jour
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <Badge
                        variant={space.available ? "success" : "error"}
                        size="sm"
                      >
                        {space.available ? "Disponible" : "Non disponible"}
                      </Badge>

                      <Badge
                        variant={getMaintenanceStatusVariant(
                          space.maintenanceStatus,
                        )}
                        size="sm"
                      >
                        {getMaintenanceStatusLabel(space.maintenanceStatus)}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSpace(space);
                          setShowMaintenanceModal(true);
                        }}
                      >
                        <Tool className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleToggleAvailability(space.id, space.available)
                        }
                      >
                        {space.available ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(space)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSpace(space.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Space Form Modal */}
      <Modal
        isOpen={showSpaceModal}
        onClose={() => {
          setShowSpaceModal(false);
          resetForm();
        }}
        title={isEditing ? "Modifier l'espace" : "Nouvel espace"}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom de l'espace"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ex: Salle de Réunion Alpha"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'espace
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                {Object.entries(spaceTypes).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Description détaillée de l'espace"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Capacité (personnes)"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  capacity: parseInt(e.target.value) || 1,
                }))
              }
            />

            <Input
              label="Superficie (m²)"
              type="number"
              min="0"
              value={formData.area}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  area: parseInt(e.target.value) || 0,
                }))
              }
            />

            <Input
              label="Étage"
              type="number"
              min="0"
              value={formData.floor}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  floor: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Prix par heure (DA)"
              type="number"
              min="0"
              value={formData.hourlyRate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hourlyRate: parseInt(e.target.value) || 0,
                }))
              }
            />

            <Input
              label="Prix par jour (DA)"
              type="number"
              min="0"
              value={formData.dailyRate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dailyRate: parseInt(e.target.value) || 0,
                }))
              }
            />

            <Input
              label="Prix par mois (DA)"
              type="number"
              min="0"
              value={formData.monthlyRate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  monthlyRate: parseInt(e.target.value) || 0,
                }))
              }
            />
          </div>

          <Input
            label="Emplacement"
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="Ex: Aile Nord, Bâtiment Principal"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Équipements disponibles
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {amenitiesList.map((amenity) => (
                <label
                  key={amenity}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded border-gray-300 text-accent focus:ring-accent"
                  />
                  <span className="text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowSpaceModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={isEditing ? handleUpdateSpace : handleCreateSpace}
              className="flex-1"
              disabled={!formData.name || !formData.description}
            >
              {isEditing ? "Mettre à jour" : "Créer l'espace"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Maintenance Request Modal */}
      <Modal
        isOpen={showMaintenanceModal}
        onClose={() => {
          setShowMaintenanceModal(false);
          setMaintenanceForm({
            title: "",
            description: "",
            priority: "medium",
          });
        }}
        title="Signaler un problème de maintenance"
        size="md"
      >
        <div className="space-y-6">
          {selectedSpace && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-primary mb-2">
                {selectedSpace.name}
              </h3>
              <p className="text-sm text-gray-600">
                {selectedSpace.location}, Étage {selectedSpace.floor}
              </p>
              <Badge
                variant={getMaintenanceStatusVariant(
                  selectedSpace.maintenanceStatus,
                )}
                className="mt-2"
              >
                {getMaintenanceStatusLabel(selectedSpace.maintenanceStatus)}
              </Badge>
            </div>
          )}

          <Input
            label="Titre du problème"
            value={maintenanceForm.title}
            onChange={(e) =>
              setMaintenanceForm((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Ex: Climatisation défectueuse"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description détaillée
            </label>
            <textarea
              value={maintenanceForm.description}
              onChange={(e) =>
                setMaintenanceForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none"
              placeholder="Décrivez le problème en détail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <select
              value={maintenanceForm.priority}
              onChange={(e) =>
                setMaintenanceForm((prev) => ({
                  ...prev,
                  priority: e.target.value as any,
                }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowMaintenanceModal(false);
                setMaintenanceForm({
                  title: "",
                  description: "",
                  priority: "medium",
                });
              }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateMaintenanceRequest}
              className="flex-1"
              disabled={!maintenanceForm.title || !maintenanceForm.description}
            >
              Signaler le problème
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SpaceManagement;
