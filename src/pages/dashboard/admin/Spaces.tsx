import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Wifi,
  Monitor,
  Coffee,
  Printer,
  Video,
  Grid
} from 'lucide-react'
import { useAppStore } from '../../../store/store'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import Modal from '../../../components/ui/Modal'
import Input from '../../../components/ui/Input'
import toast from 'react-hot-toast'

const Spaces = () => {
  const { espaces, addEspace, updateEspace, deleteEspace } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [editingSpace, setEditingSpace] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [formData, setFormData] = useState({
    nom: '',
    type: 'box',
    capacite: 1,
    prixHeure: 0,
    prixDemiJournee: 0,
    prixJour: 0,
    prixSemaine: 0,
    description: '',
    equipements: [] as string[],
    disponible: true
  })

  const equipementsList = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'ecran', label: 'Écran', icon: Monitor },
    { id: 'cafe', label: 'Café', icon: Coffee },
    { id: 'imprimante', label: 'Imprimante', icon: Printer },
    { id: 'visio', label: 'Visioconférence', icon: Video }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSpace) {
        await updateEspace(editingSpace.id, formData)
        toast.success('Espace modifié avec succès')
      } else {
        await addEspace({
          id: `espace-${Date.now()}`,
          ...formData,
          image: '/placeholder-space.jpg',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        toast.success('Espace créé avec succès')
      }
      setShowModal(false)
      resetForm()
    } catch (error) {
      toast.error('Erreur lors de l\'opération')
    }
  }

  const resetForm = () => {
    setFormData({
      nom: '',
      type: 'box',
      capacite: 1,
      prixHeure: 0,
      prixDemiJournee: 0,
      prixJour: 0,
      prixSemaine: 0,
      description: '',
      equipements: [],
      disponible: true
    })
    setEditingSpace(null)
  }

  const handleEdit = (space: any) => {
    setEditingSpace(space)
    setFormData({
      nom: space.nom,
      type: space.type,
      capacite: space.capacite,
      prixHeure: space.prixHeure,
      prixDemiJournee: space.prixDemiJournee || 0,
      prixJour: space.prixJour,
      prixSemaine: space.prixSemaine || 0,
      description: space.description || '',
      equipements: space.equipements || [],
      disponible: space.disponible
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet espace?')) {
      await deleteEspace(id)
      toast.success('Espace supprimé avec succès')
    }
  }

  const toggleEquipement = (equipId: string) => {
    setFormData(prev => ({
      ...prev,
      equipements: prev.equipements.includes(equipId)
        ? prev.equipements.filter(e => e !== equipId)
        : [...prev.equipements, equipId]
    }))
  }

  const filteredSpaces = espaces.filter(space => {
    const matchSearch = space.nom.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = filterType === 'all' || space.type === filterType
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'disponible' && space.disponible) ||
      (filterStatus === 'indisponible' && !space.disponible)
    return matchSearch && matchType && matchStatus
  })

  const stats = {
    total: espaces.length,
    disponibles: espaces.filter(e => e.disponible).length,
    occupes: espaces.filter(e => !e.disponible).length,
    capaciteTotal: espaces.reduce((sum, e) => sum + e.capacite, 0)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'box': return 'Box Privé'
      case 'open_space': return 'Open Space'
      case 'salle_reunion': return 'Salle de Réunion'
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'box': return 'bg-blue-100 text-blue-800'
      case 'open_space': return 'bg-purple-100 text-purple-800'
      case 'salle_reunion': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Espaces</h1>
          <p className="text-gray-600 mt-1">Gérez vos espaces de coworking</p>
        </div>
        <Button onClick={() => setShowModal(true)} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Nouvel Espace
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Espaces</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">{stats.disponibles}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Occupés</p>
              <p className="text-2xl font-bold text-red-600">{stats.occupes}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Capacité Totale</p>
              <p className="text-2xl font-bold text-purple-600">{stats.capaciteTotal}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={<Search className="w-5 h-5" />}
              placeholder="Rechercher un espace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="box">Box Privé</option>
              <option value="open_space">Open Space</option>
              <option value="salle_reunion">Salle de Réunion</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="disponible">Disponible</option>
              <option value="indisponible">Indisponible</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {filteredSpaces.length === 0 ? (
        <Card className="p-12 text-center">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun espace trouvé</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Aucun espace ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre premier espace de coworking.'}
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer un espace
            </Button>
          )}
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredSpaces.map((space) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{space.nom}</h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getTypeColor(space.type)}`}>
                        {getTypeLabel(space.type)}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${space.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {space.disponible ? 'Disponible' : 'Occupé'}
                    </div>
                  </div>

                  {space.description && (
                    <p className="text-sm text-gray-600">{space.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{space.capacite} personne{space.capacite > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">
                        {space.prixHeure} DA/h • {space.prixDemiJournee} DA/dj • {space.prixJour} DA/j
                      </span>
                    </div>
                  </div>

                  {space.equipements && space.equipements.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {space.equipements.map((equipId: string) => {
                        const equip = equipementsList.find(e => e.id === equipId)
                        if (!equip) return null
                        const Icon = equip.icon
                        return (
                          <div
                            key={equipId}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                            title={equip.label}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{equip.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(space)} className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(space.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          resetForm()
        }}
        title={editingSpace ? 'Modifier l\'Espace' : 'Nouvel Espace'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nom de l'espace"
            icon={<Building className="w-5 h-5" />}
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
            placeholder="Ex: Box Premium 1"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d'espace</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              required
            >
              <option value="box">Box Privé</option>
              <option value="open_space">Open Space</option>
              <option value="salle_reunion">Salle de Réunion</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacité"
              type="number"
              min="1"
              icon={<Users className="w-5 h-5" />}
              value={formData.capacite}
              onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) })}
              required
            />
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="disponible"
                checked={formData.disponible}
                onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                className="w-4 h-4 text-accent rounded"
              />
              <label htmlFor="disponible" className="text-sm font-medium text-gray-700">
                Disponible à la réservation
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prix/Heure (DA)"
              type="number"
              min="0"
              step="0.01"
              icon={<DollarSign className="w-5 h-5" />}
              value={formData.prixHeure}
              onChange={(e) => setFormData({ ...formData, prixHeure: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Prix/Demi-journée (DA)"
              type="number"
              min="0"
              step="0.01"
              icon={<DollarSign className="w-5 h-5" />}
              value={formData.prixDemiJournee}
              onChange={(e) => setFormData({ ...formData, prixDemiJournee: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Prix/Jour (DA)"
              type="number"
              min="0"
              step="0.01"
              icon={<DollarSign className="w-5 h-5" />}
              value={formData.prixJour}
              onChange={(e) => setFormData({ ...formData, prixJour: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Prix/Semaine (DA)"
              type="number"
              min="0"
              step="0.01"
              icon={<DollarSign className="w-5 h-5" />}
              value={formData.prixSemaine}
              onChange={(e) => setFormData({ ...formData, prixSemaine: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez brièvement cet espace..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Équipements</label>
            <div className="grid grid-cols-2 gap-3">
              {equipementsList.map((equip) => {
                const Icon = equip.icon
                const isSelected = formData.equipements.includes(equip.id)
                return (
                  <button
                    key={equip.id}
                    type="button"
                    onClick={() => toggleEquipement(equip.id)}
                    className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-all ${
                      isSelected
                        ? 'border-accent bg-accent/5 text-accent'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{equip.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingSpace ? 'Modifier l\'espace' : 'Créer l\'espace'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false)
                resetForm()
              }}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Spaces
