import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Eye,
  XCircle,
  RefreshCw,
  AlertCircle,
  MapPin,
  Users,
  CreditCard,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "../../lib/api-client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import Modal from "../../components/ui/Modal";
import ReservationForm from "../../components/dashboard/ReservationForm";
import { format, isPast, isFuture, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

interface Reservation {
  id: string;
  user_id: string;
  espace_id: string;
  espace_nom?: string;
  espace_type?: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  montant_total: number | string;
  participants: number;
  notes?: string;
}

type FilterType = "all" | "upcoming" | "past" | "cancelled";

const statusConfig: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  en_attente: {
    label: "En attente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  confirmee: {
    label: "Confirmee",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  en_cours: {
    label: "En cours",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  terminee: {
    label: "Terminee",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
  annulee: {
    label: "Annulee",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
};

const formatMontant = (value: number | string | null | undefined): string => {
  if (value == null) return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString("fr-DZ");
};

const formatDateDisplay = (dateStr: string): string => {
  try {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return format(date, "EEE d MMM yyyy", { locale: fr });
  } catch {
    return dateStr || "-";
  }
};

const formatTimeDisplay = (dateStr: string): string => {
  try {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    return format(date, "HH:mm", { locale: fr });
  } catch {
    return "";
  }
};

const getTimeLabel = (dateDebut: string): string => {
  try {
    const date = new Date(dateDebut);
    if (isToday(date)) return "Aujourd'hui";
    if (isFuture(date)) {
      const days = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (days === 1) return "Demain";
      if (days <= 7) return `Dans ${days} jours`;
    }
    return "";
  } catch {
    return "";
  }
};

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const loadReservations = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await apiClient.getReservations();

      if (response.success) {
        let data = response.data;
        if (!Array.isArray(data)) data = [];
        setReservations(data);
      } else {
        setError(response.error || response.message || "Erreur lors du chargement");
        setReservations([]);
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
      setReservations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleCancelReservation = async () => {
    if (!cancelId || cancelling) return;

    try {
      setCancelling(true);
      const response = await apiClient.cancelReservation(cancelId);

      if (response.success) {
        toast.success("Reservation annulee avec succes");
        setCancelId(null);
        await loadReservations(true);
      } else {
        toast.error(response.error || response.message || "Erreur lors de l'annulation");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'annulation");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (reservation: Reservation): boolean => {
    return ["en_attente", "confirmee"].includes(reservation.statut);
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadReservations(true);
  };

  const filteredReservations = reservations.filter((r) => {
    if (filter === "all") return true;
    if (filter === "cancelled") return r.statut === "annulee";
    if (filter === "upcoming") {
      return (
        r.statut !== "annulee" &&
        r.statut !== "terminee" &&
        (isFuture(new Date(r.date_debut)) || isToday(new Date(r.date_debut)))
      );
    }
    if (filter === "past") {
      return r.statut === "terminee" || isPast(new Date(r.date_fin));
    }
    return true;
  });

  const stats = {
    total: reservations.length,
    upcoming: reservations.filter(
      (r) =>
        r.statut !== "annulee" &&
        r.statut !== "terminee" &&
        (isFuture(new Date(r.date_debut)) || isToday(new Date(r.date_debut)))
    ).length,
    completed: reservations.filter((r) => r.statut === "terminee").length,
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement des reservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Impossible de charger les reservations
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => loadReservations()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reessayer
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Reservations</h1>
          <p className="text-gray-500 mt-1">
            {stats.upcoming > 0
              ? `${stats.upcoming} reservation${stats.upcoming > 1 ? "s" : ""} a venir`
              : "Aucune reservation a venir"}
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Reservation
        </Button>
      </div>

      {reservations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: "all", label: "Toutes", count: stats.total },
            { key: "upcoming", label: "A venir", count: stats.upcoming },
            { key: "past", label: "Passees", count: stats.completed },
            {
              key: "cancelled",
              label: "Annulees",
              count: reservations.filter((r) => r.statut === "annulee").length,
            },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as FilterType)}
              className={`
                px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${
                  filter === item.key
                    ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }
              `}
            >
              <span className="block text-lg font-bold">{item.count}</span>
              <span className="block text-xs opacity-80">{item.label}</span>
            </button>
          ))}
        </div>
      )}

      {reservations.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => loadReservations(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Actualisation..." : "Actualiser"}
          </button>
        </div>
      )}

      {filteredReservations.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={
            filter === "all"
              ? "Aucune reservation"
              : `Aucune reservation ${
                  filter === "upcoming"
                    ? "a venir"
                    : filter === "past"
                    ? "passee"
                    : "annulee"
                }`
          }
          description={
            filter === "all"
              ? "Reservez un espace de travail pour commencer"
              : "Changez de filtre pour voir d'autres reservations"
          }
          action={
            filter === "all"
              ? {
                  label: "Reserver maintenant",
                  onClick: () => setShowForm(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredReservations.map((reservation, index) => {
              const status = statusConfig[reservation.statut] || statusConfig.en_attente;
              const timeLabel = getTimeLabel(reservation.date_debut);

              return (
                <motion.div
                  key={reservation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="flex flex-col lg:flex-row">
                      <div className="flex-1 p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {reservation.espace_nom || "Espace"}
                              </h3>
                              <span
                                className={`
                                  inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                                  ${status.bg} ${status.text}
                                `}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                {status.label}
                              </span>
                              {timeLabel && (
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                                  {timeLabel}
                                </span>
                              )}
                            </div>
                            {reservation.espace_type && (
                              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {reservation.espace_type}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDateDisplay(reservation.date_debut)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Horaire</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatTimeDisplay(reservation.date_debut)} -{" "}
                                {formatTimeDisplay(reservation.date_fin)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <CreditCard className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Montant</p>
                              <p className="text-sm font-bold text-gray-900">
                                {formatMontant(reservation.montant_total)} DA
                              </p>
                            </div>
                          </div>
                        </div>

                        {reservation.participants > 1 && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{reservation.participants} participants</span>
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col items-center justify-end gap-2 p-4 lg:p-6 bg-gray-50 lg:bg-transparent border-t lg:border-t-0 lg:border-l border-gray-100">
                        <Link to={`/app/reservations/${reservation.id}`} className="w-full lg:w-auto">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-full justify-center"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Details
                          </Button>
                        </Link>
                        {canCancel(reservation) && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setCancelId(reservation.id)}
                            className="w-full lg:w-auto justify-center"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <ReservationForm isOpen={showForm} onClose={handleFormClose} />

      <Modal
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Annuler la reservation"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                Confirmer l'annulation
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Cette action est irreversible. Vous devrez creer une nouvelle
                reservation si vous changez d'avis.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setCancelId(null)}
              disabled={cancelling}
            >
              Conserver
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelReservation}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Annulation...
                </>
              ) : (
                "Confirmer l'annulation"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reservations;
