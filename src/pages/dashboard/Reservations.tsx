import React, { useState, useEffect } from "react";
import { Calendar, Clock, Plus, Eye, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
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
  espace_nom: string;
  espace_type: string;
  date_debut: string;
  date_fin: string;
  statut: string;
  montant_total: number;
  participants: number;
  notes?: string;
}

const statusColors: Record<string, string> = {
  en_attente: "warning",
  confirmee: "success",
  en_cours: "info",
  terminee: "secondary",
  annulee: "error",
};

const statusLabels: Record<string, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

const Reservations = () => {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getReservations();
      if (response.success) {
        setReservations(response.data || []);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des réservations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!cancelId || cancelling) return;

    try {
      setCancelling(true);
      const response = await apiClient.cancelReservation(cancelId);

      if (response.success) {
        toast.success("Réservation annulée");
        await loadReservations();
        setCancelId(null);
      } else {
        toast.error(response.message || "Erreur lors de l'annulation");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'annulation");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (reservation: Reservation) => {
    return ["en_attente", "confirmee"].includes(reservation.statut);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mes Réservations</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Réservation
        </Button>
      </div>

      {reservations.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Aucune réservation"
          description="Vous n'avez pas encore de réservation"
          action={{
            label: "Créer une réservation",
            onClick: () => setShowForm(true),
          }}
        />
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <Card key={reservation.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold">
                      {reservation.espace_nom}
                    </h3>
                    <Badge variant={statusColors[reservation.statut] as any}>
                      {statusLabels[reservation.statut]}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Du{" "}
                        {format(
                          new Date(reservation.date_debut),
                          "dd MMM yyyy à HH:mm",
                          { locale: fr }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        Au{" "}
                        {format(
                          new Date(reservation.date_fin),
                          "dd MMM yyyy à HH:mm",
                          { locale: fr }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        Montant: {reservation.montant_total.toLocaleString()} DA
                      </span>
                    </div>
                    {reservation.participants > 1 && (
                      <div className="text-sm">
                        {reservation.participants} participants
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link to={`/app/reservations/${reservation.id}`}>
                    <Button variant="secondary" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>

                  {canCancel(reservation) && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCancelId(reservation.id)}
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

      <ReservationForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      />

      <Modal
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        title="Annuler la réservation"
      >
        <div className="space-y-4">
          <p>Êtes-vous sûr de vouloir annuler cette réservation ?</p>
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
