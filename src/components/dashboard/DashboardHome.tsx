import React, { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Users,
  Building,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Plus,
  ArrowUpRight,
  Activity,
  BarChart3,
  FileText,
  Star,
  Zap,
  Gift,
  Bell
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/store'
import { formatDate, formatCurrency, formatTime } from '../../utils/formatters'
// AdminDashboard et useUserCredits supprimés - utilise les statistiques de base

const DashboardHome = () => {
  const { user } = useAuthStore()
  const {
    users,
    reservations,
    espaces,
    initializeData
  } = useAppStore()
  // Credits supprimés - TODO: implémenter avec l'API MySQL
  const credits = 0
  const creditsLoading = false

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      await initializeData()
      if (mounted) {
        setLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-display font-bold text-primary mb-4">Erreur d'authentification</h2>
        <p className="text-gray-600">Veuillez vous reconnecter</p>
      </div>
    )
  }

  // AdminDashboard supprimé - affiche le dashboard user pour l'admin aussi
  // TODO: Créer un dashboard admin simple plus tard

  // Filtrer les réservations de l'utilisateur
  const userReservations = reservations.filter(r => r.userId === user.id)
  const upcomingReservations = userReservations.filter(r =>
    new Date(r.dateDebut) > new Date() && r.statut !== 'annulee'
  )
  const completedReservations = userReservations.filter(r =>
    new Date(r.dateFin) < new Date() && r.statut === 'confirmee'
  )

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left"
      >
        <h1 className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">
          Bonjour {user.prenom} ! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Voici un aperçu de votre activité chez Coffice
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-accent to-accent/80 text-white hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-white/80 text-sm mb-1">Total Réservations</p>
          <p className="text-3xl font-bold text-white">{userReservations.length}</p>
          <p className="text-white/60 text-xs mt-2">Toutes périodes confondues</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-teal to-teal/80 text-white hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-white/80 text-sm mb-1">À Venir</p>
          <p className="text-3xl font-bold text-white">{upcomingReservations.length}</p>
          <p className="text-white/60 text-xs mt-2">Réservations planifiées</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-warm to-warm/80 text-white hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <CheckCircle className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-white/80 text-sm mb-1">Statut Compte</p>
          <p className="text-3xl font-bold text-white">Actif</p>
          <p className="text-white/60 text-xs mt-2">Membre depuis {new Date(user.createdAt || Date.now()).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-white hover:scale-105 transition-transform">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-white/60" />
          </div>
          <p className="text-white/80 text-sm mb-1">Sessions Complétées</p>
          <p className="text-3xl font-bold text-white">{completedReservations.length}</p>
          <p className="text-white/60 text-xs mt-2">Réservations terminées</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/app/reservations">
          <Card hover className="p-6 border-2 border-transparent hover:border-accent group transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Plus className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-primary mb-2 text-lg">
              Nouvelle Réservation
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Réserver un espace maintenant
            </p>
            <div className="flex items-center text-accent text-sm font-semibold">
              Commencer <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </Card>
        </Link>

        <Link to="/app/domiciliation">
          <Card hover className="p-6 border-2 border-transparent hover:border-teal group transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-teal to-teal/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Building className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-primary mb-2 text-lg">
              Domiciliation
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Services de domiciliation
            </p>
            <div className="flex items-center text-teal text-sm font-semibold">
              Découvrir <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </Card>
        </Link>

        <Link to="/app/profil">
          <Card hover className="p-6 border-2 border-transparent hover:border-warm group transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-warm to-warm/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-primary mb-2 text-lg">
              Mon Profil
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Gérer mes informations
            </p>
            <div className="flex items-center text-warm text-sm font-semibold">
              Modifier <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </Card>
        </Link>

        <Link to="/app/mon-entreprise">
          <Card hover className="p-6 border-2 border-transparent hover:border-primary group transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-primary mb-2 text-lg">
              Mon Entreprise
            </h3>
            <p className="text-gray-600 text-sm mb-3">
              Infos entreprise et documents
            </p>
            <div className="flex items-center text-primary text-sm font-semibold">
              Voir <ArrowUpRight className="w-4 h-4 ml-1" />
            </div>
          </Card>
        </Link>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-display font-bold text-primary mb-4">
          Mes Réservations Récentes
        </h3>

        {upcomingReservations.length > 0 ? (
          <div className="space-y-4">
            {upcomingReservations.slice(0, 3).map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-primary">{reservation.espace.nom}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(reservation.dateDebut)} à {formatTime(reservation.dateDebut)}
                    </p>
                  </div>
                </div>
                <Badge variant={reservation.statut === 'confirmee' ? 'success' : 'warning'}>
                  {reservation.statut === 'confirmee' ? 'Confirmée' : 'En attente'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune réservation à venir</p>
            <Link to="/app/reservations">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer une réservation
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  )
}

export default DashboardHome
