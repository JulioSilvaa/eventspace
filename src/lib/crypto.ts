/**
 * Utilitários de criptografia para dados sensíveis
 * Usado principalmente para criptografar senhas antes de enviar via metadata do Stripe
 */

// Chave para criptografia - usa variável de ambiente ou fallback
const CRYPTO_KEY = import.meta.env.VITE_CRYPTO_KEY || 'EventSpace2024SecureKey'


/**
 * Valida a força da chave de criptografia
 */
function validateCryptoKey(key: string): boolean {
  // Chave deve ter pelo menos 16 caracteres
  if (key.length < 16) {
    console.warn('⚠️  Chave de criptografia muito curta. Recomendado: mínimo 32 caracteres')
    return false
  }
  
  // Chave deve conter letras, números e símbolos
  const hasLetter = /[a-zA-Z]/.test(key)
  const hasNumber = /\d/.test(key)
  
  if (!hasLetter || !hasNumber) {
    console.warn('⚠️  Chave de criptografia fraca. Recomendado: letras, números e símbolos')
    return false
  }
  
  return true
}

// Valida a chave na inicialização
if (import.meta.env.DEV) {
  validateCryptoKey(CRYPTO_KEY)
}

/**
 * Criptografa uma string usando um algoritmo otimizado para Stripe metadata (limite 500 chars)
 */
export function encryptData(data: string): string {
  try {
    // Comprime o JSON primeiro removendo espaços desnecessários
    const compressedData = data.replace(/\s+/g, '')
    
    // Converte a chave em array de números (usa apenas os primeiros 8 chars para eficiência)
    const keyChars = CRYPTO_KEY.substring(0, 8).split('').map(char => char.charCodeAt(0))
    
    // Criptografa cada caractere usando XOR mais compacto
    const encrypted = compressedData.split('').map((char, index) => {
      const charCode = char.charCodeAt(0)
      const keyChar = keyChars[index % keyChars.length]
      const xorResult = charCode ^ keyChar
      return xorResult.toString(36) // Base36 é mais compacto que hex
    }).join('')
    
    // Prefixo mais curto para economizar espaço
    return `v2_${encrypted}`
  } catch (error) {
    console.error('Erro ao criptografar dados:', error)
    // Fallback para base64 se houver erro
    return `b64_${btoa(data)}`
  }
}

/**
 * Descriptografa uma string criptografada com encryptData
 */
export function decryptData(encryptedData: string): string {
  try {
    // Verifica o prefixo para determinar o método
    if (encryptedData.startsWith('v2_')) {
      // Nova versão otimizada (XOR + Base36)
      const encrypted = encryptedData.substring(3)
      const keyChars = CRYPTO_KEY.substring(0, 8).split('').map(char => char.charCodeAt(0))
      
      // Descriptografa usando XOR reverso
      const decrypted = encrypted.split('').map((char, index) => {
        const charCode = parseInt(char, 36)
        const keyChar = keyChars[index % keyChars.length]
        return String.fromCharCode(charCode ^ keyChar)
      }).join('')
      
      return decrypted
    } else if (encryptedData.startsWith('es_')) {
      // Versão anterior (compatibilidade)
      const encrypted = encryptedData.substring(3)
      const keyChars = CRYPTO_KEY.split('').map(char => char.charCodeAt(0))
      
      // Divide a string em blocos de 4 caracteres
      const blocks = encrypted.match(/.{4}/g) || []
      
      // Descriptografa cada bloco
      const decrypted = blocks.map((block, index) => {
        const charCode = parseInt(block, 16)
        const keyChar = keyChars[index % keyChars.length]
        return String.fromCharCode(charCode - keyChar)
      }).join('')
      
      return decrypted
    } else if (encryptedData.startsWith('b64_')) {
      // Fallback para base64
      return atob(encryptedData.substring(4))
    } else {
      // Assume base64 antigo (compatibilidade)
      return atob(encryptedData)
    }
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error)
    throw new Error('Não foi possível descriptografar os dados')
  }
}

/**
 * Gera um hash simples para verificação de integridade
 */
export function generateHash(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Converte para 32bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * Criptografa dados de usuário para envio seguro
 */
export function encryptUserData(userData: {
  fullName: string
  email: string
  phone: string
  state: string
  city: string
  password: string
}): {
  encryptedData: string
  hash: string
} {
  const dataString = JSON.stringify(userData)
  const encryptedData = encryptData(dataString)
  const hash = generateHash(dataString)
  
  return {
    encryptedData,
    hash
  }
}

/**
 * Descriptografa dados de usuário
 */
export function decryptUserData(encryptedData: string): {
  fullName: string
  email: string
  phone: string
  state: string
  city: string
  password: string
} {
  const decryptedString = decryptData(encryptedData)
  return JSON.parse(decryptedString)
}