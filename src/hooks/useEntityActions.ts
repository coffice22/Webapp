import { useState } from 'react'
import toast from 'react-hot-toast'

interface EntityActions<T> {
  isLoading: boolean
  handleUpdate: (id: string, data: Partial<T>, successMsg?: string) => Promise<boolean>
  handleDelete: (id: string, confirmMsg?: string, successMsg?: string) => Promise<boolean>
  handleCreate: (data: Partial<T>, successMsg?: string) => Promise<boolean>
}

/**
 * Hook personnalisé pour gérer les actions CRUD sur une entité
 * Réduit la duplication de code dans les composants admin
 */
export function useEntityActions<T>(
  updateFn?: (id: string, data: Partial<T>) => Promise<{ success: boolean; error?: string }>,
  deleteFn?: (id: string) => Promise<{ success: boolean; error?: string }>,
  createFn?: (data: Partial<T>) => Promise<{ success: boolean; error?: string }>
): EntityActions<T> {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async (
    id: string,
    data: Partial<T>,
    successMsg = 'Mise à jour réussie'
  ): Promise<boolean> => {
    if (!updateFn) {
      toast.error('Action non disponible')
      return false
    }

    setIsLoading(true)
    try {
      const result = await updateFn(id, data)
      if (result.success) {
        toast.success(successMsg)
        return true
      } else {
        toast.error(result.error || 'Erreur lors de la mise à jour')
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (
    id: string,
    confirmMsg = 'Êtes-vous sûr de vouloir supprimer cet élément ?',
    successMsg = 'Suppression réussie'
  ): Promise<boolean> => {
    if (!deleteFn) {
      toast.error('Action non disponible')
      return false
    }

    if (!window.confirm(confirmMsg)) {
      return false
    }

    setIsLoading(true)
    try {
      const result = await deleteFn(id)
      if (result.success) {
        toast.success(successMsg)
        return true
      } else {
        toast.error(result.error || 'Erreur lors de la suppression')
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (
    data: Partial<T>,
    successMsg = 'Création réussie'
  ): Promise<boolean> => {
    if (!createFn) {
      toast.error('Action non disponible')
      return false
    }

    setIsLoading(true)
    try {
      const result = await createFn(data)
      if (result.success) {
        toast.success(successMsg)
        return true
      } else {
        toast.error(result.error || 'Erreur lors de la création')
        return false
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    handleUpdate,
    handleDelete,
    handleCreate
  }
}
