import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Eye,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiClient } from "../../lib/api-client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import ReservationForm from "../../components/dashboard/ReservationForm";
import { format } from "date-fns";
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

type BadgeVariant = "warning" | "success" | "info" | "secondary" | "error";

const statusColors: Record<string, BadgeVariant> = {
  en_attente: "warning",
  confirmee: "success",
  en_cours: "info",
  terminee: "secondary",
  annulee: "error",
};

const statusLabels: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmee",
  en_cours: "En cours",
  terminee: "Terminee",
  annulee: "Annulee",
};

const formatMontant = (value: number | string | null | undefined): string => {
  if (value == null) return "0";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return num.toLocaleString();
};

const formatDateSafe = (dateStr: string): string => {
  try {
    if (!dateStr) return "Date inconnue";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return format(date, "dd MMM yyyy 'a' HH:mm", { locale: fr });
  } catch {
    return dateStr || "Date inconnue";
  }
};

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getReservations();

      if (response.success) {
        let data = response.data;
        if (!Array.isArray(data)) {
          data = [];
        }
        setReservations(data);
      } else {
        const errMsg =
          response.error || response.message || "Erreur lors du chargement";
        setError(errMsg);
        setReservations([]);
      }
    } catch (err: any) {
      console.error("Erreur chargement reservations:", err);
      setError(err.message || "Erreur de connexion au serveur");
      setReservations([]);
    } finally {
      setLoading(false);
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
        toast.success("Reservation annulee");
        setCancelId(null);
        await loadReservations();
      } else {
        toast.error(
          response.error || response.message || "Erreur lors de l'annulation",
        );
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
    loadReservations();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mes Reservations</h1>
        </div>
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-4 max-w-md">{error}</p>
            <Button onClick={loadReservations}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reessayer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mes Reservations</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={loadReservations}
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Reservation
          </Button>
        </div>
      </div>

      {reservations.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aucune reservation"
          description="Vous n'avez pas encore de reservation"
          action={{
            label: "Creer une reservation",
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="text-lg font-semibold">
                      {reservation.espace_nom || "Espace"}
                    </h3>
                    <Badge
                      variant={statusColors[reservation.statut] || "secondary"}
                    >
                      {statusLabels[reservation.statut] || reservation.statut}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Du {formatDateSafe(reservation.date_debut)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>Au {formatDateSafe(reservation.date_fin)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        Montant: {formatMontant(reservation.montant_total)} DA
                      </span>
                    </div>
                    {reservation.participants > 1 && (
                      <div className="text-sm">
                        {reservation.participants} participants
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link to={`/app/reservations/${reservation.id}`}>
                    <Button variant="secondary" size="sm" title="Voir details">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>

                  {canCancel(reservation) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCancelId(reservation.id)}
                      title="Annuler"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ReservationForm isOpen={showForm} onClose={handleFormClose} />

      <Modal
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Annuler la reservation"
      >
        <div className="space-y-4">
          <p>Etes-vous sur de vouloir annuler cette reservation ?</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setCancelId(null)}>
              Non, garder
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelReservation}
              disabled={cancelling}
            >
              {cancelling ? "Annulation..." : "Oui, annuler"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reservations;
