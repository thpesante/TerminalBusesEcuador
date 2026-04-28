/**
 * Validador de Cédula Ecuatoriana (Algoritmo Módulo 10)
 * Implementación local para evitar latencia y dependencia de scrapers externos.
 */
export const validarCedula = (cedula: string): boolean => {
  if (cedula.length !== 10) return false;
  if (!/^\d+$/.test(cedula)) return false;

  const provincia = parseInt(cedula.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const tercerDigito = parseInt(cedula.substring(2, 3), 10);
  if (tercerDigito >= 6) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cedula.substring(i, i + 1), 10) * coeficientes[i];
    if (valor >= 10) valor -= 9;
    suma += valor;
  }

  const digitoVerificador = parseInt(cedula.substring(9, 10), 10);
  const residuo = suma % 10;
  const resultado = residuo === 0 ? 0 : 10 - residuo;

  return resultado === digitoVerificador;
};

/**
 * Validador de RUC Ecuatoriano (Simplificado para Estructura y Persona Natural/Jurídica)
 * Misión: Validar longitud (13), establecimiento (001+) y estructura básica.
 */
export const validarRUC = (ruc: string): boolean => {
  if (ruc.length !== 13) return false;
  if (!/^\d+$/.test(ruc)) return false;

  const provincia = parseInt(ruc.substring(0, 2), 10);
  if (provincia < 1 || provincia > 24) return false;

  const establecimiento = ruc.substring(10, 13);
  if (establecimiento === '000') return false;

  const tercerDigito = parseInt(ruc.substring(2, 3), 10);

  if (tercerDigito < 6) {
    // Persona Natural: Los primeros 10 dígitos son una cédula válida
    return validarCedula(ruc.substring(0, 10));
  } else if (tercerDigito === 6) {
    // Entidad Pública: Módulo 11 (Opcional implementar lógica completa, aquí validamos longitud)
    return true; 
  } else if (tercerDigito === 9) {
    // Persona Jurídica / Privada: Módulo 11 (Opcional implementar lógica completa, aquí validamos longitud)
    return true;
  }

  return false;
};
