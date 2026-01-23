import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatPrice(price: number | null | undefined, priceType: string | null | undefined): string {
  if (price === null || price === undefined || isNaN(Number(price))) {
    return 'Consulte'
  }

  const formatted = formatCurrency(Number(price))
  const type = priceType || 'diaria'

  // Mapping for display (could use PRICING_TYPES[type].unit but keeping it simple here)
  const periodMap: Record<string, string> = {
    'diaria': 'dia',
    'daily': 'dia', // Legacy fallback
    'day': 'dia', // Legacy fallback
    'hora': 'hora',
    'hourly': 'hora', // Legacy fallback
    'final_de_semana': 'final de semana',
    'weekend': 'final de semana', // Legacy fallback
    'evento': 'evento',
    'event': 'evento', // Legacy fallback
    'pessoa': 'pessoa',
    'person': 'pessoa', // Legacy fallback
    'unidade': 'unidade',
    'conjunto': 'jogo',
    'pernoite': 'noite'
  }

  const period = periodMap[type] || 'dia'
  return `${formatted}/${period}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9 -]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim()
}