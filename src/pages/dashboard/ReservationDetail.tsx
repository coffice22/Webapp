import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  DollarSign,
  XCircle,
  ArrowLeft,
  Check,
  X,
  Tag,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { apiClient } from "../../lib/api-client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Modal from "../../components/ui/Modal";
import { formatDate, formatPrice } from "../../utils/formatters";
import { getReservationStatutColor, STATUS_LABELS } from "../../constants";
import toast from "react-hot-toast";
import { logger } from "../../utils/logger";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ReservationDetail {
  id: string;
  userId: string;
  espaceId: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  montantTotal: number;
  montantPaye: number;
  participants: number;
  notes?: string;
  codePromo?: string;
  modePaiement?: string;
  typeReservation: string;
  createdAt: string;
  user?: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
  espace?: {
    nom: string;
    type: string;
    capacite: number;
    tarifHoraire?: number;
    tarifJournalier?: number;
    tarifMensuel?: number;
  };
}

const ReservationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadReservation();
    }
  }, [id]);

  const loadReservation = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getReservation(id!);
<<<<<<< HEAD
      if (response.success && response.data) {
        setReservation(response.data as ReservationDetail);
=======
      console.log('🔍 Données reçues:', response.data);
      
      if (response.success && response.data) {
        // Mapper snake_case vers camelCase
        const rawData = response.data as any;
        const mappedData: ReservationDetail = {
          id: rawData.id,
          userId: rawData.user_id,
          espaceId: rawData.espace_id,
          dateDebut: rawData.date_debut,
          dateFin: rawData.date_fin,
          statut: rawData.statut,
          montantTotal: parseFloat(rawData.montant_total),
          montantPaye: parseFloat(rawData.montant_paye),
          participants: rawData.participants,
          notes: rawData.notes,
          codePromo: rawData.code_promo_id,
          modePaiement: rawData.mode_paiement,
          typeReservation: rawData.type_reservation,
          createdAt: rawData.created_at,
          user: rawData.user_nom ? {
            nom: rawData.user_nom,
            prenom: rawData.user_prenom,
            email: rawData.user_email,
            telephone: rawData.user_telephone,
          } : undefined,
          espace: rawData.espace_nom ? {
            nom: rawData.espace_nom,
            type: rawData.espace_type,
            capacite: rawData.capacite,
            tarifHoraire: parseFloat(rawData.prix_heure),
            tarifJournalier: parseFloat(rawData.prix_jour),
            tarifMensuel: undefined,
          } : undefined,
        };
        
        setReservation(mappedData);
>>>>>>> feature/improvements
      } else {
        toast.error("Réservation introuvable");
        navigate("/app/reservations");
      }
    } catch (error) {
      logger.error("Erreur chargement réservation:", error);
      toast.error("Erreur lors du chargement");
      navigate("/app/reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!id) return;

    try {
      const response = await apiClient.cancelReservation(id);
      if (response.success) {
        toast.success("Réservation annulée avec succès");
        navigate("/app/reservations");
      } else {
        toast.error(response.error || "Erreur lors de l'annulation");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'annulation");
    }
  };

  const canCancelReservation = () => {
    if (!reservation) return false;
    return ["en_attente", "confirmee"].includes(reservation.statut);
  };

  const calculateDuration = () => {
    if (!reservation) return "";
    const start = new Date(reservation.dateDebut);
    const end = new Date(reservation.dateFin);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? "s" : ""}`;
    }
    return `${diffHours} heure${diffHours > 1 ? "s" : ""}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Réservation introuvable</p>
        <Button onClick={() => navigate("/app/reservations")} className="mt-4">
          Retour aux réservations
        </Button>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/app/reservations")}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            Détails de la réservation
          </h1>
        </div>
        <Badge variant={getReservationStatutColor(reservation.statut)}>
          {STATUS_LABELS.RESERVATION[
            reservation.statut as keyof typeof STATUS_LABELS.RESERVATION
          ] || reservation.statut}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Informations sur l'espace
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nom de l'espace</p>
                <p className="font-semibold text-lg">
                  {reservation.espace?.nom || "N/A"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{reservation.espace?.type || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacité</p>
                  <p className="font-medium">
                    {reservation.espace?.capacite || "N/A"} personnes
                  </p>
                </div>
              </div>
              {reservation.participants && (
                <div>
                  <p className="text-sm text-gray-600">Nombre de participants</p>
                  <p className="font-medium">{reservation.participants}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Période de réservation
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Date de début</p>
                  <p className="font-medium">
<<<<<<< HEAD
                    {format(new Date(reservation.dateDebut), "dd MMMM yyyy", {
=======
                    {format(new Date(reservation.dateDebut.replace(' ', 'T')), "dd MMMM yyyy", {
>>>>>>> feature/improvements
                      locale: fr,
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
<<<<<<< HEAD
                    {format(new Date(reservation.dateDebut), "HH:mm")}
=======
                    {format(new Date(reservation.dateDebut.replace(' ', 'T')), "HH:mm")}
>>>>>>> feature/improvements
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date de fin</p>
                  <p className="font-medium">
<<<<<<< HEAD
                    {format(new Date(reservation.dateFin), "dd MMMM yyyy", {
=======
                    {format(new Date(reservation.dateFin.replace(' ', 'T')), "dd MMMM yyyy", {
>>>>>>> feature/improvements
                      locale: fr,
                    })}
                  </p>
                  <p className="text-sm text-gray-500">
<<<<<<< HEAD
                    {format(new Date(reservation.dateFin), "HH:mm")}
=======
                    {format(new Date(reservation.dateFin.replace(' ', 'T')), "HH:mm")}
>>>>>>> feature/improvements
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Durée totale</p>
                <p className="font-medium">{calculateDuration()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type de réservation</p>
                <p className="font-medium capitalize">
                  {reservation.typeReservation}
                </p>
              </div>
            </div>
          </Card>

          {isAdmin && reservation.user && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent" />
                Informations client
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nom complet</p>
                  <p className="font-medium">
                    {reservation.user.prenom} {reservation.user.nom}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{reservation.user.email}</p>
                  </div>
                  {reservation.user.telephone && (
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium">{reservation.user.telephone}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {reservation.notes && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Notes
              </h2>
              <p className="text-gray-700">{reservation.notes}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-accent" />
              Détails financiers
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Montant total</span>
                <span className="font-bold text-lg text-accent">
                  {formatPrice(reservation.montantTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Montant payé</span>
                <span className="font-semibold">
                  {formatPrice(reservation.montantPaye)}
                </span>
              </div>
              {reservation.modePaiement && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mode de paiement</span>
                  <span className="font-medium capitalize">
                    {reservation.modePaiement}
                  </span>
                </div>
              )}
              {reservation.codePromo && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <Tag className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Code promo: <strong>{reservation.codePromo}</strong>
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Informations système</h2>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-gray-600">ID Réservation</p>
                <p className="font-mono text-xs">{reservation.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Date de création</p>
                <p className="font-medium">
                  {format(new Date(reservation.createdAt), "dd MMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>
            </div>
          </Card>

          {canCancelReservation() && (
            <Button
              onClick={() => setShowCancelModal(true)}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Annuler la réservation
            </Button>
          )}
        </div>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Annuler la réservation"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir annuler cette réservation ? Cette action
            est irréversible.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Retour
            </Button>
            <Button
              onClick={handleCancelReservation}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirmer l'annulation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReservationDetail;
