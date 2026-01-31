import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  X,
  Check,
  Clock,
  MapPin,
  User,
  Trash2,
  Download,
  ArrowUpDown,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useERPStore } from "../../store/erpStore";
import { formatDate, formatTime, formatCurrency } from "../../utils/formatters";
import { Reservation, Space, Member } from "../../types/erp";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReservationManagement = () => {
  const {
    reservations,
    spaces,
    members,
    updateReservation,
    deleteReservation,
    getReservationById,
    getSpaceById,
    getMemberById,
    processReservation,
    cancelReservation,
    checkInReservation,
    checkOutReservation,
    addReservation,
  } = useERPStore();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [spaceFilter, setSpaceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [newReservation, setNewReservation] = useState({
    memberId: "",
    spaceId: "",
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // +2 heures par défaut
    notes: "",
    promoCode: "",
  });

  const [estimatedAmount, setEstimatedAmount] = useState(0);

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => setLoading(false), 500);
  }, []);

  useEffect(() => {
    // Calculer le montant estimé
    if (
      newReservation.spaceId &&
      newReservation.startDate &&
      newReservation.endDate
    ) {
      const space = getSpaceById(newReservation.spaceId);
      if (space) {
        const durationHours =
          (newReservation.endDate.getTime() -
            newReservation.startDate.getTime()) /
          (1000 * 60 * 60);
        let amount = durationHours * space.hourlyRate;

        // Appliquer les réductions pour durée
        if (durationHours >= 8) {
          amount = amount * 0.9; // 10% de réduction pour 8h+
        } else if (durationHours >= 4) {
          amount = amount * 0.95; // 5% de réduction pour 4h+
        }

        // Appliquer le code promo (simulation)
        if (newReservation.promoCode === "WELCOME10") {
          amount = amount - 1000;
        } else if (newReservation.promoCode === "SUMMER20") {
          amount = amount - 2000;
        }

        setEstimatedAmount(Math.max(0, Math.round(amount)));
      }
    }
  }, [newReservation, getSpaceById]);

  const filteredReservations = reservations
    .filter((reservation) => {
      const space = getSpaceById(reservation.spaceId);
      const member = getMemberById(reservation.userId);

      const spaceName = space ? space.name : "";
      const memberName = member ? `${member.firstName} ${member.lastName}` : "";

      const matchesSearch =
        spaceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memberName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || reservation.status === statusFilter;

      let matchesDate = true;
      if (dateFilter === "today") {
        const today = new Date().toDateString();
        matchesDate = new Date(reservation.startDate).toDateString() === today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = new Date(reservation.startDate) >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = new Date(reservation.startDate) >= monthAgo;
      }

      const matchesSpace =
        spaceFilter === "all" || reservation.spaceId === spaceFilter;

      return matchesSearch && matchesStatus && matchesDate && matchesSpace;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "startDate":
          comparison =
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case "space":
          const spaceA = getSpaceById(a.spaceId);
          const spaceB = getSpaceById(b.spaceId);
          comparison = (spaceA?.name || "").localeCompare(spaceB?.name || "");
          break;
        case "member":
          const memberA = getMemberById(a.userId);
          const memberB = getMemberById(b.userId);
          comparison = (memberA?.lastName || "").localeCompare(
            memberB?.lastName || "",
          );
          break;
        case "amount":
          comparison = a.totalAmount - b.totalAmount;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      case "completed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmée";
      case "pending":
        return "En attente";
      case "cancelled":
        return "Annulée";
      case "completed":
        return "Terminée";
      default:
        return status;
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "unpaid":
        return "warning";
      case "refunded":
        return "error";
      case "partial":
        return "info";
      default:
        return "default";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Payé";
      case "unpaid":
        return "Non payé";
      case "refunded":
        return "Remboursé";
      case "partial":
        return "Partiel";
      default:
        return status;
    }
  };

  const handleStatusChange = async (
    reservationId: string,
    newStatus: "confirmed" | "pending" | "cancelled" | "completed",
  ) => {
    await updateReservation(reservationId, { status: newStatus });
  };

  const handlePaymentStatusChange = async (
    reservationId: string,
    newStatus: "paid" | "unpaid" | "refunded" | "partial",
  ) => {
    await updateReservation(reservationId, { paymentStatus: newStatus });
  };

  const handleDeleteReservation = (reservationId: string) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")
    ) {
      deleteReservation(reservationId);
      setShowDetails(false);
    }
  };

  const handleCheckIn = (reservationId: string) => {
    const result = checkInReservation(reservationId);
    if (result.success) {
      alert("Check-in effectué avec succès");
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleCheckOut = (reservationId: string) => {
    const result = checkOutReservation(reservationId);
    if (result.success) {
      alert("Check-out effectué avec succès");
    } else {
      alert(`Erreur: ${result.error}`);
    }
  };

  const handleCancelReservation = (reservationId: string) => {
    const reason = prompt("Veuillez indiquer la raison de l'annulation:");
    if (reason) {
      cancelReservation(reservationId);
      alert("Réservation annulée avec succès");
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleCreateReservation = () => {
    if (!newReservation.memberId || !newReservation.spaceId) {
      alert("Veuillez sélectionner un membre et un espace");
      return;
    }

    // Créer la réservation
    const reservationId = `res-${Date.now()}`;
    const newRes = {
      id: reservationId,
      memberId: newReservation.memberId,
      userId: newReservation.memberId,
      spaceId: newReservation.spaceId,
      startDate: newReservation.startDate,
      endDate: newReservation.endDate,
      status: "confirmed" as const,
      totalAmount: 0,
      createdAt: new Date(),
    };

    addReservation(newRes);
    alert("Réservation créée avec succès");
    setShowCreateModal(false);
    setNewReservation({
      memberId: "",
      spaceId: "",
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      notes: "",
      promoCode: "",
    });
  };

  const exportReservations = () => {
    const reservationsData = filteredReservations.map((reservation) => {
      const space = getSpaceById(reservation.spaceId);
      const member = getMemberById(reservation.userId);

      return {
        id: reservation.id,
        space: space?.name || "Inconnu",
        member: member ? `${member.firstName} ${member.lastName}` : "Inconnu",
        startDate: formatDate(new Date(reservation.startDate)),
        startTime: formatTime(new Date(reservation.startDate)),
        endTime: formatTime(new Date(reservation.endDate)),
        duration: `${(new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / (1000 * 60 * 60)} heures`,
        status: getStatusLabel(reservation.status),
        paymentStatus: getPaymentStatusLabel(reservation.paymentStatus),
        amount: formatCurrency(reservation.totalAmount),
        notes: reservation.notes || "",
      };
    });

    const dataStr = JSON.stringify(reservationsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `coffice-reservations-${new Date().toISOString().split("T")[0]}.json`;
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
            Gestion des Réservations
          </h1>
          <p className="text-gray-600">
            Gérez toutes les réservations de votre coworking
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportReservations}>
            <Download className="w-5 h-5 mr-2" />
            Exporter
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle réservation
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Input
            placeholder="Rechercher..."
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
            <option value="confirmed">Confirmées</option>
            <option value="pending">En attente</option>
            <option value="completed">Terminées</option>
            <option value="cancelled">Annulées</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>

          <select
            value={spaceFilter}
            onChange={(e) => setSpaceFilter(e.target.value)}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
          >
            <option value="all">Tous les espaces</option>
            {spaces.map((space) => (
              <option key={space.id} value={space.id}>
                {space.name}
              </option>
            ))}
          </select>

          <Button variant="outline">
            <Filter className="w-5 h-5 mr-2" />
            Plus de filtres
          </Button>
        </div>
      </Card>

      {/* Reservations Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
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
                  onClick={() => toggleSort("member")}
                >
                  <div className="flex items-center">
                    Client
                    {sortBy === "member" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("startDate")}
                >
                  <div className="flex items-center">
                    Date & Heure
                    {sortBy === "startDate" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th
                  className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleSort("amount")}
                >
                  <div className="flex items-center">
                    Montant
                    {sortBy === "amount" && (
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedReservations.map((reservation, index) => {
                const space = getSpaceById(reservation.spaceId);
                const member = getMemberById(reservation.userId);

                return (
                  <motion.tr
                    key={reservation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-accent" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {space?.name || "Espace inconnu"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {space?.type || "Type inconnu"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {member
                              ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                              : "NA"}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {member
                              ? `${member.firstName} ${member.lastName}`
                              : "Membre inconnu"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member?.email || "Email inconnu"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(new Date(reservation.startDate))}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(new Date(reservation.startDate))} -{" "}
                        {formatTime(new Date(reservation.endDate))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <Badge variant={getStatusVariant(reservation.status)}>
                          {getStatusLabel(reservation.status)}
                        </Badge>
                        <Badge
                          variant={getPaymentStatusVariant(
                            reservation.paymentStatus,
                          )}
                          size="sm"
                        >
                          {getPaymentStatusLabel(reservation.paymentStatus)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {formatCurrency(reservation.totalAmount)}
                      {reservation.discount > 0 && (
                        <div className="text-xs text-green-600">
                          Réduction: {formatCurrency(reservation.discount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {reservation.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleStatusChange(reservation.id, "confirmed")
                            }
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}

                        {(reservation.status === "confirmed" ||
                          reservation.status === "pending") && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleCancelReservation(reservation.id)
                            }
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}

                        {reservation.status === "confirmed" &&
                          !reservation.checkInTime && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCheckIn(reservation.id)}
                            >
                              <Clock className="w-4 h-4" />
                            </Button>
                          )}

                        {reservation.status === "confirmed" &&
                          reservation.checkInTime &&
                          !reservation.checkOutTime && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCheckOut(reservation.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
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
              {Math.min(
                currentPage * itemsPerPage,
                filteredReservations.length,
              )}{" "}
              sur {filteredReservations.length} réservations
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

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <Modal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          title="Détails de la réservation"
          size="lg"
        >
          <div className="space-y-6">
            {/* Client Info */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-teal rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {(() => {
                    const member = getMemberById(selectedReservation.userId);
                    return member
                      ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                      : "NA";
                  })()}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-primary">
                  {(() => {
                    const member = getMemberById(selectedReservation.userId);
                    return member
                      ? `${member.firstName} ${member.lastName}`
                      : "Membre inconnu";
                  })()}
                </h4>
                <p className="text-sm text-gray-600">
                  {(() => {
                    const member = getMemberById(selectedReservation.userId);
                    return member ? member.email : "Email inconnu";
                  })()}
                </p>
                {(() => {
                  const member = getMemberById(selectedReservation.userId);
                  return (
                    member?.phone && (
                      <p className="text-sm text-gray-600">{member.phone}</p>
                    )
                  );
                })()}
              </div>
            </div>

            {/* Reservation Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Espace
                </label>
                <p className="text-primary font-semibold">
                  {(() => {
                    const space = getSpaceById(selectedReservation.spaceId);
                    return space ? space.name : "Espace inconnu";
                  })()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <div className="flex space-x-2">
                  <Badge variant={getStatusVariant(selectedReservation.status)}>
                    {getStatusLabel(selectedReservation.status)}
                  </Badge>
                  <Badge
                    variant={getPaymentStatusVariant(
                      selectedReservation.paymentStatus,
                    )}
                  >
                    {getPaymentStatusLabel(selectedReservation.paymentStatus)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <p className="text-primary">
                  {formatDate(new Date(selectedReservation.startDate))}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horaires
                </label>
                <p className="text-primary">
                  {formatTime(new Date(selectedReservation.startDate))} -{" "}
                  {formatTime(new Date(selectedReservation.endDate))}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée
                </label>
                <p className="text-primary">
                  {(
                    (new Date(selectedReservation.endDate).getTime() -
                      new Date(selectedReservation.startDate).getTime()) /
                    (1000 * 60 * 60)
                  ).toFixed(1)}{" "}
                  heures
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant total
                </label>
                <p className="text-accent font-bold text-lg">
                  {formatCurrency(selectedReservation.totalAmount)}
                </p>
                {selectedReservation.discount > 0 && (
                  <p className="text-sm text-green-600">
                    Réduction: {formatCurrency(selectedReservation.discount)}
                  </p>
                )}
              </div>
            </div>

            {selectedReservation.promoCode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code promo
                </label>
                <p className="text-primary">{selectedReservation.promoCode}</p>
              </div>
            )}

            {selectedReservation.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <p className="text-primary bg-gray-50 p-3 rounded-lg">
                  {selectedReservation.notes}
                </p>
              </div>
            )}

            {/* Check-in/Check-out Info */}
            {(selectedReservation.checkInTime ||
              selectedReservation.checkOutTime) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedReservation.checkInTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in
                    </label>
                    <p className="text-primary">
                      {formatDate(new Date(selectedReservation.checkInTime))}{" "}
                      {formatTime(new Date(selectedReservation.checkInTime))}
                    </p>
                  </div>
                )}
                {selectedReservation.checkOutTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out
                    </label>
                    <p className="text-primary">
                      {formatDate(new Date(selectedReservation.checkOutTime))}{" "}
                      {formatTime(new Date(selectedReservation.checkOutTime))}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {selectedReservation.status === "pending" && (
                <Button
                  onClick={() => {
                    handleStatusChange(selectedReservation.id, "confirmed");
                    setShowDetails(false);
                  }}
                  className="flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmer
                </Button>
              )}

              {selectedReservation.paymentStatus === "unpaid" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handlePaymentStatusChange(selectedReservation.id, "paid");
                    setShowDetails(false);
                  }}
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Marquer comme payé
                </Button>
              )}

              {(selectedReservation.status === "confirmed" ||
                selectedReservation.status === "pending") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleCancelReservation(selectedReservation.id);
                    setShowDetails(false);
                  }}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => handleDeleteReservation(selectedReservation.id)}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Reservation Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvelle Réservation"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Membre
              </label>
              <select
                value={newReservation.memberId}
                onChange={(e) =>
                  setNewReservation((prev) => ({
                    ...prev,
                    memberId: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                <option value="">Sélectionner un membre</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName} ({member.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Espace
              </label>
              <select
                value={newReservation.spaceId}
                onChange={(e) =>
                  setNewReservation((prev) => ({
                    ...prev,
                    spaceId: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              >
                <option value="">Sélectionner un espace</option>
                {spaces
                  .filter((space) => space.available)
                  .map((space) => (
                    <option key={space.id} value={space.id}>
                      {space.name} - {formatCurrency(space.hourlyRate)}/h
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de début
              </label>
              <DatePicker
                selected={newReservation.startDate}
                onChange={(date: Date | null) => {
                  setNewReservation((prev) => ({
                    ...prev,
                    startDate: date || new Date(),
                  }));
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="dd/MM/yyyy HH:mm"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de fin
              </label>
              <DatePicker
                selected={newReservation.endDate}
                onChange={(date: Date | null) => {
                  setNewReservation((prev) => ({
                    ...prev,
                    endDate: date || new Date(),
                  }));
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="dd/MM/yyyy HH:mm"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <Input
            label="Code promo (optionnel)"
            value={newReservation.promoCode}
            onChange={(e) =>
              setNewReservation((prev) => ({
                ...prev,
                promoCode: e.target.value,
              }))
            }
            placeholder="Ex: WELCOME10"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={newReservation.notes}
              onChange={(e) =>
                setNewReservation((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-accent focus:outline-none resize-none"
              placeholder="Informations supplémentaires..."
            />
          </div>

          {/* Price Estimation */}
          {estimatedAmount > 0 && (
            <Card className="p-4 bg-accent/5 border border-accent/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">Montant estimé</p>
                  {newReservation.promoCode && (
                    <p className="text-sm text-green-600">
                      Code promo appliqué
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">
                    {formatCurrency(estimatedAmount)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateReservation}
              className="flex-1"
              disabled={!newReservation.memberId || !newReservation.spaceId}
            >
              Créer la réservation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReservationManagement;
