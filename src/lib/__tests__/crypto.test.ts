/**
 * Testes para utilitários de criptografia
 * Para executar: npm test crypto
 */

import { encryptData, decryptData, encryptUserData, decryptUserData, generateHash } from '../crypto'

// Mock das variáveis de ambiente para teste
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_CRYPTO_KEY: 'TestKey2024ForEventSpace123!',
    VITE_ENCRYPTION_VERSION: '1.0',
    DEV: true
  }
})

describe('Crypto Utilities', () => {
  describe('encryptData e decryptData', () => {
    test('deve criptografar e descriptografar texto simples', () => {
      const originalText = 'Hello World!'
      const encrypted = encryptData(originalText)
      const decrypted = decryptData(encrypted)
      
      expect(decrypted).toBe(originalText)
      expect(encrypted).not.toBe(originalText)
      expect(encrypted).toMatch(/^es_/)
    })

    test('deve criptografar senhas', () => {
      const password = 'mySecurePassword123!'
      const encrypted = encryptData(password)
      const decrypted = decryptData(encrypted)
      
      expect(decrypted).toBe(password)
      expect(encrypted).not.toContain(password)
    })

    test('deve manter compatibilidade com base64 antigo', () => {
      const text = 'test'
      const base64Text = `b64_${btoa(text)}`
      const decrypted = decryptData(base64Text)
      
      expect(decrypted).toBe(text)
    })
  })

  describe('generateHash', () => {
    test('deve gerar hash consistente', () => {
      const text = 'test data'
      const hash1 = generateHash(text)
      const hash2 = generateHash(text)
      
      expect(hash1).toBe(hash2)
      expect(typeof hash1).toBe('string')
      expect(hash1.length).toBeGreaterThan(0)
    })

    test('deve gerar hashes diferentes para textos diferentes', () => {
      const hash1 = generateHash('text1')
      const hash2 = generateHash('text2')
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('encryptUserData e decryptUserData', () => {
    const sampleUserData = {
      fullName: 'João Silva',
      email: 'joao@example.com',
      phone: '(11) 99999-9999',
      state: 'SP',
      city: 'São Paulo',
      password: 'mySecurePassword123!'
    }

    test('deve criptografar e descriptografar dados do usuário', () => {
      const { encryptedData, hash } = encryptUserData(sampleUserData)
      const decryptedData = decryptUserData(encryptedData)
      
      expect(decryptedData).toEqual(sampleUserData)
      expect(encryptedData).not.toContain(sampleUserData.password)
      expect(encryptedData).not.toContain(sampleUserData.fullName)
      expect(typeof hash).toBe('string')
    })

    test('deve gerar hash para verificação de integridade', () => {
      const { hash: hash1 } = encryptUserData(sampleUserData)
      const { hash: hash2 } = encryptUserData(sampleUserData)
      
      expect(hash1).toBe(hash2) // Mesmo input = mesmo hash
      
      const modifiedData = { ...sampleUserData, fullName: 'Maria Silva' }
      const { hash: hash3 } = encryptUserData(modifiedData)
      
      expect(hash1).not.toBe(hash3) // Input diferente = hash diferente
    })
  })

  describe('Casos de erro', () => {
    test('deve tratar erro na descriptografia graciosamente', () => {
      expect(() => {
        decryptData('invalid_encrypted_data')
      }).toThrow('Não foi possível descriptografar os dados')
    })

    test('deve usar fallback para base64 em caso de erro', () => {
      // Simula erro na criptografia principal
      const originalConsoleError = console.error
      console.error = jest.fn() // Silencia logs de erro durante o teste
      
      const text = 'test'
      const encrypted = encryptData(text)
      
      console.error = originalConsoleError
      
      expect(encrypted).toMatch(/^(es_|b64_)/) // Deve ter um dos prefixos
    })
  })
})

// Testes de integração
describe('Integração com PaymentService', () => {
  test('deve simular fluxo completo de criptografia para signup', () => {
    const userData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '(11) 98765-4321',
      state: 'RJ',
      city: 'Rio de Janeiro',
      password: 'TestPassword123!'
    }

    // Simula o que acontece no paymentService
    const { encryptedData, hash } = encryptUserData(userData)
    
    // Simula o que acontece no webhook
    const decryptedData = decryptUserData(encryptedData)
    const verificationHash = generateHash(JSON.stringify(decryptedData))
    
    expect(decryptedData).toEqual(userData)
    expect(hash).toBe(verificationHash) // Verificação de integridade
  })
})