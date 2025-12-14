import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { logger } from '../utils/logger'

interface ErrorHandlerOptions {
  showToast?: boolean
  redirectOnAuth?: boolean
  customMessage?: string
}

export const useErrorHandler = () => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleError = useCallback(
    (error: any, options: ErrorHandlerOptions = {}) => {
      const {
        showToast = true,
        redirectOnAuth = true,
        customMessage
      } = options

      logger.error('Error caught', {
        error: error?.message || error,
        code: error?.code,
        status: error?.status,
        stack: error?.stack
      })

      let message = customMessage || 'Une erreur est survenue'

      if (error?.message) {
        message = error.message
      }

      if (error?.code === 'PGRST301' || error?.status === 401) {
        message = 'Session expirée. Veuillez vous reconnecter.'
        if (redirectOnAuth) {
          logout()
          navigate('/connexion', { replace: true })
        }
      } else if (error?.code === 'PGRST116') {
        message = 'Données introuvables'
      } else if (error?.code === '23505') {
        message = 'Cette donnée existe déjà'
      } else if (error?.code === '23503') {
        message = 'Référence invalide'
      } else if (error?.message?.includes('network')) {
        message = 'Erreur de connexion. Vérifiez votre internet.'
      }

      if (showToast) {
        toast.error(message)
      }

      return { message, handled: true }
    },
    [navigate, logout]
  )

  return { handleError }
}
