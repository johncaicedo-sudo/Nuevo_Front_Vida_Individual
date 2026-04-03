export interface Option {
  value: string;
  label: string;
}

export interface FormData {
  // Step 1: Cotización
  claveAsesor: string;
  nombreAsesor: string;
  producto: string;
  
  tomadorTipoDoc: string;
  tomadorNumDoc: string;
  tomadorNombres: string;
  tomadorApellidos: string;
  tomadorCorreo: string;
  tomadorAutorizaSMS: boolean;
  tomadorAutorizaDatos: boolean;
  tomadorEsAsegurado: boolean;
  tomadorTieneConyuge: 'SI' | 'NO' | '';
  tomadorTipoPersona: 'natural' | 'juridica';
  
  aseguradoTipoDoc: string;
  aseguradoNumDoc: string;
  aseguradoNombres: string;
  aseguradoApellidos: string;
  aseguradoSexo: string;
  aseguradoFechaNac: string;
  aseguradoEdad: number | null;
  aseguradoCiudad: string;
  aseguradoDireccion: string;
  aseguradoSalarioRaw: string;
  aseguradoSalarioFormatted: string;
  aseguradoRelacion: string;
  aseguradoOcupacion: string;
  aseguradoActividad: string;

  // Step 2: Coberturas & Calculadora
  amparoBasicoRaw: string;
  amparoBasicoFormatted: string;
  periodicidadPrima: 'mensual' | 'semestral' | 'anual';
  // Amparo Básico (Sin costo)
  tieneAsistenciaFuneraria: boolean;
  tieneAuxilioMedicamentos: boolean;
  tieneExoneracionPrimas: boolean;
  // Anexos (Con costo)
  tieneITPEnfermedad: boolean;
  tieneITPAccidente: boolean;
  tieneITPAnticipo: boolean;
  tieneEnfermedadesGravesSuma: boolean;
  tieneEnfermedadesGravesAnticipo: boolean;
  tieneRentaIncapacidad: boolean;
  tieneAccidentesPersonales: boolean;
  
  itpEnfermedadRaw: string;
  itpEnfermedadFormatted: string;
  itpAccidenteRaw: string;
  itpAccidenteFormatted: string;
  itpAnticipoRaw: string;
  itpAnticipoFormatted: string;
  egSumaRaw: string;
  egSumaFormatted: string;
  egAnticipoRaw: string;
  egAnticipoFormatted: string;
  apRaw: string;
  apFormatted: string;
  
  objetivoAhorro: 'viajes' | 'educacion' | 'pension' | 'ninguno';
  ahorroPeriodicidad: 'mensual' | 'trimestral' | 'semestral' | 'anual';
  ahorroTab: 'rentas' | 'necesidades';
  
  // Rentas Complementarias
  rentaAniosDuracion: number;
  rentaAporteInicialRaw: string;
  rentaAporteInicialFormatted: string;
  rentaCuotaMensualRaw: string;
  rentaCuotaMensualFormatted: string;
  rentaAniosAhorrando: number;
  rentaAcumuladoFuturo: string;
  rentaMensualHoy: string;
  rentaMensualFuturo: string;

  // Otras Necesidades
  necesidadDescripcion: string;
  necesidadCapitalHoyRaw: string;
  necesidadCapitalHoyFormatted: string;
  necesidadAnios: number;
  necesidadCapitalFuturo: string;
  necesidadCuotaMensualRaw: string;
  necesidadCuotaMensualFormatted: string;

  ahorroMensualRaw: string;
  ahorroMensualFormatted: string;
  proyeccionAnios: number;

  // Step 3: Salud
  pesoKg: string;
  estaturaCm: string;
  imc: number | null;
  respuestasSalud: Record<string, string>;
  requiereExamenes: boolean;
  numDeclaracion: string | null;
  numSolicitudExamen: string | null;
  extraPrima: number; // Porcentaje de recargo

  // Step 4: Emisión
  metodoPago: 'pse' | 'debito' | 'financiacion' | '';
  otpEnviado: boolean;
  otpValidado: boolean;
  refNombre: string;
  refTel: string;
  files: string[];
}

export type Route = 'home' | 'vida_individual' | 'autos' | 'salud' | 'consulta' | 'firma';
