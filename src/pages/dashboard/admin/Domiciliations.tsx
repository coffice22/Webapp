import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
  Edit,
  Trash2,
  AlertCircle,
  Plus,
  TrendingUp,
  DollarSign,
  Ban,
  PlayCircle,
  RefreshCw,
  CheckCheck,
  XOctagon
} from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import Input from '../../../components/ui/Input'
import Modal from '../../../components/ui/Modal'
import { useAppStore } from '../../../store/store'
import { formatDate, formatCurrency } from '../../../utils/formatters'
import toast from 'react-hot-toast'
import type { DemandeDomiciliation } from '../../../types'
import { apiClient } from '../../../lib/api-client'

const AdminDomiciliations = () => {
  const { demandesDomiciliation, loadDemandesDomiciliation } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('tous')
  const [selectedDemande, setSelectedDemande] = useState<DemandeDomiciliation | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'valider' | 'rejeter' | 'activer'>('valider')
  const [commentaire, setCommentaire] = useState('')
  const [montantMensuel, setMontantMensuel] = useState(15000)
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [modePaiement, setModePaiement] = useState('cash')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDemandesDomiciliation()
  }, [])

  const filteredDemandes = demandesDomiciliation.filter(demande => {
    const matchesSearch =
      demande.raisonSociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.nif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.representantLegal.nom.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'tous' || demande.statut === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: demandesDomiciliation.length,
    enAttente: demandesDomiciliation.filter(d => d.statut === 'en_attente').length,
    validees: demandesDomiciliation.filter(d => d.statut === 'validee').length,
    actives: demandesDomiciliation.filter(d => d.statut === 'active').length,
    refusees: demandesDomiciliation.filter(d => d.statut === 'refusee').length,
    revenuMensuel: demandesDomiciliation
      .filter(d => d.statut === 'active')
      .reduce((sum, d) => sum + (d.montantMensuel || 0), 0)
  }

  const getStatusBadge = (statut: string) => {
    const badges: Record<string, { variant: 'warning' | 'success' | 'danger' | 'default', icon: React.ReactNode, label: string }> = {
      en_attente: { variant: 'warning', icon: <Clock className="w-3 h-3 mr-1" />, label: 'En attente' },
      validee: { variant: 'success', icon: <CheckCircle className="w-3 h-3 mr-1" />, label: 'Validée' },
      active: { variant: 'success', icon: <PlayCircle className="w-3 h-3 mr-1" />, label: 'Active' },
      refusee: { variant: 'danger', icon: <XCircle className="w-3 h-3 mr-1" />, label: 'Refusée' },
      resiliee: { variant: 'danger', icon: <Ban className="w-3 h-3 mr-1" />, label: 'Résiliée' },
      expiree: { variant: 'default', icon: <AlertCircle className="w-3 h-3 mr-1" />, label: 'Expirée' }
    }

    const badge = badges[statut] || badges.en_attente
    return <Badge variant={badge.variant}>{badge.icon}{badge.label}</Badge>
  }

  const handleAction = (demande: DemandeDomiciliation, action: 'valider' | 'rejeter' | 'activer') => {
    setSelectedDemande(demande)
    setActionType(action)
    setCommentaire('')

    if (action === 'activer') {
      setMontantMensuel(15000)
      const debut = new Date()
      const fin = new Date()
      fin.setFullYear(fin.getFullYear() + 1)
      setDateDebut(debut.toISOString().split('T')[0])
      setDateFin(fin.toISOString().split('T')[0])
      setModePaiement('cash')
    }

    setShowActionModal(true)
  }

  const handleViewDetails = (demande: DemandeDomiciliation) => {
    setSelectedDemande(demande)
    setShowDetailModal(true)
  }

  const submitAction = async () => {
    if (!selectedDemande) return

    if (actionType === 'rejeter' && !commentaire.trim()) {
      toast.error('Veuillez préciser la raison du rejet')
      return
    }

    if (actionType === 'activer' && montantMensuel <= 0) {
      toast.error('Le montant mensuel doit être supérieur à 0')
      return
    }

    setLoading(true)
    try {
      let endpoint = ''
      let payload: any = { domiciliation_id: selectedDemande.id }

      if (actionType === 'valider') {
        endpoint = '/api/domiciliations/validate.php'
        payload.commentaire = commentaire
      } else if (actionType === 'rejeter') {
        endpoint = '/api/domiciliations/reject.php'
        payload.commentaire = commentaire
      } else if (actionType === 'activer') {
        endpoint = '/api/domiciliations/activate.php'
        payload = {
          ...payload,
          montant_mensuel: montantMensuel,
          date_debut: dateDebut,
          date_fin: dateFin,
          mode_paiement: modePaiement
        }
      }

      const response = await apiClient.post(endpoint, payload)

      if (response.success) {
        toast.success(
          actionType === 'valider' ? 'Demande validée avec succès' :
          actionType === 'rejeter' ? 'Demande rejetée' :
          'Domiciliation activée avec succès'
        )
        setShowActionModal(false)
        await loadDemandesDomiciliation()
      } else {
        toast.error(response.message || 'Une erreur est survenue')
      }
    } catch (error) {
      console.error('Action error:', error)
      toast.error('Erreur lors du traitement de la demande')
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Raison Sociale', 'NIF', 'NIS', 'Forme Juridique', 'Statut', 'Date Création', 'Représentant', 'Email', 'Téléphone', 'Montant Mensuel'],
      ...filteredDemandes.map(d => [
        d.raisonSociale,
        d.nif || '',
        d.nis || '',
        d.formeJuridique,
        d.statut,
        formatDate(d.dateCreation),
        `${d.representantLegal.prenom} ${d.representantLegal.nom}`,
        d.representantLegal.email || '',
        d.representantLegal.telephone || '',
        d.montantMensuel ? formatCurrency(d.montantMensuel) : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `domiciliations_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Domiciliations</h1>
          <p className="text-gray-600 mt-1">Administration des demandes de domiciliation d'entreprises</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <Building className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-l-4 border-amber-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">En Attente</p>
              <p className="text-3xl font-bold text-amber-900">{stats.enAttente}</p>
            </div>
            <Clock className="w-10 h-10 text-amber-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Validées</p>
              <p className="text-3xl font-bold text-green-900">{stats.validees}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-l-4 border-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Actives</p>
              <p className="text-3xl font-bold text-emerald-900">{stats.actives}</p>
            </div>
            <PlayCircle className="w-10 h-10 text-emerald-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Revenu/Mois</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(stats.revenuMensuel)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Rechercher par raison sociale, NIF, représentant..."
            icon={<Search className="w-5 h-5" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="tous">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="validee">Validées</option>
            <option value="active">Actives</option>
            <option value="refusee">Refusées</option>
            <option value="resiliee">Résiliées</option>
            <option value="expiree">Expirées</option>
          </select>
        </div>
      </Card>

      {/* Liste des demandes */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Identifiants
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Représentant
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDemandes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Aucune demande trouvée</p>
                  </td>
                </tr>
              ) : (
                filteredDemandes.map((demande) => (
                  <motion.tr
                    key={demande.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{demande.raisonSociale}</p>
                        <p className="text-sm text-gray-500">{demande.formeJuridique}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">NIF: {demande.nif || 'N/A'}</p>
                        <p className="text-gray-500">NIS: {demande.nis || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {demande.representantLegal.prenom} {demande.representantLegal.nom}
                        </p>
                        <p className="text-gray-500">{demande.representantLegal.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(demande.statut)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(demande.dateCreation)}
                    </td>
                    <td className="px-6 py-4">
                      {demande.montantMensuel ? (
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(demande.montantMensuel)}/mois
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">-</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(demande)}
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {demande.statut === 'en_attente' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(demande, 'valider')}
                              title="Valider la demande"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCheck className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(demande, 'rejeter')}
                              title="Rejeter la demande"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XOctagon className="w-4 h-4" />
                            </Button>
                          </>
                        )}

                        {demande.statut === 'validee' && (
                          <Button
                            size="sm"
                            onClick={() => handleAction(demande, 'activer')}
                            title="Activer la domiciliation"
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <PlayCircle className="w-4 h-4 mr-1" />
                            Activer
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Détails */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Détails de la demande de domiciliation"
      >
        {selectedDemande && (
          <div className="space-y-6">
            {/* Informations Entreprise */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center border-b pb-2">
                <Building className="w-5 h-5 mr-2 text-accent" />
                Informations Entreprise
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Raison Sociale</p>
                  <p className="font-medium">{selectedDemande.raisonSociale}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Forme Juridique</p>
                  <p className="font-medium">{selectedDemande.formeJuridique}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIF</p>
                  <p className="font-medium">{selectedDemande.nif || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">NIS</p>
                  <p className="font-medium">{selectedDemande.nis || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">RC</p>
                  <p className="font-medium">{selectedDemande.registreCommerce || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Article Imposition</p>
                  <p className="font-medium">{selectedDemande.articleImposition || 'Non renseigné'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Domaine d'Activité</p>
                  <p className="font-medium">{selectedDemande.domaineActivite || 'Non renseigné'}</p>
                </div>
                {selectedDemande.capital && (
                  <div>
                    <p className="text-sm text-gray-600">Capital</p>
                    <p className="font-medium">{formatCurrency(selectedDemande.capital)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Représentant Légal */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center border-b pb-2">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Représentant Légal
              </h3>
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {selectedDemande.representantLegal.prenom} {selectedDemande.representantLegal.nom}
                  </span>
                  {selectedDemande.representantLegal.fonction && (
                    <span className="text-sm text-gray-500">- {selectedDemande.representantLegal.fonction}</span>
                  )}
                </div>
                {selectedDemande.representantLegal.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${selectedDemande.representantLegal.email}`} className="text-blue-600 hover:underline">
                      {selectedDemande.representantLegal.email}
                    </a>
                  </div>
                )}
                {selectedDemande.representantLegal.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${selectedDemande.representantLegal.telephone}`} className="text-blue-600 hover:underline">
                      {selectedDemande.representantLegal.telephone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Statut et Informations */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center border-b pb-2">
                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                Statut et Informations
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Statut actuel</p>
                    {getStatusBadge(selectedDemande.statut)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Date de création</p>
                    <p className="font-medium">{formatDate(selectedDemande.dateCreation)}</p>
                  </div>
                </div>

                {selectedDemande.statut === 'active' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-emerald-700 font-medium">Montant Mensuel</p>
                        <p className="text-xl font-bold text-emerald-900">
                          {selectedDemande.montantMensuel ? formatCurrency(selectedDemande.montantMensuel) : 'N/A'}
                        </p>
                      </div>
                      {selectedDemande.dateDebut && (
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">Date début</p>
                          <p className="font-medium text-emerald-900">{formatDate(selectedDemande.dateDebut)}</p>
                        </div>
                      )}
                      {selectedDemande.dateFin && (
                        <div>
                          <p className="text-sm text-emerald-700 font-medium">Date fin</p>
                          <p className="font-medium text-emerald-900">{formatDate(selectedDemande.dateFin)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedDemande.commentaireAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-medium text-amber-900 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Notes Admin
                </p>
                <p className="text-sm text-amber-700">{selectedDemande.commentaireAdmin}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Action */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={
          actionType === 'valider' ? 'Valider la demande de domiciliation' :
          actionType === 'rejeter' ? 'Rejeter la demande de domiciliation' :
          'Activer la domiciliation'
        }
      >
        <div className="space-y-4">
          {actionType === 'activer' ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Vous allez activer la domiciliation pour <strong>{selectedDemande?.raisonSociale}</strong>.
                  Une transaction sera créée automatiquement.
                </p>
              </div>

              <Input
                label="Montant Mensuel (DA)"
                type="number"
                value={montantMensuel}
                onChange={(e) => setMontantMensuel(parseFloat(e.target.value))}
                min="0"
                step="1000"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date Début"
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  required
                />
                <Input
                  label="Date Fin"
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de Paiement
                </label>
                <select
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="cash">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement</option>
                  <option value="carte">Carte bancaire</option>
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire {actionType === 'rejeter' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder={
                  actionType === 'valider'
                    ? 'Commentaire optionnel...'
                    : 'Veuillez préciser la raison du rejet (obligatoire)...'
                }
                required={actionType === 'rejeter'}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowActionModal(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={submitAction}
              disabled={loading || (actionType === 'rejeter' && !commentaire.trim())}
              className="flex-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  {actionType === 'valider' && <CheckCheck className="w-4 h-4 mr-2" />}
                  {actionType === 'rejeter' && <XOctagon className="w-4 h-4 mr-2" />}
                  {actionType === 'activer' && <PlayCircle className="w-4 h-4 mr-2" />}
                  {actionType === 'valider' ? 'Valider' :
                   actionType === 'rejeter' ? 'Rejeter' :
                   'Activer'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminDomiciliations
