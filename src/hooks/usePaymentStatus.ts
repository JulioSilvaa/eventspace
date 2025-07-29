import { useState, useEffect, useCallback } from 'react'
import { paymentService, type PaymentRecord } from '@/services/paymentService'

interface UsePaymentStatusProps {
  paymentId: string | null
  enabled?: boolean
  interval?: number
}

export function usePaymentStatus({ 
  paymentId, 
  enabled = true, 
  interval = 5000 
}: UsePaymentStatusProps) {
  const [payment, setPayment] = useState<PaymentRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentId || !enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const paymentData = await paymentService.getPaymentStatus(paymentId)
      setPayment(paymentData)
    } catch (err) {
      console.error('Error checking payment status:', err)
      setError(err instanceof Error ? err.message : 'Erro ao verificar status do pagamento')
    } finally {
      setIsLoading(false)
    }
  }, [paymentId, enabled])

  useEffect(() => {
    if (!paymentId || !enabled) return

    // Check immediately
    checkPaymentStatus()

    // Set up interval for polling
    const intervalId = setInterval(checkPaymentStatus, interval)

    return () => clearInterval(intervalId)
  }, [checkPaymentStatus, interval, enabled, paymentId])

  return {
    payment,
    isLoading,
    error,
    refetch: checkPaymentStatus
  }
}