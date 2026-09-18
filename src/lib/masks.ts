export function maskCPF(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 9) return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  if (digits.length > 6) return digits.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  if (digits.length > 3) return digits.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  return digits;
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length > 7) return digits.replace(/(\d{2})(\d{5})(\d{1,4})/, "$1 $2-$3");
  if (digits.length > 2) return digits.replace(/(\d{2})(\d{1,5})/, "$1 $2");
  return digits;
}
