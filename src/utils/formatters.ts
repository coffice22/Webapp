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

export const formatCurrency = (amount: number, currency: string = 'DZD'): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 DZD'
  return `${numberFormatter.format(amount)} ${currency}`
}

export const formatPrice = (amount: number, showTTC: boolean = true): string => {
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
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`
  }
  return phone
}
