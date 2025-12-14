import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon, Building2, DollarSign, Clock, Mail, Bell,
  Shield, Save, RefreshCw, Database
} from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import toast from 'react-hot-toast'

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'notifications' | 'security'>('general')
  const [loading, setLoading] = useState(false)

  const [generalSettings, setGeneralSettings] = useState({
    nom_entreprise: 'COFFICE',
    email: 'contact@coffice.dz',
    telephone: '+213 XXX XXX XXX',
    adresse: '4ème étage, Mohammadia Mall, Alger',
    horaires_ouverture: '08:00',
    horaires_fermeture: '20:00'
  })

  const [pricingSettings, setPricingSettings] = useState({
    prix_coworking_heure: '1200',
    prix_coworking_jour: '5000',
    prix_booth_heure: '1500',
    prix_booth_jour: '7000',
    prix_salle_reunion_heure: '2500',
    prix_salle_reunion_demi_journee: '7000',
    prix_salle_reunion_journee: '12000',
    prix_domiciliation_mensuel: '15000',
    credits_parrainage: '3000'
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email_nouvelles_reservations: true,
    email_nouveaux_utilisateurs: true,
    email_expirations_abonnements: true,
    notifications_push: false
  })

  const handleSaveGeneral = async () => {
    setLoading(true)
    try {
      // TODO: Appeler l'API pour sauvegarder
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Paramètres généraux mis à jour')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePricing = async () => {
    setLoading(true)
    try {
      // TODO: Appeler l'API pour sauvegarder
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Tarifs mis à jour')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      // TODO: Appeler l'API pour sauvegarder
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Notifications mises à jour')
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'general', name: 'Général', icon: Building2 },
    { id: 'pricing', name: 'Tarification', icon: DollarSign },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Sécurité', icon: Shield }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-3">
          <SettingsIcon className="w-8 h-8" />
          Paramètres
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-primary mb-6">Informations Générales</h2>
            <div className="space-y-4">
              <Input
                label="Nom de l'entreprise"
                value={generalSettings.nom_entreprise}
                onChange={(e) => setGeneralSettings({ ...generalSettings, nom_entreprise: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email de contact"
                  type="email"
                  value={generalSettings.email}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
                  icon={<Mail className="w-5 h-5" />}
                />
                <Input
                  label="Téléphone"
                  value={generalSettings.telephone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, telephone: e.target.value })}
                />
              </div>
              <Input
                label="Adresse"
                value={generalSettings.adresse}
                onChange={(e) => setGeneralSettings({ ...generalSettings, adresse: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Heure d'ouverture"
                  type="time"
                  value={generalSettings.horaires_ouverture}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, horaires_ouverture: e.target.value })}
                  icon={<Clock className="w-5 h-5" />}
                />
                <Input
                  label="Heure de fermeture"
                  type="time"
                  value={generalSettings.horaires_fermeture}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, horaires_fermeture: e.target.value })}
                />
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveGeneral} disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Sauvegarder
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Pricing Settings */}
      {activeTab === 'pricing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-primary mb-6">Tarification</h2>
            <div className="space-y-6">
              {/* Coworking */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Coworking</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Prix à l'heure (DA)"
                    type="number"
                    value={pricingSettings.prix_coworking_heure}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, prix_coworking_heure: e.target.value })}
                  />
                  <Input
                    label="Prix à la journée (DA)"
                    type="number"
                    value={pricingSettings.prix_coworking_jour}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, prix_coworking_jour: e.target.value })}
                  />
                </div>
              </div>

              {/* Booths */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Private Booths</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Prix à l'heure (DA)"
                    type="number"
                    value={pricingSettings.prix_booth_heure}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, prix_booth_heure: e.target.value })}
                  />
                  <Input
                    label="Prix à la journée (DA)"
                    type="number"
                    value={pricingSettings.prix_booth_jour}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, prix_booth_jour: e.target.value })}
                  />
                </div>
              </div>

              {/* Salle de réunion */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Salle de Réunion</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Prix à l'heure (DA)"
                    type="number"
                    value={pricingSettings.prix_salle_reunion_heure}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, prix_salle_reunion_heure: e.target.value })}
                  />
                  <Input
                    label="Prix demi-journée (DA)"
                    type="number"
                    value={pricingSettings.prix_salle_reunion_demi_journee}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, prix_salle_reunion_demi_journee: e.target.value })}
                  />
                  <Input
                    label="Prix journée complète (DA)"
                    type="number"
                    value={pricingSettings.prix_salle_reunion_journee}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, prix_salle_reunion_journee: e.target.value })}
                  />
                </div>
              </div>

              {/* Autres */}
              <div>
                <h3 className="font-medium text-gray-700 mb-3">Autres</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Domiciliation mensuelle (DA)"
                    type="number"
                    value={pricingSettings.prix_domiciliation_mensuel}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, prix_domiciliation_mensuel: e.target.value })}
                  />
                  <Input
                    label="Crédits parrainage (DA)"
                    type="number"
                    value={pricingSettings.credits_parrainage}
                    onChange={(e) => setPricingSettings({ ...pricingSettings, credits_parrainage: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSavePricing} disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Sauvegarder
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Notifications Settings */}
      {activeTab === 'notifications' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-primary mb-6">Préférences de Notification</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Nouvelles réservations</p>
                  <p className="text-sm text-gray-500">Recevoir un email pour chaque nouvelle réservation</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.email_nouvelles_reservations}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, email_nouvelles_reservations: e.target.checked })}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Nouveaux utilisateurs</p>
                  <p className="text-sm text-gray-500">Recevoir un email pour chaque nouvelle inscription</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.email_nouveaux_utilisateurs}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, email_nouveaux_utilisateurs: e.target.checked })}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Expirations d'abonnements</p>
                  <p className="text-sm text-gray-500">Rappel 7 jours avant l'expiration d'un abonnement</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.email_expirations_abonnements}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, email_expirations_abonnements: e.target.checked })}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Notifications push</p>
                  <p className="text-sm text-gray-500">Activer les notifications push dans le navigateur</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.notifications_push}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, notifications_push: e.target.checked })}
                  className="w-5 h-5 text-accent rounded"
                />
              </label>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Sauvegarder
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold text-primary mb-6">Sécurité & Maintenance</h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Ces paramètres affectent la sécurité de l'application.
                  Effectuez toute modification avec précaution.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Effacer le cache</p>
                    <p className="text-sm text-gray-500">Vider le cache applicatif</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Effacer
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Sauvegarder la base de données</p>
                    <p className="text-sm text-gray-500">Créer une sauvegarde manuelle</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Database className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default Settings
