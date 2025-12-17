/**
 * Consent Service - LGPD Compliance
 * 
 * Handles all consent-related operations including:
 * - Recording user consent for terms of service and privacy policy
 * - Tracking consent versions and timestamps
 * - Managing consent withdrawal
 * - Providing consent status checks
 */

import { apiClient } from '@/lib/api-client'
import type {
  ConsentRecord,
  ConsentStatus,
  ConsentType
} from '@/types'
import { DOCUMENT_VERSIONS } from '@/types'

/**
 * Gets the user's IP address for consent records
 */
async function getUserIP(): Promise<string | undefined> {
  try {
    // In production, you might want to use a more reliable IP detection service
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.warn('Could not fetch user IP:', error)
    return undefined
  }
}

/**
 * Gets the user agent string
 */
function getUserAgent(): string {
  return navigator.userAgent
}

/**
 * Records consent for a specific type (terms_of_service, privacy_policy, marketing)
 */
export async function recordConsent(
  userId: string,
  consentType: ConsentType,
  consentGiven: boolean = true,
  documentVersion?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ip_address = await getUserIP()
    const user_agent = getUserAgent()

    // Use provided version or current version
    const version = documentVersion || DOCUMENT_VERSIONS[consentType as keyof typeof DOCUMENT_VERSIONS] || '1.0'

    const consentData: Omit<ConsentRecord, 'id' | 'created_at' | 'updated_at' | 'withdrawal_timestamp' | 'withdrawal_reason'> = {
      user_id: userId,
      consent_type: consentType,
      consent_given: consentGiven,
      consent_timestamp: new Date().toISOString(),
      document_version: version,
      ip_address,
      user_agent
    }

    const { error } = await apiClient.post('/api/consent', consentData)

    if (error) {
      console.error('Error recording consent:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Exception recording consent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Records consent for both terms of service and privacy policy
 * This is typically called during user registration
 */
export async function recordRegistrationConsent(
  userId: string,
  ip_address?: string,
  user_agent?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const detectedIP = ip_address || await getUserIP()
    const detectedUA = user_agent || getUserAgent()

    const timestamp = new Date().toISOString()

    const consentRecords = [
      {
        user_id: userId,
        consent_type: 'terms_of_service' as ConsentType,
        consent_given: true,
        consent_timestamp: timestamp,
        document_version: DOCUMENT_VERSIONS.terms_of_service,
        ip_address: detectedIP,
        user_agent: detectedUA
      },
      {
        user_id: userId,
        consent_type: 'privacy_policy' as ConsentType,
        consent_given: true,
        consent_timestamp: timestamp,
        document_version: DOCUMENT_VERSIONS.privacy_policy,
        ip_address: detectedIP,
        user_agent: detectedUA
      }
    ]

    const { error } = await apiClient.post('/api/consent/registration', { consents: consentRecords })

    if (error) {
      console.error('Error recording registration consent:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Exception recording registration consent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Withdraws consent by updating the withdrawal timestamp
 */
export async function withdrawConsent(
  userId: string,
  consentType: ConsentType,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await apiClient.post('/api/consent/withdraw', {
      userId,
      consentType,
      reason
    })

    if (error) {
      console.error('Error withdrawing consent:', error)
      // Return success false but handle simpler error from backend
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Exception withdrawing consent:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Gets the current consent status for a user
 */
export async function getConsentStatus(userId: string): Promise<ConsentStatus | null> {
  try {
    const { data, error } = await apiClient.get<ConsentStatus>(`/api/consent/status/${userId}`)

    if (error) {
      console.error('Error fetching consent status:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('Exception fetching consent status:', error)
    return null
  }
}

/**
 * Checks if user has given required consents (terms + privacy)
 */
export async function hasRequiredConsents(userId: string): Promise<boolean> {
  const status = await getConsentStatus(userId)
  return status?.has_required_consents || false
}

/**
 * Checks if user consents are for current document versions
 */
export async function hasCurrentConsentVersions(userId: string): Promise<boolean> {
  const status = await getConsentStatus(userId)
  return status?.has_current_consent_versions || false
}

/**
 * Gets full consent history for a user (for audit purposes)
 */
export async function getConsentHistory(userId: string): Promise<ConsentRecord[]> {
  try {
    const { data, error } = await apiClient.get<ConsentRecord[]>(`/api/consent/history/${userId}`)

    if (error) {
      console.error('Error fetching consent history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Exception fetching consent history:', error)
    return []
  }
}

/**
 * Validates that consent data is complete for LGPD compliance
 */
export function validateConsentData(consent: Partial<ConsentRecord>): boolean {
  return !!(
    consent.user_id &&
    consent.consent_type &&
    typeof consent.consent_given === 'boolean' &&
    consent.consent_timestamp &&
    consent.document_version
  )
}

/**
 * Generates a consent summary for display to users
 */
export function formatConsentSummary(status: ConsentStatus): string {
  if (!status.has_required_consents) {
    return 'Consentimentos pendentes'
  }

  if (!status.has_current_consent_versions) {
    return 'Atualization de consentimentos necessária'
  }

  return `Termos aceitos em ${new Date(status.terms_accepted_at!).toLocaleDateString('pt-BR')}`
}

/**
 * Exports user consent data in a LGPD-compliant format
 * This can be used for data portability requests
 */
export async function exportUserConsentData(userId: string): Promise<{
  consents: ConsentRecord[]
  summary: ConsentStatus | null
  exported_at: string
}> {
  const consents = await getConsentHistory(userId)
  const summary = await getConsentStatus(userId)

  return {
    consents,
    summary,
    exported_at: new Date().toISOString()
  }
}