// Regras compartilhadas pelas telas de conta (mesmas do protótipo).
export const emailValido = (valor) => /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(valor);
