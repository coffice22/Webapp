import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Calendar, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'
import { useAppStore } from '../../store/store'
import { processPayment, PaymentDetails } from '../../utils/payment'
import toast from 'react-hot-toast'

interface PaymentFormProps {
  amount: number
  currency?: string
  description: string
  onSuccess: (transactionId: string) => void
  onCancel: () => void
  customerId: string
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency = 'DZD',
  description,
  onSuccess,
  onCancel,
  customerId
}) => {
  const [selectedMethod, setSelectedMethod] = useState('cib')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'method' | 'details' | 'processing' | 'success' | 'error'>('method')
  const [error, setError] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState<string | null>(null)

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 'method') {
      // Si c'est un paiement en espèces, on peut passer directement à la confirmation
      if (selectedMethod === 'cash') {
        setStep('processing')
        processPaymentTransaction()
      } else {
        setStep('details')
      }
      return
    }
    
    // Validation basique des champs de carte
    if (step === 'details') {
      if (!cardNumber.trim()) {
        setError('Veuillez saisir le numéro de carte')
        return
      }
      
      if (!cardExpiry.trim()) {
        setError('Veuillez saisir la date d\'expiration')
        return
      }
      
      if (!cardCvv.trim()) {
        setError('Veuillez saisir le code de sécurité')
        return
      }
      
      setStep('processing')
      processPaymentTransaction()
    }
  }

  const processPaymentTransaction = async () => {
    setLoading(true)
    setError(null)

    try {
      const paymentDetails: PaymentDetails = selectedMethod === 'cash' ? {
        cardNumber: '',
        cardholderName: cardName || 'Cash Payment',
        expiryDate: '',
        cvv: ''
      } : {
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName: cardName,
        expiryDate: cardExpiry,
        cvv: cardCvv
      };

      const result = await processPayment(
        amount,
        paymentDetails,
        customerId
      )
      
      if (result.success) {
        setTransactionId(result.transactionId || '')
        setStep('success')
        
        // Notifier le parent du succès
        if (result.transactionId) {
          onSuccess(result.transactionId)
        }
      } else {
        setError(result.error || 'Une erreur est survenue lors du traitement du paiement')
        setStep('error')
      }
    } catch (error) {
      setError('Une erreur inattendue est survenue')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    // Supprimer tous les espaces et caractères non numériques
    const cleaned = value.replace(/\D/g, '')
    
    // Ajouter un espace tous les 4 chiffres
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ')
    
    return formatted
  }

  const formatExpiry = (value: string) => {
    // Supprimer tous les caractères non numériques
    const cleaned = value.replace(/\D/g, '')
    
    // Format MM/YY
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`
    }
    
    return cleaned
  }

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">Montant à payer</h3>
          <span className="text-xl font-bold text-accent">{amount.toLocaleString()} {currency}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Méthode de paiement</label>
        <select
          value={selectedMethod}
          onChange={(e) => handleMethodSelect(e.target.value as any)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="card">Carte bancaire</option>
          <option value="bank_transfer">Virement bancaire</option>
          <option value="cash">Espèces</option>
        </select>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!selectedMethod}
        >
          Continuer
        </Button>
      </div>
    </div>
  )

  const renderCardDetails = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-gray-900">Paiement par carte</h3>
            <p className="text-sm text-gray-600">{selectedMethod.toUpperCase()}</p>
          </div>
          <span className="text-xl font-bold text-accent">{amount.toLocaleString()} {currency}</span>
        </div>
      </div>
      
      <div className="space-y-4">
        <Input
          label="Nom sur la carte"
          placeholder="PRÉNOM NOM"
          icon={<CreditCard className="w-5 h-5" />}
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
        />
        
        <Input
          label="Numéro de carte"
          placeholder="0000 0000 0000 0000"
          icon={<CreditCard className="w-5 h-5" />}
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          maxLength={19} // 16 chiffres + 3 espaces
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date d'expiration"
            placeholder="MM/YY"
            icon={<Calendar className="w-5 h-5" />}
            value={cardExpiry}
            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
            maxLength={5} // MM/YY
          />
          
          <Input
            label="Code de sécurité"
            placeholder="CVV"
            icon={<Lock className="w-5 h-5" />}
            value={cardCvv}
            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
            maxLength={3}
            type="password"
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep('method')}
        >
          Retour
        </Button>
        <Button
          type="submit"
          disabled={loading}
          loading={loading}
        >
          Payer
        </Button>
      </div>
    </form>
  )

  const renderProcessing = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Traitement en cours</h3>
      <p className="text-gray-600">Veuillez patienter pendant que nous traitons votre paiement...</p>
    </div>
  )

  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Paiement réussi</h3>
      <p className="text-gray-600 mb-6">
        Votre paiement de {amount.toLocaleString()} {currency} a été traité avec succès.
      </p>
      {transactionId && (
        <p className="text-sm text-gray-500 mb-6">
          Référence de transaction: {transactionId}
        </p>
      )}
      <Button onClick={() => onSuccess(transactionId || '')}>
        Continuer
      </Button>
    </div>
  )

  const renderError = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Paiement échoué</h3>
      <p className="text-gray-600 mb-2">
        {error || 'Une erreur est survenue lors du traitement de votre paiement.'}
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Veuillez réessayer ou choisir une autre méthode de paiement.
      </p>
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={() => setStep('method')}
        >
          Changer de méthode
        </Button>
        <Button
          onClick={() => {
            setStep('processing')
            processPaymentTransaction()
          }}
        >
          Réessayer
        </Button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (step) {
      case 'method':
        return renderMethodSelection()
      case 'details':
        return renderCardDetails()
      case 'processing':
        return renderProcessing()
      case 'success':
        return renderSuccess()
      case 'error':
        return renderError()
      default:
        return renderMethodSelection()
    }
  }

  return (
    <Card className="p-6">
      {renderContent()}
    </Card>
  )
}

export default PaymentForm