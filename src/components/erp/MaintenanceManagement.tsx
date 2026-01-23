import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PenTool as Tool,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  User,
  Building,
  Download,
  MessageSquare,
  Wrench,
  FileText,
  RefreshCw,
  DollarSign,
  Camera,
  Clipboard,
  Share2,
  HelpCircle,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useERPStore } from "../../store/erpStore";
import { formatDate, formatCurrency } from "../../utils/formatters";
import { MaintenanceRequest, Space, Staff } from "../../types/erp";
import toast from "react-hot-toast";

const MaintenanceManagement = () => {
  const {
    maintenanceRequests,
    addMaintenanceRequest,
    updateMaintenanceRequest,
    deleteMaintenanceRequest,
    getMaintenanceRequestById,
    spaces,
    getSpaceById,
    staff,
    getStaffMemberById,
    assignMaintenanceRequest,
    completeMaintenanceRequest,
  } = useERPStore();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState("requestDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    spaceId: "",
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
  });

  const [assignData, setAssignData] = useState({
    assignedTo: "",
    scheduledDate: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [completeData, setCompleteData] = useState({
    notes: "",
    actualCost: 0,
    completionDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => setLoading(false), 500);
  }, []);

  const filteredRequests = maintenanceRequests
    .filter((request) => {
      const space = getSpaceById(request.spaceId);
      const spaceName = space ? space.name : "";

      const matchesSearch =
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || request.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "requestDate":
          comparison =
            new Date(a.requestDate).getTime() -
            new Date(b.requestDate).getTime();
          break;
        case "priority":
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "space":
          const spaceA = getSpaceById(a.spaceId);
          const spaceB = getSpaceById(b.spaceId);
          comparison = (spaceA?.name || "").localeCompare(spaceB?.name || "");
          break;
        case "status":
          const statusOrder = {
            pending: 0,
            in_progress: 1,
            completed: 2,
            cancelled: 3,
          };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "in_progress":
        return "En cours";
      case "completed":
        return "Terminé";
      case "cancelled":
        return "Annulé";
      default:
        return status;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "low":
        return "default";
      case "medium":
        return "info";
      case "high":
        return "warning";
      case "critical":
        return "error";
      default:
        return "default";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "low":
        return "Basse";
      case "medium":
        return "Moyenne";
      case "high":
        return "Haute";
      case "critical":
        return "Critique";
      default:
        return priority;
    }
  };

  const handleCreateRequest = () => {
    const newRequest: MaintenanceRequest = {
      id: `maint-${Date.now()}`,
      spaceId: formData.spaceId,
      requestedBy: "current-user-id", // Dans une vraie application, ce serait l'ID de l'utilisateur connecté
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: "pending",
      requestDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    addMaintenanceRequest(newRequest);
    resetForm();
    setShowRequestModal(false);
    toast.success("Demande de maintenance créée avec succès");
  };

  const handleAssignRequest = () => {
    if (!selectedRequest) return;

    const result = assignMaintenanceRequest(
      selectedRequest.id,
      assignData.assignedTo,
    );

    if (result.success) {
      updateMaintenanceRequest(selectedRequest.id, {
        scheduledDate: new Date(assignData.scheduledDate),
        notes: assignData.notes
          ? `${selectedRequest.notes || ""}\n${assignData.notes}`
          : selectedRequest.notes,
      });

      toast.success("Demande assignée avec succès");
      setShowAssignModal(false);
      setAssignData({
        assignedTo: "",
        scheduledDate: new Date().toISOString().split("T")[0],
        notes: "",
      });
    } else {
      toast.error(result.error || "Erreur lors de l'assignation");
    }
  };

  const handleCompleteRequest = () => {
    if (!selectedRequest) return;

    // Compléter la demande de maintenance
    completeMaintenanceRequest(selectedRequest.id);

    toast.success("Demande marquée comme terminée");
    setShowCompleteModal(false);
    setCompleteData({
      notes: "",
      actualCost: 0,
      completionDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleDeleteRequest = (requestId: string) => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette demande de maintenance ?",
      )
    ) {
      deleteMaintenanceRequest(requestId);
      toast.success("Demande supprimée avec succès");
    }
  };

  const resetForm = () => {
    setFormData({
      spaceId: "",
      title: "",
      description: "",
      priority: "medium",
    });
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const exportRequests = () => {
    const requestsData = filteredRequests.map((request) => {
      const space = getSpaceById(request.spaceId);
      const assignedTo = request.assignedTo
        ? getStaffMemberById(request.assignedTo)
        : null;

      return {
        id: request.id,
        title: request.title,
        space: space?.name || "Espace inconnu",
        priority: getPriorityLabel(request.priority),
        status: getStatusLabel(request.status),
        requestDate: formatDate(request.requestDate),
        scheduledDate: request.scheduledDate
          ? formatDate(request.scheduledDate)
          : "Non planifié",
        completionDate: request.completionDate
          ? formatDate(request.completionDate)
          : "Non terminé",
        assignedTo: assignedTo
          ? `${assignedTo.firstName} ${assignedTo.lastName}`
          : "Non assigné",
        estimatedCost: request.estimatedCost
          ? formatCurrency(request.estimatedCost)
          : "N/A",
        actualCost: request.actualCost
          ? formatCurrency(request.actualCost)
          : "N/A",
        description: request.description,
        notes: request.notes || "",
      };
    });

    const dataStr = JSON.stringify(requestsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `coffice-maintenance-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    toast.success("Demandes exportées avec succès");
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
            Gestion de la Maintenance
          </h1>
          <p className="text-gray-600">
            Gérez les demandes de maintenance de vos espaces
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportRequests}>
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowRequestModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle demande
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
              <Tool className="w-6 h-6 text-accent" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Demandes</p>
              <p className="text-2xl font-bold text-primary">
                {maintenanceRequests.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-primary">
                {
                  maintenanceRequests.filter((r) => r.status === "pending")
                    .length
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold text-primary">
                {
                  maintenanceRequests.filter((r) => r.status === "in_progress")
                    .length
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Terminées</p>
              <p className="text-2xl font-bold text-primary">
                {
                  maintenanceRequests.filter((r) => r.status === "completed")
                    .length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Rechercher une demande..."
            icon={<Search className="w-5 h-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
            <option value="cancelled">Annulées</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
          >
            <option value="all">Toutes les priorités</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="critical">Critique</option>
          </select>

          <Button variant="outline">
            <Filter className="w-5 h-5 mr-2" />
            Plus de filtres
          </Button>
        </div>
      </Card>

      {/* Maintenance Requests Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("title")}
                >
                  <div className="flex items-center">
                    Demande
                    {sortBy === "title" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("space")}
                >
                  <div className="flex items-center">
                    Espace
                    {sortBy === "space" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("priority")}
                >
                  <div className="flex items-center">
                    Priorité
                    {sortBy === "priority" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center">
                    Statut
                    {sortBy === "status" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("requestDate")}
                >
                  <div className="flex items-center">
                    Date
                    {sortBy === "requestDate" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Assigné à
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRequests.map((request, index) => {
                const space = getSpaceById(request.spaceId);
                const assignedTo = request.assignedTo
                  ? getStaffMemberById(request.assignedTo)
                  : null;

                return (
                  <motion.tr
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Tool className="w-5 h-5 text-accent" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {request.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {request.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {space?.name || "Espace inconnu"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {space?.location || ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getPriorityVariant(request.priority)}>
                        {getPriorityLabel(request.priority)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(request.requestDate)}
                      </div>
                      {request.scheduledDate && (
                        <div className="text-xs text-gray-500">
                          Planifié: {formatDate(request.scheduledDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignedTo ? (
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-xs">
                              {assignedTo.firstName.charAt(0)}
                              {assignedTo.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3 text-sm text-gray-900">
                            {assignedTo.firstName} {assignedTo.lastName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Non assigné
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRequestModal(true);
                            setFormData({
                              spaceId: request.spaceId,
                              title: request.title,
                              description: request.description,
                              priority: request.priority,
                            });
                            setIsEditing(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {request.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowAssignModal(true);
                            }}
                          >
                            <User className="w-4 h-4" />
                          </Button>
                        )}

                        {request.status === "in_progress" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowCompleteModal(true);
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}

                        {(request.status === "pending" ||
                          request.status === "in_progress") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Affichage de {(currentPage - 1) * itemsPerPage + 1} à{" "}
              {Math.min(currentPage * itemsPerPage, filteredRequests.length)}{" "}
              sur {filteredRequests.length} demandes
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Maintenance Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => {
          setShowRequestModal(false);
          resetForm();
          setIsEditing(false);
        }}
        title={
          isEditing
            ? "Détails de la demande"
            : "Nouvelle demande de maintenance"
        }
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Espace concerné
            </label>
            <select
              value={formData.spaceId}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, spaceId: e.target.value }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              disabled={isEditing}
            >
              <option value="">Sélectionner un espace</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Titre du problème"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Ex: Climatisation défectueuse"
            disabled={isEditing}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description détaillée
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none"
              placeholder="Décrivez le problème en détail..."
              disabled={isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  priority: e.target.value as any,
                }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              disabled={isEditing}
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="critical">Critique</option>
            </select>
          </div>

          {isEditing && selectedRequest && (
            <>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-primary mb-3">
                  Informations supplémentaires
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Statut</p>
                    <Badge variant={getStatusVariant(selectedRequest.status)}>
                      {getStatusLabel(selectedRequest.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de demande</p>
                    <p className="font-medium">
                      {formatDate(selectedRequest.requestDate)}
                    </p>
                  </div>
                  {selectedRequest.assignedTo && (
                    <div>
                      <p className="text-sm text-gray-600">Assigné à</p>
                      <p className="font-medium">
                        {(() => {
                          const staff = getStaffMemberById(
                            selectedRequest.assignedTo!,
                          );
                          return staff
                            ? `${staff.firstName} ${staff.lastName}`
                            : "Inconnu";
                        })()}
                      </p>
                    </div>
                  )}
                  {selectedRequest.scheduledDate && (
                    <div>
                      <p className="text-sm text-gray-600">Date planifiée</p>
                      <p className="font-medium">
                        {formatDate(selectedRequest.scheduledDate)}
                      </p>
                    </div>
                  )}
                  {selectedRequest.completionDate && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Date de complétion
                      </p>
                      <p className="font-medium">
                        {formatDate(selectedRequest.completionDate)}
                      </p>
                    </div>
                  )}
                  {selectedRequest.estimatedCost !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Coût estimé</p>
                      <p className="font-medium">
                        {formatCurrency(selectedRequest.estimatedCost)}
                      </p>
                    </div>
                  )}
                  {selectedRequest.actualCost !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Coût réel</p>
                      <p className="font-medium">
                        {formatCurrency(selectedRequest.actualCost)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {selectedRequest.notes.split("\n").map((line, i) => (
                      <p key={`note-line-${i}`}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {selectedRequest.status === "pending" && (
                  <Button
                    onClick={() => {
                      setShowRequestModal(false);
                      setShowAssignModal(true);
                    }}
                    className="flex-1"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Assigner
                  </Button>
                )}

                {selectedRequest.status === "in_progress" && (
                  <Button
                    onClick={() => {
                      setShowRequestModal(false);
                      setShowCompleteModal(true);
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marquer comme terminé
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1"
                >
                  Fermer
                </Button>
              </div>
            </>
          )}

          {!isEditing && (
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowRequestModal(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCreateRequest}
                className="flex-1"
                disabled={
                  !formData.spaceId || !formData.title || !formData.description
                }
              >
                Créer la demande
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Assign Request Modal */}
      {selectedRequest && (
        <Modal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setAssignData({
              assignedTo: "",
              scheduledDate: new Date().toISOString().split("T")[0],
              notes: "",
            });
          }}
          title="Assigner la demande de maintenance"
          size="md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-primary mb-2">
                {selectedRequest.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {(() => {
                  const space = getSpaceById(selectedRequest.spaceId);
                  return space ? space.name : "Espace inconnu";
                })()}
              </p>
              <Badge variant={getPriorityVariant(selectedRequest.priority)}>
                {getPriorityLabel(selectedRequest.priority)}
              </Badge>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigner à
              </label>
              <select
                value={assignData.assignedTo}
                onChange={(e) =>
                  setAssignData((prev) => ({
                    ...prev,
                    assignedTo: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                <option value="">Sélectionner un technicien</option>
                {staff
                  .filter((s) => s.department === "maintenance")
                  .map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.firstName} {staff.lastName} - {staff.position}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date planifiée
              </label>
              <input
                type="date"
                value={assignData.scheduledDate}
                onChange={(e) =>
                  setAssignData((prev) => ({
                    ...prev,
                    scheduledDate: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={assignData.notes}
                onChange={(e) =>
                  setAssignData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none"
                placeholder="Instructions ou informations supplémentaires..."
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAssignModal(false);
                  setAssignData({
                    assignedTo: "",
                    scheduledDate: new Date().toISOString().split("T")[0],
                    notes: "",
                  });
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleAssignRequest}
                className="flex-1"
                disabled={!assignData.assignedTo || !assignData.scheduledDate}
              >
                Confirmer l'assignation
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Complete Request Modal */}
      {selectedRequest && (
        <Modal
          isOpen={showCompleteModal}
          onClose={() => {
            setShowCompleteModal(false);
            setCompleteData({
              notes: "",
              actualCost: 0,
              completionDate: new Date().toISOString().split("T")[0],
            });
          }}
          title="Terminer la demande de maintenance"
          size="md"
        >
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-primary mb-2">
                {selectedRequest.title}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {(() => {
                  const space = getSpaceById(selectedRequest.spaceId);
                  return space ? space.name : "Espace inconnu";
                })()}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant={getPriorityVariant(selectedRequest.priority)}>
                  {getPriorityLabel(selectedRequest.priority)}
                </Badge>
                <Badge variant="info">
                  {(() => {
                    const staff = getStaffMemberById(
                      selectedRequest.assignedTo!,
                    );
                    return staff
                      ? `Assigné à ${staff.firstName}`
                      : "Non assigné";
                  })()}
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de complétion
              </label>
              <input
                type="date"
                value={completeData.completionDate}
                onChange={(e) =>
                  setCompleteData((prev) => ({
                    ...prev,
                    completionDate: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <Input
              label="Coût réel (DA)"
              type="number"
              min="0"
              value={completeData.actualCost}
              onChange={(e) =>
                setCompleteData((prev) => ({
                  ...prev,
                  actualCost: parseFloat(e.target.value) || 0,
                }))
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes de résolution
              </label>
              <textarea
                value={completeData.notes}
                onChange={(e) =>
                  setCompleteData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none"
                placeholder="Décrivez les travaux effectués..."
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompleteData({
                    notes: "",
                    actualCost: 0,
                    completionDate: new Date().toISOString().split("T")[0],
                  });
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                onClick={handleCompleteRequest}
                className="flex-1"
                disabled={!completeData.notes}
              >
                Marquer comme terminé
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Maintenance Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-display font-bold text-primary mb-6">
            Calendrier de Maintenance
          </h3>

          <div className="bg-gray-50 h-64 rounded-lg flex items-center justify-center">
            <Calendar className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500 ml-2">
              Calendrier de maintenance (simulé)
            </p>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-primary mb-4">
              Maintenance planifiée
            </h4>
            <div className="space-y-4">
              {maintenanceRequests
                .filter((r) => r.status === "in_progress" && r.scheduledDate)
                .slice(0, 3)
                .map((request, index) => {
                  const space = getSpaceById(request.spaceId);
                  const assignedTo = request.assignedTo
                    ? getStaffMemberById(request.assignedTo)
                    : null;

                  return (
                    <div
                      key={`pending-request-${request.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Tool className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-primary">
                            {request.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {space?.name || "Espace inconnu"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatDate(request.scheduledDate!)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {assignedTo
                            ? `${assignedTo.firstName} ${assignedTo.lastName}`
                            : "Non assigné"}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Maintenance Guides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-display font-bold text-primary mb-6">
            Guides de Maintenance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                  <Clipboard className="w-5 h-5 text-accent" />
                </div>
                <h4 className="font-medium text-primary ml-3">
                  Procédures Standard
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Consultez nos procédures standard pour la maintenance préventive
                et corrective des équipements.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                Consulter
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center">
                  <Camera className="w-5 h-5 text-teal" />
                </div>
                <h4 className="font-medium text-primary ml-3">
                  Tutoriels Vidéo
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Accédez à notre bibliothèque de tutoriels vidéo pour les
                réparations courantes.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Voir les vidéos
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-warm/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-warm" />
                </div>
                <h4 className="font-medium text-primary ml-3">
                  Support Technique
                </h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Contactez notre équipe de support technique pour une assistance
                en temps réel.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contacter
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Maintenance Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-display font-bold text-primary mb-6">
            Statistiques de Maintenance
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-primary mb-4">
                Répartition par type de problème
              </h4>
              <div className="bg-gray-50 h-48 rounded-lg flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-8 border-gray-300 border-t-primary"></div>
                <p className="text-gray-500 ml-2">Graphique (simulé)</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-primary mb-4">
                Temps moyen de résolution
              </h4>
              <div className="bg-gray-50 h-48 rounded-lg flex items-center justify-center">
                <div className="w-16 h-12 border-l-4 border-b-4 border-gray-300 rounded-bl"></div>
                <p className="text-gray-500 ml-2">Graphique (simulé)</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-primary mb-4">
              Coûts de maintenance par espace
            </h4>
            <div className="space-y-3">
              {spaces.slice(0, 5).map((space, index) => (
                <div
                  key={`space-cost-${space.id}`}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">{space.name}</span>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-primary w-20 text-right">
                      {formatCurrency(
                        Math.floor(Math.random() * 50000) + 10000,
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Preventive Maintenance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="p-6 bg-gradient-to-r from-accent/5 to-teal/5 border-accent/20">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-primary mb-2">
                Programme de Maintenance Préventive
              </h3>
              <p className="text-gray-600 mb-4">
                Mettez en place un programme de maintenance préventive pour
                réduire les pannes et prolonger la durée de vie de vos
                équipements. Notre système peut générer automatiquement des
                tâches de maintenance basées sur les recommandations des
                fabricants.
              </p>
              <div className="flex space-x-3">
                <Button>Configurer un programme</Button>
                <Button variant="outline">En savoir plus</Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default MaintenanceManagement;
