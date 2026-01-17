// Flexible Money Mask: Allows digits, dots and commas. "Free" input.
export const maskMoneyFlexible = (value: string) => {
  if (!value) return "";
  // Check for more than one comma, prevent it
  const parts = value.split(',');
  if (parts.length > 2) return parts[0] + ',' + parts.slice(1).join('');

  // Allow digits, one comma, multiple dots (though dots are typically thousands)
  return value.replace(/[^\d,.]/g, "");
};
export const maskPhone = (value: string) => {
  if (!value) return "";

  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, "");

  // Limita a 11 dígitos
  const limit = numbers.slice(0, 11);

  let formatted = limit;

  if (limit.length > 2) {
    formatted = `(${limit.slice(0, 2)}) ${limit.slice(2)}`;
  }

  if (limit.length > 6) {
    if (limit.length === 11) {
      // Formato para celular com 9 dígitos: (11) 91234-5678
      formatted = `(${limit.slice(0, 2)}) ${limit.slice(2, 7)}-${limit.slice(7)}`;
    } else {
      // Formato para fixo ou celular incompleto: (11) 1234-5678
      formatted = `(${limit.slice(0, 2)}) ${limit.slice(2, 6)}${limit.length > 6 ? "-" + limit.slice(6) : ""
        }`;
    }
  }

  return formatted;
};

export const maskCEP = (value: string) => {
  if (!value) return "";

  const numbers = value.replace(/\D/g, "");
  const limit = numbers.slice(0, 8);

  let formatted = limit;

  if (limit.length > 5) {
    formatted = `${limit.slice(0, 5)}-${limit.slice(5)}`;
  }

  return formatted;
};

export const maskCurrency = (value: string) => {
  // Prevent multiple commas
  if ((value.match(/,/g) || []).length > 1) {
    return value.slice(0, -1);
  }

  // Remove everything that is not digit or comma
  const cleanValue = value.replace(/[^\d,]/g, "");

  // Ensure only one comma exists (handled above but good to be safe)
  // Split into integer and decimal parts
  const parts = cleanValue.split(",");

  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Remove leading zeros from integer part unless it's just "0"
  if (integerPart.length > 1 && integerPart.startsWith("0")) {
    integerPart = integerPart.replace(/^0+/, "");
  }
  if (integerPart === "") integerPart = "0";

  // Format integer part with thousands separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  let formatted = `R$ ${formattedInteger}`;

  // If there is a comma, add it and the decimal part (max 2 digits)
  if (decimalPart !== undefined) {
    formatted += `,${decimalPart.slice(0, 2)}`;
  }

  return formatted;
};

// Simple Integer Mask: 1234 -> 1.234
export const maskInteger = (value: string) => {
  if (!value) return "";
  const cleanValue = value.replace(/\D/g, "");
  return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const unmask = (value: string) => {
  return value.replace(/\D/g, "");
};
