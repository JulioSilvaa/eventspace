export const maskPhone = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 10) {
    return value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (value.length > 5) {
    return value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else if (value.length > 2) {
    return value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
  } else {
    return value.replace(/(\d{0,2})/, "($1");
  }
};

export const maskCEP = (value: string) => {
  if (!value) return "";
  value = value.replace(/\D/g, "");
  if (value.length > 8) value = value.slice(0, 8);

  return value.replace(/(\d{5})(\d{0,3})/, "$1-$2").replace(/-$/, "");
};

export const unmask = (value: string) => {
  return value.replace(/\D/g, "");
};
