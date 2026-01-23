import React, { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Plus, XCircle, Eye, List, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/store";
import { apiClient } from "../../lib/api-client";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import LoadingScreen from "../../components/LoadingScreen";
import Modal from "../../components/ui/Modal";
import Tabs from "../../components/ui/Tabs";
import Calendar from "../../components/ui/Calendar";
import WeekCalendar from "../../components/ui/WeekCalendar";
import ReservationForm from "../../components/dashboard/ReservationForm";
import { formatDate, formatPrice } from "../../utils/formatters";
import {
  getEspaceTypeLabel,
  getReservationStatutColor,
  STATUS_LABELS,
} from "../../constants";
import toast from "react-hot-toast";

const Reservations = () => {
  const { user } = useAuthStore();
  const { reservations, espaces, loadReservations } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedEspace, setSelectedEspace] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [activeView, setActiveView] = useState<'list' | 'month' | 'week'>('list');

  const handleCancelReservation = async () => {
    if (!cancellingId) return;

    try {
      const response = await apiClient.cancelReservation(cancellingId);
      if (response.success) {
        toast.success("Réservation annulée avec succès");
        await loadReservations();
        setShowCancelModal(false);
        setCancellingId(null);
      } else {
        toast.error(response.error || "Erreur lors de l'annulation");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'annulation");
    }
  };

  const canCancelReservation = (reservation: any) => {
    return ["en_attente", "confirmee"].includes(reservation.statut);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSlotClick = (date: Date, espaceId: string) => {
    const espace = espaces.find(e => e.id === espaceId);
    if (espace) {
      setSelectedEspace(espace);
      setShowForm(true);
    }
  };

  if (!user) {
    return <LoadingScreen minimal message="Chargement..." />;
  }

  const userReservations = reservations.filter((r) => r.userId === user.id);

  const filteredReservations = selectedDate
    ? userReservations.filter(r => {
        const resDate = new Date(r.dateDebut);
        return resDate.toDateString() === selectedDate.toDateString();
      })
    : userReservations;

  const tabs = [
    { id: 'list', label: 'Liste', icon: List },
    { id: 'month', label: 'Mois', icon: CalendarDays },
    { id: 'week', label: 'Semaine', icon: CalendarIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mes Réservations</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Réservation
        </Button>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeView}
        onChange={(tabId) => setActiveView(tabId as 'list' | 'month' | 'week')}
      />

      {activeView === 'list' && (
        <>
          {userReservations.length === 0 ? (
            <Card>
              <EmptyState
                icon={CalendarIcon}
                title="Aucune réservation"
                description="Vous n'avez pas encore de réservation. Commencez par réserver un espace pour profiter de nos services."
                action={{
                  label: "Faire une réservation",
                  onClick: () => setShowForm(true),
                }}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userReservations.map((reservation) => (
                <Card key={reservation.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg">
                        {reservation.espace?.nom || "Espace inconnu"}
                      </h3>
                      <Badge
                        variant={getReservationStatutColor(reservation.statut)}
                      >
                        {STATUS_LABELS.RESERVATION[
                          reservation.statut as keyof typeof STATUS_LABELS.RESERVATION
                        ] || reservation.statut}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Du {formatDate(reservation.dateDebut)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>Au {formatDate(reservation.dateFin)}</span>
                      </div>
                      {reservation.espace && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{getEspaceTypeLabel(reservation.espace.type)}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Montant total</span>
                        <span className="font-bold text-accent">
                          {formatPrice(reservation.montantTotal)}
                        </span>
                      </div>
                    </div>

                    {reservation.notes && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Notes:</p>
                        <p>{reservation.notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Link
                        to={`/app/reservations/${reservation.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Détails
                        </Button>
                      </Link>
                      {canCancelReservation(reservation) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-600 hover:bg-red-50 border-red-300"
                          onClick={() => {
                            setCancellingId(reservation.id);
                            setShowCancelModal(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeView === 'month' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar
              reservations={userReservations}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          </div>
          <div>
            <Card className="p-4">
              <h3 className="font-semibold mb-4">
                {selectedDate
                  ? `Réservations du ${formatDate(selectedDate)}`
                  : 'Sélectionnez une date'}
              </h3>
              {selectedDate ? (
                filteredReservations.length > 0 ? (
                  <div className="space-y-3">
                    {filteredReservations.map(res => (
                      <div key={res.id} className="border-l-4 border-blue-600 pl-3 py-2">
                        <p className="font-medium">{res.espace?.nom}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(res.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {' - '}
                          {new Date(res.dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <Badge variant={getReservationStatutColor(res.statut)} className="mt-1">
                          {STATUS_LABELS.RESERVATION[res.statut as keyof typeof STATUS_LABELS.RESERVATION]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune réservation ce jour</p>
                )
              ) : (
                <p className="text-sm text-gray-500">Cliquez sur une date pour voir les réservations</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {activeView === 'week' && (
        <WeekCalendar
          reservations={reservations}
          espaces={espaces}
          onSlotClick={handleSlotClick}
        />
      )}

      <ReservationForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedEspace(null);
        }}
        selectedEspace={selectedEspace}
      />

      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancellingId(null);
        }}
        title="Annuler la réservation"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir annuler cette réservation ? Cette action
            est irréversible.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelModal(false);
                setCancellingId(null);
              }}
            >
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

export default Reservations;
