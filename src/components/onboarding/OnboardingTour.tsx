import { useCallback } from 'react'
import Joyride, { CallBackProps, Step, STATUS } from 'react-joyride'
import { useOnboardingStore } from '@/stores/onboardingStore'

interface OnboardingTourProps {
  steps: Step[]
  run: boolean
  onComplete?: () => void
  onSkip?: () => void
}

export default function OnboardingTour({
  steps,
  run,
  onComplete,
  onSkip,
}: OnboardingTourProps) {
  const { markTourCompleted } = useOnboardingStore()

  const handleJoyrideCallback = useCallback(
    (data: CallBackProps) => {
      const { status } = data
      const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

      if (finishedStatuses.includes(status)) {
        markTourCompleted()

        if (status === STATUS.FINISHED && onComplete) {
          onComplete()
        } else if (status === STATUS.SKIPPED && onSkip) {
          onSkip()
        }
      }
    },
    [markTourCompleted, onComplete, onSkip]
  )

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#2563eb',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        buttonNext: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
        },
        buttonBack: {
          borderRadius: 8,
          padding: '8px 16px',
          marginRight: 8,
        },
        buttonSkip: {
          color: '#6b7280',
        },
      }}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular Tour',
      }}
    />
  )
}
