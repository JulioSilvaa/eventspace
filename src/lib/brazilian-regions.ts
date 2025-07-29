/**
 * Brazilian States and Regions Mapping
 * 
 * Provides utilities to map Brazilian state codes to their respective regions
 * and get comprehensive state information for forms and location features.
 */

export interface BrazilianState {
  code: string
  name: string
  region: string
}

// Complete mapping of Brazilian states to regions
const BRAZILIAN_STATES: BrazilianState[] = [
  // Norte
  { code: 'AC', name: 'Acre', region: 'Norte' },
  { code: 'AP', name: 'Amapá', region: 'Norte' },
  { code: 'AM', name: 'Amazonas', region: 'Norte' },
  { code: 'PA', name: 'Pará', region: 'Norte' },
  { code: 'RO', name: 'Rondônia', region: 'Norte' },
  { code: 'RR', name: 'Roraima', region: 'Norte' },
  { code: 'TO', name: 'Tocantins', region: 'Norte' },
  
  // Nordeste
  { code: 'AL', name: 'Alagoas', region: 'Nordeste' },
  { code: 'BA', name: 'Bahia', region: 'Nordeste' },
  { code: 'CE', name: 'Ceará', region: 'Nordeste' },
  { code: 'MA', name: 'Maranhão', region: 'Nordeste' },
  { code: 'PB', name: 'Paraíba', region: 'Nordeste' },
  { code: 'PE', name: 'Pernambuco', region: 'Nordeste' },
  { code: 'PI', name: 'Piauí', region: 'Nordeste' },
  { code: 'RN', name: 'Rio Grande do Norte', region: 'Nordeste' },
  { code: 'SE', name: 'Sergipe', region: 'Nordeste' },
  
  // Centro-Oeste
  { code: 'DF', name: 'Distrito Federal', region: 'Centro-Oeste' },
  { code: 'GO', name: 'Goiás', region: 'Centro-Oeste' },
  { code: 'MT', name: 'Mato Grosso', region: 'Centro-Oeste' },
  { code: 'MS', name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },
  
  // Sudeste
  { code: 'ES', name: 'Espírito Santo', region: 'Sudeste' },
  { code: 'MG', name: 'Minas Gerais', region: 'Sudeste' },
  { code: 'RJ', name: 'Rio de Janeiro', region: 'Sudeste' },
  { code: 'SP', name: 'São Paulo', region: 'Sudeste' },
  
  // Sul
  { code: 'PR', name: 'Paraná', region: 'Sul' },
  { code: 'RS', name: 'Rio Grande do Sul', region: 'Sul' },
  { code: 'SC', name: 'Santa Catarina', region: 'Sul' }
]

// Create lookup maps for performance
const STATE_TO_REGION_MAP = new Map<string, string>()
const STATE_TO_NAME_MAP = new Map<string, string>()

BRAZILIAN_STATES.forEach(state => {
  STATE_TO_REGION_MAP.set(state.code, state.region)
  STATE_TO_NAME_MAP.set(state.code, state.name)
})

/**
 * Gets the region for a given state code
 * @param stateCode - Two-letter state code (e.g., 'SP', 'RJ')
 * @returns Region name or 'Sudeste' as fallback
 */
export function getRegionFromState(stateCode: string): string {
  if (!stateCode) return 'Sudeste' // Default fallback
  
  const region = STATE_TO_REGION_MAP.get(stateCode.toUpperCase())
  return region || 'Sudeste' // Fallback to Sudeste if state not found
}

/**
 * Gets the full state name for a given state code
 * @param stateCode - Two-letter state code (e.g., 'SP', 'RJ')
 * @returns Full state name or empty string if not found
 */
export function getStateNameFromCode(stateCode: string): string {
  if (!stateCode) return ''
  
  return STATE_TO_NAME_MAP.get(stateCode.toUpperCase()) || ''
}

/**
 * Gets complete state information for a given state code
 * @param stateCode - Two-letter state code (e.g., 'SP', 'RJ')
 * @returns BrazilianState object or null if not found
 */
export function getStateInfo(stateCode: string): BrazilianState | null {
  if (!stateCode) return null
  
  return BRAZILIAN_STATES.find(state => 
    state.code.toLowerCase() === stateCode.toLowerCase()
  ) || null
}

/**
 * Gets all Brazilian states
 * @returns Array of all Brazilian states
 */
export function getAllStates(): BrazilianState[] {
  return [...BRAZILIAN_STATES] // Return a copy to prevent mutations
}

/**
 * Gets all states from a specific region
 * @param region - Region name (e.g., 'Sudeste', 'Sul')
 * @returns Array of states in the region
 */
export function getStatesByRegion(region: string): BrazilianState[] {
  return BRAZILIAN_STATES.filter(state => 
    state.region.toLowerCase() === region.toLowerCase()
  )
}

/**
 * Gets all unique regions
 * @returns Array of region names
 */
export function getAllRegions(): string[] {
  const regions = new Set(BRAZILIAN_STATES.map(state => state.region))
  return Array.from(regions).sort()
}

/**
 * Validates if a state code is valid
 * @param stateCode - State code to validate
 * @returns True if valid, false otherwise
 */
export function isValidStateCode(stateCode: string): boolean {
  if (!stateCode) return false
  
  return STATE_TO_REGION_MAP.has(stateCode.toUpperCase())
}

/**
 * Validates if a region name is valid
 * @param region - Region name to validate
 * @returns True if valid, false otherwise
 */
export function isValidRegion(region: string): boolean {
  if (!region) return false
  
  return BRAZILIAN_STATES.some(state => 
    state.region.toLowerCase() === region.toLowerCase()
  )
}

/**
 * Creates user profile data with properly mapped region
 * Useful for registration/profile creation flows
 */
export function createProfileWithRegion(userData: {
  state: string
  city: string
  [key: string]: unknown
}): {
  region: string
  [key: string]: unknown
} {
  const region = getRegionFromState(userData.state)
  
  return {
    ...userData,
    region
  }
}

// Export the raw data for compatibility with existing code
export { BRAZILIAN_STATES }

// For backward compatibility with existing getBrazilianStates function
export function getBrazilianStates(): Promise<BrazilianState[]> {
  return Promise.resolve(getAllStates())
}