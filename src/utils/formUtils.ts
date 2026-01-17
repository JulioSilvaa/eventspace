import { UseFormSetValue } from 'react-hook-form';

/**
 * Generic handler to apply masks and preserve cursor position
 * works with react-hook-form
 */
export const handleMaskedChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  maskFn: (val: string) => string,
  fieldName: string,
  setValue: UseFormSetValue<any>
) => {
  const input = e.target;
  const start = input.selectionStart || 0;
  const rawValue = input.value;

  // 1. Calculate how many "significant characters" (digits + comma) are before the cursor
  // This helps us place the cursor back after masking changes the separators (dots, spaces).
  let significantCharsBefore = 0;
  for (let i = 0; i < start; i++) {
    if (/[\d,]/.test(rawValue[i])) {
      significantCharsBefore++;
    }
  }

  // 2. Apply the mask
  const masked = maskFn(rawValue);

  // 3. Update the value in the DOM and React Hook Form
  input.value = masked;
  setValue(fieldName, masked, { shouldValidate: true });

  // 4. Restore cursor position
  // Walk through the *new* masked string. Every time we encounter a significant char,
  // we decrement our counter. When counter hits 0, that's our position.
  let newCursorPos = 0;
  let matchesFound = 0;

  for (let i = 0; i < masked.length; i++) {
    if (/[\d,]/.test(masked[i])) {
      matchesFound++;
    }
    // Always advance cursor until we've found all our previous significant chars
    // plus keep going if we are sitting on a non-significant char (like a dot or space)
    // slightly heuristic: strictly stops AFTER the last matching digit
    if (matchesFound === significantCharsBefore) {
      newCursorPos = i + 1;
      break;
    }
  }

  // Edge case: if we deleted everything, or cursor was at start
  if (significantCharsBefore === 0) newCursorPos = 0;
  // Edge case: don't let cursor go beyond length
  if (newCursorPos > masked.length) newCursorPos = masked.length;

  // Use requestAnimationFrame or setTimeout to ensure DOM update is processed
  // setTimeout is safer for React's synthetic events
  setTimeout(() => {
    input.setSelectionRange(newCursorPos, newCursorPos);
  }, 0);
};

// Specialized handler for Currency (ATM style)
// Always puts cursor at the end because editing middle of "0,01" is confusing
export const handleCurrencyChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  maskFn: (val: string) => string,
  fieldName: string,
  setValue: UseFormSetValue<any>
) => {
  const input = e.target;
  const value = input.value;

  const masked = maskFn(value);

  input.value = masked;
  setValue(fieldName, masked, { shouldValidate: true });

  // Force cursor to end
  setTimeout(() => {
    input.setSelectionRange(masked.length, masked.length);
  }, 0);
};


export const parseCurrency = (value: any): number => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  // Remove currency symbol, spaces, points (thousand separators)
  // Keep comma and numbers
  // Then replace comma with dot
  const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};
