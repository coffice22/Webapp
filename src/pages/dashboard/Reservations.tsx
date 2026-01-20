import React, { useState } from 'react'
import { Calendar, Clock, MapPin, Plus } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/store'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingScreen from '../../components/LoadingScreen'
import ReservationForm from '../../components/dashboard/ReservationForm'
import { formatDate, formatPrice } from '../../utils/formatters'
import { getEspaceTypeLabel, getReservationStatutColor, STATUS_LABELS } from '../../constants'

const Reservations = () => {
  const { user } = useAuthStore()
  const { reservations, espaces } = useAppStore()
  const [showForm, setShowForm] = useState(false)
  const [selectedEspace, setSelectedEspace] = useState<any>(null)

  if (!user) {
    return <LoadingScreen minimal message="Chargement..." />
  }

  const userReservations = reservations.filter(r => r.userId === user.id)


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mes Réservations</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Réservation
        </Button>
      </div>

      {userReservations.length === 0 ? (
        <Card>
          <EmptyState
            icon={Calendar}
            title="Aucune réservation"
            description="Vous n'avez pas encore de réservation. Commencez par réserver un espace pour profiter de nos services."
            action={{
              label: 'Faire une réservation',
              onClick: () => setShowForm(true)
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userReservations.map((reservation) => (
            <Card key={reservation.id} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{reservation.espace?.nom || 'Espace inconnu'}</h3>
                  <Badge variant={getReservationStatutColor(reservation.statut)}>
                    {STATUS_LABELS.RESERVATION[reservation.statut as keyof typeof STATUS_LABELS.RESERVATION] || reservation.statut}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Du {formatDate(reservation.dateDebut)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
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
                    <span className="font-bold text-accent">{formatPrice(reservation.montantTotal)}</span>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Notes:</p>
                    <p>{reservation.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ReservationForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setSelectedEspace(null)
        }}
        selectedEspace={selectedEspace}
      />
    </div>
  )
}

export default Reservations
