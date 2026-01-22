const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  hour: '2-digit',
  minute: '2-digit'
})

const numberFormatter = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})

export const formatDate = (date: Date | string): string => {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return dateFormatter.format(d)
  } catch (e) {
    return ''
  }
}

export const formatTime = (date: Date | string): string => {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return timeFormatter.format(d)
  } catch (e) {
    return ''
  }
}

export const formatDateTime = (date: Date | string): string => {
  const dateStr = formatDate(date)
  const timeStr = formatTime(date)
  return dateStr && timeStr ? `${dateStr} à ${timeStr}` : ''
}

export const formatCurrency = (amount: number, currency = 'DA'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 DA'
  const formatted = numberFormatter.format(amount)
  return `${formatted} ${currency}`
}

export const formatPrice = (amount: number, showTTC = false): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 DA'
  const formatted = numberFormatter.format(amount)
  return showTTC ? `${formatted} DA TTC` : `${formatted} DA`
}

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num)
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`
}

export const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ''

  const cleaned = phone.replace(/[\s\-\(\)]/g, '')

  // Format algérien avec +213
  if (cleaned.startsWith('+213')) {
    const number = cleaned.substring(4)
    if (number.length === 9) {
      return `+213 ${number.substring(0, 1)} ${number.substring(1, 3)} ${number.substring(3, 6)} ${number.substring(6)}`
    }
    return cleaned
  }

  // Format algérien avec 0
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8)}`
  }

  return phone
}
