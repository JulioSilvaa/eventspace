import { useState } from 'react'

export type UpgradeContext = 'create_ad' | 'feature_ad' | 'generic'

interface UseUpgradeModalReturn {
  isOpen: boolean
  context: UpgradeContext
  openModal: (context: UpgradeContext) => void
  closeModal: () => void
}

export function useUpgradeModal(): UseUpgradeModalReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [context, setContext] = useState<UpgradeContext>('generic')
  
  console.log('🔍 useUpgradeModal state - isOpen:', isOpen)

  const openModal = (newContext: UpgradeContext) => {
    console.log('🚀 openModal called with context:', newContext)
    console.trace('🚀 openModal call stack')
    setContext(newContext)
    setIsOpen(true)
  }

  const closeModal = () => {
    console.log('🔐 closeModal called - before setIsOpen(false)')
    setIsOpen(false)
    console.log('🔐 closeModal called - after setIsOpen(false)')
  }

  return {
    isOpen,
    context,
    openModal,
    closeModal
  }
}