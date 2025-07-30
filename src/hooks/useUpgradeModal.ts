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
  

  const openModal = (newContext: UpgradeContext) => {
    setContext(newContext)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    context,
    openModal,
    closeModal
  }
}