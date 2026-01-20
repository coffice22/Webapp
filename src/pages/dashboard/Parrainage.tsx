import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Gift,
  Copy,
  Check,
  Users,
  TrendingUp,
  Share2,
  Info
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import { apiClient } from '../../lib/api-client'

interface ParrainageStats {
  parraines: number
  daGagnes: number
  codeParrainage: string
}

const Parrainage = () => {
  const { user } = useAuthStore()
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<ParrainageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadParrainageStats = async () => {
      if (!user?.codeParrainage) {
        setLoading(false)
        return
      }

      try {
        const response = await apiClient.request('/parrainages/index.php')
        if (response.success && response.data) {
          setStats({
            parraines: response.data.filter((p: any) => p.parrainId === user.id).length,
            daGagnes: response.data.filter((p: any) => p.parrainId === user.id).reduce((sum: number, p: any) => sum + (p.recompenseParrain || 0), 0),
            codeParrainage: user.codeParrainage
          })
        }
      } catch (error) {
        console.error('Erreur chargement stats parrainage:', error)
      } finally {
        setLoading(false)
      }
    }

    loadParrainageStats()
  }, [user])

  const handleCopyCode = () => {
    if (user?.codeParrainage) {
      navigator.clipboard.writeText(user.codeParrainage)
      setCopied(true)
      toast.success('Code copié !')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/inscription?parrain=${user?.codeParrainage}`
    if (navigator.share) {
      navigator.share({
        title: 'Rejoignez Coffice',
        text: `Utilisez mon code de parrainage ${user?.codeParrainage} et profitez d'avantages exclusifs !`,
        url
      }).catch(() => {
        navigator.clipboard.writeText(url)
        toast.success('Lien copié !')
      })
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Lien copié !')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Parrainage</h1>
        <p className="text-gray-600 mt-1">Partagez et gagnez des récompenses</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-accent to-teal text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Votre code de parrainage</h2>
              <p className="text-white/80 text-sm">Partagez-le avec vos contacts</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-white/70 text-sm mb-2">Votre code unique</p>
                <p className="text-4xl font-bold tracking-wider">
                  {user?.codeParrainage || 'Chargement...'}
                </p>
              </div>
              <button
                onClick={handleCopyCode}
                className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
              >
                {copied ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <Copy className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>

          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Partager mon code
          </Button>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Parrainés</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.parraines || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">DA gagnés</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.daGagnes || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <Info className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Comment ça marche ?</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-accent">1</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Partagez votre code</h4>
            <p className="text-sm text-gray-600">
              Partagez votre code avec vos contacts, amis et collègues
            </p>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-teal">2</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Ils s'inscrivent</h4>
            <p className="text-sm text-gray-600">
              Ils s'inscrivent avec votre code et profitent d'avantages exclusifs
            </p>
          </div>

          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 bg-warm/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-warm">3</span>
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Vous recevez des récompenses</h4>
            <p className="text-sm text-gray-600">
              Recevez des crédits pour chaque personne qui utilise votre code
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <Gift className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-bold text-blue-900 mb-2">Avantages du parrainage</h4>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Gagnez des crédits à chaque parrainage réussi
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Vos filleuls bénéficient de réductions exclusives
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Parrainez un nombre illimité de personnes
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Utilisez vos crédits pour vos réservations
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Parrainage
