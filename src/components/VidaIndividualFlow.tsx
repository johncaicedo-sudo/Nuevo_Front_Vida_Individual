import React, { useState, useCallback, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Calculator, 
  Shield, 
  UserCheck, 
  Smartphone, 
  Search, 
  TrendingUp, 
  Target,
  AlertTriangle,
  Mail,
  X,
  Download,
  History,
  Edit,
} from 'lucide-react';
import { Input, Select, Checkbox, AccordionSection, SmartQuestion } from './ui/FormElements';
import { FormData, Option } from '../types';

const formatCurrency = (value: string | number) => {
  if (value === null || value === undefined || value === '') return '$ 0';
  const num = value.toString().replace(/\D/g, '');
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(Number(num));
};

const parseCurrency = (value: string) => (value ? value.toString().replace(/\D/g, '') : '');

const calcularEdad = (fecha: string) => {
  if (!fecha) return null;
  const hoy = new Date();
  const cumple = new Date(fecha);
  let edad = hoy.getFullYear() - cumple.getFullYear();
  const m = hoy.getMonth() - cumple.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
  return edad;
};

const generarNumero = (prefijo: string, longitud: number) =>
  prefijo + Math.floor(Math.random() * Math.pow(10, longitud)).toString().padStart(longitud, '0');

const CoverageRow = ({
  label,
  name,
  checked,
  onChange,
  amount,
  amountName,
  onAmountChange,
  premium,
  isFree = false,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: any;
  amount?: string;
  amountName?: string;
  onAmountChange?: any;
  premium?: string;
  isFree?: boolean;
}) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 group hover:bg-gray-50 px-2 rounded-lg transition-colors">
    <div className="flex items-center gap-3 flex-1">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={isFree}
        className="accent-bolivar-green h-4 w-4 rounded border-gray-300 cursor-pointer disabled:opacity-50"
      />
      <span className={`text-xs font-semibold ${checked ? 'text-bolivar-green' : 'text-gray-500'}`}>{label}</span>
    </div>
    <div className="flex items-center gap-8 text-right">
      {amountName ? (
        <div className="flex flex-col items-end min-w-[140px]">
          <span className="text-[8px] uppercase text-gray-400 font-extrabold tracking-tighter leading-none mb-0.5">SUMA ASEGURADA</span>
          <input
            type="text"
            inputMode="numeric"
            name={amountName}
            value={amount}
            onChange={onAmountChange}
            disabled={!checked}
            placeholder="$ 0"
            className="text-xs font-bold text-gray-700 bg-transparent border-b border-gray-200 focus:border-bolivar-green outline-none text-right w-full disabled:opacity-30 disabled:cursor-not-allowed"
          />
        </div>
      ) : amount ? (
        <div className="flex flex-col items-end min-w-[120px]">
          <span className="text-[8px] uppercase text-gray-400 font-extrabold tracking-tighter leading-none mb-0.5">SUMA ASEGURADA</span>
          <span className="text-xs font-bold text-gray-700">{amount}</span>
        </div>
      ) : null}
      <div className="w-20 flex flex-col items-end">
        <span className="text-[8px] uppercase text-gray-400 font-extrabold tracking-tighter leading-none mb-0.5">PRIMA</span>
        {isFree ? (
          <span className="text-[9px] font-black text-modern-green bg-green-50 px-1.5 py-0.5 rounded border border-green-100">SIN COSTO</span>
        ) : (
          <span className="text-xs font-bold text-modern-green">{premium || '$ 0'}</span>
        )}
      </div>
    </div>
  </div>
);

const opcionesDoc: Option[] = [
  { value: 'CC', label: 'Cédula de Ciudadanía' },
  { value: 'CE', label: 'Cédula de Extranjería' },
];
const opcionesSexo: Option[] = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Femenino' },
  { value: 'O', label: 'Otro' },
];
const opcionesRelacion: Option[] = [
  { value: 'I', label: 'Independiente' },
  { value: 'D', label: 'Dependiente / Empleado' },
  { value: 'H', label: 'Hogar' },
];

interface VidaIndividualFlowProps {
  historialCotizaciones: any[];
  setHistorialCotizaciones: React.Dispatch<React.SetStateAction<any[]>>;
}

export const VidaIndividualFlow: React.FC<VidaIndividualFlowProps> = ({
  historialCotizaciones,
  setHistorialCotizaciones
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmitting, setIsEmitting] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [emailToSend, setEmailToSend] = useState('');
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [showConflictPopup, setShowConflictPopup] = useState(false);
  const [isQuoteSaved, setIsQuoteSaved] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [isSaludExpanded, setIsSaludExpanded] = useState(true);
  const [isMedicaExpanded, setIsMedicaExpanded] = useState(false);
  const [isDeclarationPresented, setIsDeclarationPresented] = useState(false);
  const [isDeclarationConfirmed, setIsDeclarationConfirmed] = useState(false);
  const [showDeclarationConfirmModal, setShowDeclarationConfirmModal] = useState(false);
  const [showSurchargeWarning, setShowSurchargeWarning] = useState(false);
  const [hasSecondQuote, setHasSecondQuote] = useState(false);
  const [showStep2FinalizeConfirm, setShowStep2FinalizeConfirm] = useState(false);

  const sessionData = useMemo(
    () => ({
      numCotizacion: generarNumero('COT-', 8),
      fechaCotizacion: new Date().toLocaleDateString('es-CO'),
      claveAsesor: 'AS-998877',
      fechaVigencia: new Date(Date.now() + 86400000).toLocaleDateString('es-CO'),
    }),
    []
  );

  const [formData, setFormData] = useState<FormData>({
    claveAsesor: '',
    nombreAsesor: '',
    producto: 'tranquilidad',
    tomadorTipoDoc: 'CC',
    tomadorNumDoc: '',
    tomadorNombres: '',
    tomadorApellidos: '',
    tomadorCorreo: '',
    tomadorAutorizaSMS: false,
    tomadorAutorizaDatos: false,
    tomadorEsAsegurado: true,
    tomadorTieneConyuge: '',
    tomadorTipoPersona: 'natural',
    aseguradoTipoDoc: 'CC',
    aseguradoNumDoc: '',
    aseguradoNombres: '',
    aseguradoApellidos: '',
    aseguradoSexo: '',
    aseguradoFechaNac: '',
    aseguradoEdad: null,
    aseguradoCiudad: '',
    aseguradoDireccion: '',
    aseguradoSalarioRaw: '',
    aseguradoSalarioFormatted: '',
    aseguradoRelacion: '',
    aseguradoOcupacion: '',
    aseguradoActividad: '',
    amparoBasicoRaw: '',
    amparoBasicoFormatted: '',
    periodicidadPrima: 'mensual',
    // Amparo Básico (Sin costo)
    tieneAsistenciaFuneraria: true,
    tieneAuxilioMedicamentos: true,
    tieneExoneracionPrimas: true,
    tieneITPEnfermedad: false,
    tieneITPAccidente: false,
    tieneITPAnticipo: false,
    tieneEnfermedadesGravesSuma: false,
    tieneEnfermedadesGravesAnticipo: false,
    tieneRentaIncapacidad: false,
    tieneAccidentesPersonales: false,
    itpEnfermedadRaw: '',
    itpEnfermedadFormatted: '',
    itpAccidenteRaw: '',
    itpAccidenteFormatted: '',
    itpAnticipoRaw: '',
    itpAnticipoFormatted: '',
    egSumaRaw: '',
    egSumaFormatted: '',
    egAnticipoRaw: '',
    egAnticipoFormatted: '',
    apRaw: '',
    apFormatted: '',
    ahorroPeriodicidad: 'mensual',
    ahorroTab: 'rentas',
    rentaAniosDuracion: 0,
    rentaAporteInicialRaw: '',
    rentaAporteInicialFormatted: '',
    rentaCuotaMensualRaw: '',
    rentaCuotaMensualFormatted: '',
    rentaAniosAhorrando: 0,
    rentaAcumuladoFuturo: '$ 0',
    rentaMensualHoy: '$ 0',
    rentaMensualFuturo: '$ 0',
    necesidadDescripcion: '',
    necesidadCapitalHoyRaw: '',
    necesidadCapitalHoyFormatted: '',
    necesidadAnios: 0,
    necesidadCapitalFuturo: '$ 0',
    necesidadCuotaMensualRaw: '',
    necesidadCuotaMensualFormatted: '',
    ahorroMensualRaw: '',
    ahorroMensualFormatted: '',
    proyeccionAnios: 20,
    pesoKg: '',
    estaturaCm: '',
    imc: null,
    respuestasSalud: {},
    requiereExamenes: false,
    numDeclaracion: null,
    numSolicitudExamen: null,
    extraPrima: 0,
    metodoPago: '',
    otpEnviado: false,
    otpValidado: false,
    refNombre: '',
    refTel: '',
    files: [],
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    const newValue = type === 'checkbox' ? checked : value;

    const step2Fields = [
      'amparoBasicoFormatted', 'periodicidadPrima', 'tieneAsistenciaFuneraria', 
      'tieneAuxilioMedicamentos', 'tieneExoneracionPrimas', 'tieneITPEnfermedad', 
      'itpEnfermedadFormatted', 'tieneITPAccidente', 'itpAccidenteFormatted', 
      'tieneITPAnticipo', 'itpAnticipoFormatted', 'tieneEnfermedadesGravesSuma', 
      'egSumaFormatted', 'tieneEnfermedadesGravesAnticipo', 'egAnticipoFormatted', 
      'tieneRentaIncapacidad', 'tieneAccidentesPersonales', 'apFormatted', 
      'ahorroTab', 'ahorroMensualFormatted', 'rentaAporteInicialFormatted', 
      'rentaCuotaMensualFormatted', 'rentaAniosAhorrando', 'necesidadCapitalHoyFormatted', 
      'necesidadCuotaMensualFormatted'
    ];

    if (step2Fields.includes(name)) {
      setIsQuoteSaved(false);
    }

    setFormData((prev) => {
      let updated = { ...prev, [name]: newValue };

      // Clear amounts when checkbox is unchecked
      if (type === 'checkbox' && !newValue) {
        if (name === 'tieneITPEnfermedad') { updated.itpEnfermedadRaw = ''; updated.itpEnfermedadFormatted = ''; }
        if (name === 'tieneITPAccidente') { updated.itpAccidenteRaw = ''; updated.itpAccidenteFormatted = ''; }
        if (name === 'tieneITPAnticipo') { updated.itpAnticipoRaw = ''; updated.itpAnticipoFormatted = ''; }
        if (name === 'tieneEnfermedadesGravesSuma') { updated.egSumaRaw = ''; updated.egSumaFormatted = ''; }
        if (name === 'tieneEnfermedadesGravesAnticipo') { updated.egAnticipoRaw = ''; updated.egAnticipoFormatted = ''; }
        if (name === 'tieneAccidentesPersonales') { updated.apRaw = ''; updated.apFormatted = ''; }
      }

      if (name === 'claveAsesor' && value === 'AS-998877') {
        updated.nombreAsesor = 'JUAN PÉREZ - AGENCIA BOGOTÁ';
      }

      if (name === 'aseguradoFechaNac') {
        updated.aseguradoEdad = calcularEdad(value);
      }

      if (name === 'aseguradoSalarioFormatted') {
        updated.aseguradoSalarioRaw = parseCurrency(value);
        updated.aseguradoSalarioFormatted = formatCurrency(value);
      }

      if (name === 'amparoBasicoFormatted') {
        updated.amparoBasicoRaw = parseCurrency(value);
        updated.amparoBasicoFormatted = formatCurrency(value);
      }

      if (name === 'itpEnfermedadFormatted') {
        updated.itpEnfermedadRaw = parseCurrency(value);
        updated.itpEnfermedadFormatted = formatCurrency(value);
      }
      if (name === 'itpAccidenteFormatted') {
        updated.itpAccidenteRaw = parseCurrency(value);
        updated.itpAccidenteFormatted = formatCurrency(value);
      }
      if (name === 'itpAnticipoFormatted') {
        updated.itpAnticipoRaw = parseCurrency(value);
        updated.itpAnticipoFormatted = formatCurrency(value);
      }
      if (name === 'egSumaFormatted') {
        updated.egSumaRaw = parseCurrency(value);
        updated.egSumaFormatted = formatCurrency(value);
      }
      if (name === 'egAnticipoFormatted') {
        updated.egAnticipoRaw = parseCurrency(value);
        updated.egAnticipoFormatted = formatCurrency(value);
      }
      if (name === 'apFormatted') {
        updated.apRaw = parseCurrency(value);
        updated.apFormatted = formatCurrency(value);
      }

      // Conflict Rule: ITP Suma Adicional (Enfermedad + Accidente) vs ITP Anticipo
      if (name === 'tieneITPEnfermedad' || name === 'tieneITPAccidente' || name === 'tieneITPAnticipo') {
        if (updated.tieneITPEnfermedad && updated.tieneITPAccidente && updated.tieneITPAnticipo) {
          setShowConflictPopup(true);
          updated.tieneITPAnticipo = false;
        }
      }

      if (name === 'ahorroMensualFormatted') {
        updated.ahorroMensualRaw = parseCurrency(value);
        updated.ahorroMensualFormatted = formatCurrency(value);
      }

      if (name === 'rentaAporteInicialFormatted') {
        updated.rentaAporteInicialRaw = parseCurrency(value);
        updated.rentaAporteInicialFormatted = formatCurrency(value);
      }

      if (name === 'rentaCuotaMensualFormatted') {
        updated.rentaCuotaMensualRaw = parseCurrency(value);
        updated.rentaCuotaMensualFormatted = formatCurrency(value);
      }

      if (name === 'necesidadCapitalHoyFormatted') {
        updated.necesidadCapitalHoyRaw = parseCurrency(value);
        updated.necesidadCapitalHoyFormatted = formatCurrency(value);
      }

      if (name === 'necesidadCuotaMensualFormatted') {
        updated.necesidadCuotaMensualRaw = parseCurrency(value);
        updated.necesidadCuotaMensualFormatted = formatCurrency(value);
      }

      if (name === 'pesoKg' || name === 'estaturaCm') {
        const peso = name === 'pesoKg' ? Number(value) : Number(prev.pesoKg);
        const estatura = name === 'estaturaCm' ? Number(value) / 100 : Number(prev.estaturaCm) / 100;
        if (peso && estatura) {
          updated.imc = Number((peso / (estatura * estatura)).toFixed(1));
          if (updated.imc > 30) updated.extraPrima = 25;
          else updated.extraPrima = 0;
        }
      }

      if (updated.tomadorEsAsegurado) {
        updated.aseguradoTipoDoc = updated.tomadorTipoDoc;
        updated.aseguradoNumDoc = updated.tomadorNumDoc;
        updated.aseguradoNombres = updated.tomadorNombres;
        updated.aseguradoApellidos = updated.tomadorApellidos;
      }
      return updated;
    });
  }, [setIsQuoteSaved]);

  const handleSaludChange = useCallback((name: string, value: string) => {
    setFormData((prev) => {
      const nuevasRespuestas = { ...prev.respuestasSalud, [name]: value };
      const requiereExamenes = Object.values(nuevasRespuestas).includes('NO');
      return { ...prev, respuestasSalud: nuevasRespuestas, requiereExamenes };
    });
  }, []);

  // Ahorro Calculations
  React.useEffect(() => {
    const rentabilidad = 0.04;
    const inflacion = 0.03;

    setFormData(prev => {
      let updated = { ...prev };
      
      // Rentas
      const cuotaRenta = Number(prev.rentaCuotaMensualRaw) || 0;
      const aporteInicial = Number(prev.rentaAporteInicialRaw) || 0;
      const aniosAhorro = prev.rentaAniosAhorrando || 0;
      const duracionRenta = prev.rentaAniosDuracion || 1;

      if (aniosAhorro > 0) {
        // Simplified future value formula
        const meses = aniosAhorro * 12;
        const rMensual = Math.pow(1 + rentabilidad, 1/12) - 1;
        const acumulado = aporteInicial * Math.pow(1 + rentabilidad, aniosAhorro) + 
                         cuotaRenta * ((Math.pow(1 + rMensual, meses) - 1) / rMensual);
        
        updated.rentaAcumuladoFuturo = formatCurrency(Math.round(acumulado));
        const rentaFuturo = acumulado / (duracionRenta * 12);
        updated.rentaMensualFuturo = formatCurrency(Math.round(rentaFuturo));
        updated.rentaMensualHoy = formatCurrency(Math.round(rentaFuturo / Math.pow(1 + inflacion, aniosAhorro)));
      }

      // Necesidades
      const capitalHoy = Number(prev.necesidadCapitalHoyRaw) || 0;
      const aniosMeta = prev.necesidadAnios || 0;

      if (aniosMeta > 0) {
        const capitalFuturo = capitalHoy * Math.pow(1 + inflacion, aniosMeta);
        updated.necesidadCapitalFuturo = formatCurrency(Math.round(capitalFuturo));
        
        const rMensual = Math.pow(1 + rentabilidad, 1/12) - 1;
        const meses = aniosMeta * 12;
        const cuotaNecesidad = capitalFuturo / ((Math.pow(1 + rMensual, meses) - 1) / rMensual);
        
        updated.necesidadCuotaMensualRaw = Math.round(cuotaNecesidad).toString();
        updated.necesidadCuotaMensualFormatted = formatCurrency(Math.round(cuotaNecesidad));
      }

      return updated;
    });
  }, [formData.rentaCuotaMensualRaw, formData.rentaAporteInicialRaw, formData.rentaAniosAhorrando, formData.rentaAniosDuracion, formData.necesidadCapitalHoyRaw, formData.necesidadAnios]);

  const irStep2Coberturas = () => setCurrentStep(2);
  const irStep3Salud = () => {
    if (!formData.numDeclaracion) {
      setFormData((prev) => ({
        ...prev,
        numDeclaracion: generarNumero('', 10),
        numSolicitudExamen: generarNumero('', 8),
      }));
    }
    setCurrentStep(3);
  };
  const irStep4Emision = () => {
    setFormData((prev) => ({ ...prev, tomadorAutorizaSMS: true, tomadorAutorizaDatos: true }));
    setCurrentStep(4);
  };
  const finalizarEmision = () => setIsModalOpen(true);

  const ejecutarEmisionFinal = () => {
    setIsModalOpen(false);
    setIsEmitting(true);
    setTimeout(() => {
      setIsEmitting(false);
      setCurrentStep(5);
    }, 2000);
  };

  const isStep2Valid = useMemo(() => {
    if (!formData.amparoBasicoRaw) return false;
    if (formData.tieneITPEnfermedad && !formData.itpEnfermedadRaw) return false;
    if (formData.tieneITPAccidente && !formData.itpAccidenteRaw) return false;
    if (formData.tieneITPAnticipo && !formData.itpAnticipoRaw) return false;
    if (formData.tieneEnfermedadesGravesSuma && !formData.egSumaRaw) return false;
    if (formData.tieneEnfermedadesGravesAnticipo && !formData.egAnticipoRaw) return false;
    if (formData.tieneAccidentesPersonales && !formData.apRaw) return false;
    return true;
  }, [formData]);

  const isDeclarationFormComplete = useMemo(() => {
    const saludQuestions = [
      'q_licito', 'q_penal', 'q_secuestro', 'q_amenazas', 'q_cambio_residencia', 
      'q_piloto', 'q_deportes_riesgo', 'q_recargo_seguro', 'q_moto', 
      'q_indemnizacion', 'q_otros_seguros', 'q_limitaciones'
    ];
    const medicaQuestions = [
      'm_covid', 'm_hipertension', 'm_edad_45', 'm_colesterol', 'm_edad_49', 
      'm_tratamiento', 'm_niveles_normales', 'm_vih', 'm_enfermedad_fractura', 
      'm_alcoholismo', 'm_sustancias', 'm_cirugia'
    ];
    
    const allAnswered = [...saludQuestions, ...medicaQuestions].every(q => formData.respuestasSalud[q]);
    const basicInfoOk = !!(formData.pesoKg && formData.estaturaCm);
    
    return allAnswered && basicInfoOk;
  }, [formData.respuestasSalud, formData.pesoKg, formData.estaturaCm]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !!(formData.tomadorNumDoc && formData.tomadorNombres && formData.tomadorApellidos && formData.tomadorCorreo && validateEmail(formData.tomadorCorreo));
      case 2:
        return isStep2Valid && isQuoteSaved;
      case 3:
        return isDeclarationConfirmed;
      case 4:
        return true;
      default:
        return true;
    }
  }, [currentStep, formData, isQuoteSaved, isStep2Valid]);

  const stepsDef = [
    { id: 1, label: 'Datos Riesgo' },
    { id: 2, label: 'Coberturas' },
    { id: 3, label: 'Declaración de Asegurabilidad' },
    { id: 4, label: 'Resumen de Cotización' },
    { id: 5, label: 'Póliza' },
  ];

  const valorAseguradoContratado = useMemo(() => {
    return Number(formData.amparoBasicoRaw) || 0;
  }, [formData.amparoBasicoRaw]);

  const primaMensual = useMemo(() => {
    if (valorAseguradoContratado === 0) return 0;
    let factor = 0.0005;
    if (formData.aseguradoEdad && formData.aseguradoEdad > 40) factor += 0.0002;
    if (Number(formData.aseguradoSalarioRaw) > 10000000) factor += 0.0001;
    
    let prima = valorAseguradoContratado * factor;
    
    // Anexos con costo
    if (formData.tieneITPEnfermedad) prima += (Number(formData.itpEnfermedadRaw) || 0) * 0.0001;
    if (formData.tieneITPAccidente) prima += (Number(formData.itpAccidenteRaw) || 0) * 0.00008;
    if (formData.tieneITPAnticipo) prima += (Number(formData.itpAnticipoRaw) || 0) * 0.00005;
    if (formData.tieneEnfermedadesGravesSuma) prima += (Number(formData.egSumaRaw) || 0) * 0.0002;
    if (formData.tieneEnfermedadesGravesAnticipo) prima += (Number(formData.egAnticipoRaw) || 0) * 0.00015;
    if (formData.tieneRentaIncapacidad) prima += 15000;
    if (formData.tieneAccidentesPersonales) prima += (Number(formData.apRaw) || 0) * 0.00012;
    
    if (formData.extraPrima) {
      prima = prima * (1 + formData.extraPrima / 100);
    }

    const ahorro = Number(formData.ahorroMensualRaw) || 0;
    const ahorroRenta = formData.ahorroTab === 'rentas' ? Number(formData.rentaCuotaMensualRaw) : 0;
    const ahorroNecesidad = formData.ahorroTab === 'necesidades' ? Number(formData.necesidadCuotaMensualRaw) : 0;
    
    let total = prima + ahorro + ahorroRenta + ahorroNecesidad;

    if (formData.periodicidadPrima === 'semestral') total *= 6;
    if (formData.periodicidadPrima === 'anual') total *= 12;

    return Math.round(total);
  }, [
    valorAseguradoContratado, 
    formData.aseguradoEdad, 
    formData.aseguradoSalarioRaw, 
    formData.tieneITPEnfermedad, 
    formData.itpEnfermedadRaw,
    formData.tieneITPAccidente, 
    formData.itpAccidenteRaw,
    formData.tieneITPAnticipo, 
    formData.itpAnticipoRaw,
    formData.tieneEnfermedadesGravesSuma, 
    formData.egSumaRaw,
    formData.tieneEnfermedadesGravesAnticipo, 
    formData.egAnticipoRaw,
    formData.tieneRentaIncapacidad, 
    formData.tieneAccidentesPersonales, 
    formData.apRaw,
    formData.extraPrima, 
    formData.ahorroMensualRaw, 
    formData.rentaCuotaMensualRaw, 
    formData.necesidadCuotaMensualRaw, 
    formData.ahorroTab, 
    formData.periodicidadPrima
  ]);

  return (
    <div className="min-h-screen bg-bg-app">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-bolivar-green rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
              <Shield className="text-bolivar-yellow w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-bolivar-green tracking-tight">Vida Individual</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Seguros Bolívar • Proyección</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Asesor Comercial</p>
                <p className="text-xs font-bold text-bolivar-green">Carlos Rodríguez</p>
              </div>
              <div className="w-8 h-8 bg-bolivar-yellow rounded-full flex items-center justify-center font-bold text-bolivar-green text-xs border-2 border-white shadow-sm">
                CR
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentStep <= 4 && (
          <div className="max-w-4xl mx-auto stepper-container animate-fadeIn mb-8">
            <div className="stepper-line"></div>
            <div
              className="stepper-line-progress"
              style={{ width: `${((currentStep - 1) / (stepsDef.length - 1)) * 100}%` }}
            ></div>
            {stepsDef.map((step) => (
              <div
                key={step.id}
                className={`step-item ${currentStep === step.id ? 'active' : ''} ${
                  currentStep > step.id ? 'completed' : ''
                }`}
              >
                <div className="step-dot">{step.id}</div>
                <div className="step-label">{step.label}</div>
              </div>
            ))}
          </div>
        )}

      {currentStep === 1 && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="bv-card">
            <h2 className="text-xl mb-5 font-semibold text-bolivar-green">1. Información del Asesor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Input
                label="Clave del Intermediario"
                required
                name="claveAsesor"
                value={formData.claveAsesor}
                onChange={handleInputChange}
                placeholder="Ej. AS-998877"
                icon={<UserCheck className="w-4 h-4" />}
              />
              <Input
                label="Nombre del Asesor"
                name="nombreAsesor"
                value={formData.nombreAsesor}
                disabled
                placeholder="Autocompletado..."
              />
            </div>
          </div>

          <div className="bv-card">
            <h2 className="text-xl mb-5 font-semibold text-bolivar-green">2. Selección de Plan</h2>
            <Select
              label="Plan de Seguro"
              required
              name="producto"
              value={formData.producto}
              onChange={handleInputChange}
              options={[
                { value: 'integral', label: 'Seguro de Vida Integral' },
                { value: 'tranquilidad', label: 'Portafolio Tranquilidad Hijos' },
                { value: 'activa', label: 'Vida Activa' },
                { value: 'mayor', label: 'Adulto Mayor' },
                { value: 'inversion', label: 'Vida e Inversión' },
              ]}
            />
          </div>

          <div className="bv-card">
            <h2 className="text-xl mb-5 font-semibold text-bolivar-green">3. Datos Tomador</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div className="md:col-span-2 mb-4">
                <label className="bv-label">Tipo de Persona</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tomadorTipoPersona"
                      value="natural"
                      checked={formData.tomadorTipoPersona === 'natural'}
                      onChange={handleInputChange}
                      className="accent-bolivar-green"
                    />
                    <span className="text-sm">Persona Natural</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tomadorTipoPersona"
                      value="juridica"
                      checked={formData.tomadorTipoPersona === 'juridica'}
                      onChange={handleInputChange}
                      className="accent-bolivar-green"
                    />
                    <span className="text-sm">Persona Jurídica</span>
                  </label>
                </div>
              </div>
              <Select
                label="Tipo Documento"
                required
                name="tomadorTipoDoc"
                value={formData.tomadorTipoDoc}
                onChange={handleInputChange}
                options={opcionesDoc}
              />
              <Input
                label="Número Documento"
                required
                type="text"
                inputMode="numeric"
                name="tomadorNumDoc"
                value={formData.tomadorNumDoc}
                onChange={handleInputChange}
                placeholder="Ej. 102030"
                icon={<FileText className="w-4 h-4" />}
              />
              <Input
                label="Nombres"
                required
                name="tomadorNombres"
                value={formData.tomadorNombres}
                onChange={handleInputChange}
              />
              <Input
                label="Apellidos"
                required
                name="tomadorApellidos"
                value={formData.tomadorApellidos}
                onChange={handleInputChange}
              />
              <div className="md:col-span-2">
                <Input
                  label="Correo Electrónico"
                  required
                  type="email"
                  name="tomadorCorreo"
                  value={formData.tomadorCorreo}
                  onChange={handleInputChange}
                  placeholder="usuario@correo.com"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-x-8 gap-y-1 mt-2 bg-gray-50 p-3 rounded-lg border shadow-inner">
              <Checkbox
                label="¿Autoriza SMS?"
                name="tomadorAutorizaSMS"
                checked={formData.tomadorAutorizaSMS}
                onChange={handleInputChange}
              />
              <Checkbox
                label={
                  <span>
                    ¿Autoriza uso de Datos? (Ver <a href="#" className="text-bolivar-green underline font-bold" onClick={(e) => e.preventDefault()}>Política de Tratamiento de información personal</a>)
                  </span>
                }
                name="tomadorAutorizaDatos"
                checked={formData.tomadorAutorizaDatos}
                onChange={handleInputChange}
              />
            </div>
            <div className="mt-6 border-t pt-4 space-y-4">
              <Checkbox
                label="¿El tomador es el mismo asegurado?"
                name="tomadorEsAsegurado"
                checked={formData.tomadorEsAsegurado}
                onChange={handleInputChange}
              />
              <div className="flex items-center justify-between max-w-xs">
                <span className="text-sm text-text-main">¿Tiene Cónyuge?</span>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-pill w-[120px]">
                  {['SI', 'NO'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={formData.tomadorEsAsegurado}
                      onClick={() => setFormData(prev => ({ ...prev, tomadorTieneConyuge: opt as any }))}
                      className={`flex-1 px-3 py-1 rounded-pill text-xs font-bold transition-all ${
                        formData.tomadorTieneConyuge === opt
                          ? 'bg-bolivar-yellow text-bolivar-green'
                          : 'text-bolivar-sec hover:bg-gray-200'
                      } ${formData.tomadorEsAsegurado ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bv-card animate-fadeIn">
            <h2 className="text-xl mb-5 font-semibold text-bolivar-green">4. Datos del Asegurado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {!formData.tomadorEsAsegurado && (
                <>
                  <Select
                    label="Tipo Documento"
                    required
                    name="aseguradoTipoDoc"
                    value={formData.aseguradoTipoDoc}
                    onChange={handleInputChange}
                    options={opcionesDoc}
                  />
                  <Input
                    label="Número Documento"
                    required
                    type="text"
                    inputMode="numeric"
                    name="aseguradoNumDoc"
                    value={formData.aseguradoNumDoc}
                    onChange={handleInputChange}
                    icon={<FileText className="w-4 h-4" />}
                  />
                  <Input
                    label="Nombres"
                    required
                    name="aseguradoNombres"
                    value={formData.aseguradoNombres}
                    onChange={handleInputChange}
                  />
                  <Input
                    label="Apellidos"
                    required
                    name="aseguradoApellidos"
                    value={formData.aseguradoApellidos}
                    onChange={handleInputChange}
                  />
                </>
              )}
              <Select
                label="Sexo"
                name="aseguradoSexo"
                value={formData.aseguradoSexo}
                onChange={handleInputChange}
                options={opcionesSexo}
              />
              <div className="grid grid-cols-3 gap-3 items-end">
                <div className="col-span-2">
                  <Input
                    label="Fecha Nacimiento"
                    required
                    type="date"
                    name="aseguradoFechaNac"
                    value={formData.aseguradoFechaNac}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Input
                    label="Edad"
                    type="number"
                    name="aseguradoEdad"
                    value={formData.aseguradoEdad || ''}
                    disabled
                    placeholder="--"
                  />
                </div>
              </div>
              <Input
                label="Ciudad"
                required
                name="aseguradoCiudad"
                value={formData.aseguradoCiudad}
                onChange={handleInputChange}
              />
              <Input
                label="Dirección"
                name="aseguradoDireccion"
                value={formData.aseguradoDireccion}
                onChange={handleInputChange}
              />
              <Input
                label="Ingresos Mensuales"
                required
                name="aseguradoSalarioFormatted"
                value={formData.aseguradoSalarioFormatted}
                onChange={handleInputChange}
                placeholder="$ 0"
              />
              <Select
                label="Relación Laboral"
                name="aseguradoRelacion"
                value={formData.aseguradoRelacion}
                onChange={handleInputChange}
                options={opcionesRelacion}
              />
              <Input
                label="Ocupación"
                name="aseguradoOcupacion"
                value={formData.aseguradoOcupacion}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="space-y-6">
            <div className="bv-card">
              <div className="mb-8 bg-gray-50 p-6 rounded-card border shadow-inner space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Input
                      label="Valor Asegurado (Amparo Básico)"
                      required
                      name="amparoBasicoFormatted"
                      value={formData.amparoBasicoFormatted}
                      onChange={handleInputChange}
                      placeholder="$ 0"
                      icon={<Shield className="w-4 h-4" />}
                    />
                  </div>
                  <div className="w-48">
                    <Select
                      label="Periodicidad Prima"
                      name="periodicidadPrima"
                      value={formData.periodicidadPrima}
                      onChange={handleInputChange}
                      options={[
                        { value: 'mensual', label: 'Mensual' },
                        { value: 'semestral', label: 'Semestral' },
                        { value: 'anual', label: 'Anual' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <AccordionSection title="Amparo Básico" defaultOpen={true}>
                  <div className="space-y-1">
                    <CoverageRow
                      label="Fallecimiento por cualquier causa"
                      name="amparoBasico"
                      checked={true}
                      onChange={() => {}}
                      isFree={true}
                      amount={formData.amparoBasicoFormatted}
                    />
                    <CoverageRow
                      label="Asistencia Funeraria"
                      name="tieneAsistenciaFuneraria"
                      checked={formData.tieneAsistenciaFuneraria}
                      onChange={handleInputChange}
                      isFree={true}
                      amount="$ 10.000.000"
                    />
                    <CoverageRow
                      label="Auxilio medicamentos, vacunas, lentes"
                      name="tieneAuxilioMedicamentos"
                      checked={formData.tieneAuxilioMedicamentos}
                      onChange={handleInputChange}
                      isFree={true}
                      amount="$ 500.000"
                    />
                    <CoverageRow
                      label="Exoneración de pago de primas"
                      name="tieneExoneracionPrimas"
                      checked={formData.tieneExoneracionPrimas}
                      onChange={handleInputChange}
                      isFree={true}
                    />
                  </div>
                </AccordionSection>

                <AccordionSection title="Anexos" defaultOpen={true}>
                  <div className="space-y-1">
                    <CoverageRow
                      label="ITP por Enfermedad (Suma Adicional)"
                      name="tieneITPEnfermedad"
                      checked={formData.tieneITPEnfermedad}
                      onChange={handleInputChange}
                      amount={formData.itpEnfermedadFormatted}
                      amountName="itpEnfermedadFormatted"
                      onAmountChange={handleInputChange}
                      premium={formatCurrency(valorAseguradoContratado * 0.0001)}
                    />
                    <CoverageRow
                      label="ITP por Accidente (Suma Adicional)"
                      name="tieneITPAccidente"
                      checked={formData.tieneITPAccidente}
                      onChange={handleInputChange}
                      amount={formData.itpAccidenteFormatted}
                      amountName="itpAccidenteFormatted"
                      onAmountChange={handleInputChange}
                      premium={formatCurrency(valorAseguradoContratado * 0.00008)}
                    />
                    <CoverageRow
                      label="ITP por Enfermedad o Accidente (Anticipo)"
                      name="tieneITPAnticipo"
                      checked={formData.tieneITPAnticipo}
                      onChange={handleInputChange}
                      amount={formData.itpAnticipoFormatted}
                      amountName="itpAnticipoFormatted"
                      onAmountChange={handleInputChange}
                      premium={formatCurrency(valorAseguradoContratado * 0.00005)}
                    />
                    <CoverageRow
                      label="Enfermedades Graves (Suma Adicional)"
                      name="tieneEnfermedadesGravesSuma"
                      checked={formData.tieneEnfermedadesGravesSuma}
                      onChange={handleInputChange}
                      amount={formData.egSumaFormatted}
                      amountName="egSumaFormatted"
                      onAmountChange={handleInputChange}
                      premium={formatCurrency(valorAseguradoContratado * 0.0002)}
                    />
                    <CoverageRow
                      label="Enfermedades Graves e Invalidez (Anticipo 50%)"
                      name="tieneEnfermedadesGravesAnticipo"
                      checked={formData.tieneEnfermedadesGravesAnticipo}
                      onChange={handleInputChange}
                      amount={formData.egAnticipoFormatted}
                      amountName="egAnticipoFormatted"
                      onAmountChange={handleInputChange}
                      premium={formatCurrency(valorAseguradoContratado * 0.00015)}
                    />
                    <CoverageRow
                      label="Renta Diaria por Incapacidad por Enfermedad"
                      name="tieneRentaIncapacidad"
                      checked={formData.tieneRentaIncapacidad}
                      onChange={handleInputChange}
                      amount="$ 100.000 / día"
                      premium="$ 15.000"
                    />
                    <div className="space-y-1">
                      <CoverageRow
                        label="Anexo de Accidentes Personales"
                        name="tieneAccidentesPersonales"
                        checked={formData.tieneAccidentesPersonales}
                        onChange={handleInputChange}
                        amount={formData.apFormatted}
                        amountName="apFormatted"
                        onAmountChange={handleInputChange}
                        premium={formatCurrency(valorAseguradoContratado * 0.00012)}
                      />
                      {formData.tieneAccidentesPersonales && (
                        <div className="ml-8 pl-4 border-l-2 border-gray-100 space-y-2 py-2 animate-fadeIn">
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-modern-green" /> Muerte accidental por accidente de tránsito terrestre
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-modern-green" /> Desmembración
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-modern-green" /> Gastos médicos por accidente
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-modern-green" /> Renta diaria por incapacidad por accidente
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </AccordionSection>

                <AccordionSection title="Ahorro y Proyección" defaultOpen={true}>
                  <div className="animate-fadeIn space-y-4 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, ahorroTab: 'rentas' }))}
                          className={`px-4 py-1.5 text-[9px] font-black transition-all rounded-md tracking-wider uppercase ${
                            formData.ahorroTab === 'rentas'
                              ? 'bg-white text-bolivar-green shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          (C) RENTAS
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, ahorroTab: 'necesidades' }))}
                          className={`px-4 py-1.5 text-[9px] font-black transition-all rounded-md tracking-wider uppercase ${
                            formData.ahorroTab === 'necesidades'
                              ? 'bg-white text-bolivar-green shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          (D) NECESIDADES
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Periodicidad:</span>
                        <select
                          name="ahorroPeriodicidad"
                          value={formData.ahorroPeriodicidad}
                          onChange={handleInputChange}
                          className="text-[10px] border-none bg-transparent font-black text-bolivar-green focus:ring-0 outline-none cursor-pointer uppercase"
                        >
                          <option value="mensual">Mensual</option>
                          <option value="trimestral">Trimestral</option>
                          <option value="semestral">Semestral</option>
                          <option value="anual">Anual</option>
                        </select>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                      {formData.ahorroTab === 'rentas' ? (
                        <div className="flex flex-col">
                          <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-3.5 h-3.5 text-bolivar-green" />
                              <span className="text-[10px] font-black text-bolivar-green uppercase tracking-widest">Detalle de Rentas</span>
                            </div>
                            <button type="button" className="text-[9px] font-black text-modern-green hover:text-bolivar-green transition-colors uppercase tracking-widest flex items-center gap-1">
                              + Agregar Renta
                            </button>
                          </div>
                          
                          <div className="p-4">
                            <div className="grid grid-cols-7 gap-2 mb-2 px-2">
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Duración Renta (Años)</div>
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Aporte Inicial</div>
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Cuota</div>
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Años Ahorro</div>
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Acumulado</div>
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Renta Hoy</div>
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Renta Futuro</div>
                            </div>

                            <div className="grid grid-cols-7 gap-2 items-center py-2 px-2 border-b border-gray-50 hover:bg-gray-50 transition-colors rounded-lg">
                              <div className="relative">
                                <input 
                                  type="number" 
                                  name="rentaAniosDuracion" 
                                  value={formData.rentaAniosDuracion} 
                                  onChange={handleInputChange} 
                                  className="w-full text-center font-mono text-xs font-bold text-bolivar-green bg-white border border-gray-200 rounded p-1 focus:ring-1 focus:ring-modern-green outline-none" 
                                />
                              </div>
                              <div className="relative">
                                <input 
                                  name="rentaAporteInicialFormatted" 
                                  value={formData.rentaAporteInicialFormatted} 
                                  onChange={handleInputChange} 
                                  className="w-full text-center font-mono text-xs font-bold text-bolivar-green bg-white border border-gray-200 rounded p-1 focus:ring-1 focus:ring-modern-green outline-none" 
                                />
                              </div>
                              <div className="relative">
                                <input 
                                  name="rentaCuotaMensualFormatted" 
                                  value={formData.rentaCuotaMensualFormatted} 
                                  onChange={handleInputChange} 
                                  className="w-full text-center font-mono text-xs font-bold text-modern-green bg-white border border-gray-200 rounded p-1 focus:ring-1 focus:ring-modern-green outline-none" 
                                />
                              </div>
                              <div className="relative">
                                <input 
                                  type="number" 
                                  name="rentaAniosAhorrando" 
                                  value={formData.rentaAniosAhorrando} 
                                  onChange={handleInputChange} 
                                  className="w-full text-center font-mono text-xs font-bold text-bolivar-green bg-white border border-gray-200 rounded p-1 focus:ring-1 focus:ring-modern-green outline-none" 
                                />
                              </div>
                              <div className="text-center font-mono text-[10px] font-black text-bolivar-green">{formData.rentaAcumuladoFuturo}</div>
                              <div className="text-center font-mono text-[10px] font-black text-gray-500">{formData.rentaMensualHoy}</div>
                              <div className="text-center font-mono text-[10px] font-black text-modern-green">{formData.rentaMensualFuturo}</div>
                            </div>
                          </div>

                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-modern-green animate-pulse"></div>
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Proyección en tiempo real</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ahorro Mensual:</span>
                              <span className="text-sm font-black text-bolivar-green font-mono">{formData.rentaCuotaMensualFormatted}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Target className="w-3.5 h-3.5 text-bolivar-green" />
                              <span className="text-[10px] font-black text-bolivar-green uppercase tracking-widest">Detalle de Necesidades</span>
                            </div>
                            <button type="button" className="text-[9px] font-black text-modern-green hover:text-bolivar-green transition-colors uppercase tracking-widest flex items-center gap-1">
                              + Agregar Objetivo
                            </button>
                          </div>

                          <div className="p-4">
                            <div className="grid grid-cols-5 gap-4 mb-2 px-2">
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Descripción</div>
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Capital Hoy</div>
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Años Meta</div>
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Capital Futuro</div>
                              <div className="text-[8px] font-black text-gray-400 uppercase tracking-tighter text-center">Cuota</div>
                            </div>

                            <div className="grid grid-cols-5 gap-4 items-center py-2 px-2 border-b border-gray-50 hover:bg-gray-50 transition-colors rounded-lg">
                              <input 
                                name="necesidadDescripcion" 
                                value={formData.necesidadDescripcion} 
                                onChange={handleInputChange} 
                                placeholder="Ej. Viaje..."
                                className="w-full text-left font-bold text-xs text-bolivar-green bg-white border border-gray-200 rounded p-1 px-2 focus:ring-1 focus:ring-modern-green outline-none" 
                              />
                              <input 
                                name="necesidadCapitalHoyFormatted" 
                                value={formData.necesidadCapitalHoyFormatted} 
                                onChange={handleInputChange} 
                                className="w-full text-center font-mono text-xs font-bold text-bolivar-green bg-white border border-gray-200 rounded p-1 focus:ring-1 focus:ring-modern-green outline-none" 
                              />
                              <input 
                                type="number" 
                                name="necesidadAnios" 
                                value={formData.necesidadAnios} 
                                onChange={handleInputChange} 
                                className="w-full text-center font-mono text-xs font-bold text-bolivar-green bg-white border border-gray-200 rounded p-1 focus:ring-1 focus:ring-modern-green outline-none" 
                              />
                              <div className="text-center font-mono text-[10px] font-black text-bolivar-green">{formData.necesidadCapitalFuturo}</div>
                              <input 
                                name="necesidadCuotaMensualFormatted" 
                                value={formData.necesidadCuotaMensualFormatted} 
                                onChange={handleInputChange} 
                                className="w-full text-center font-mono text-xs font-bold text-modern-green bg-white border border-gray-200 rounded p-1 focus:ring-1 focus:ring-modern-green outline-none" 
                              />
                            </div>
                          </div>

                          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-modern-green animate-pulse"></div>
                              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Proyección en tiempo real</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Ahorro Mensual:</span>
                              <span className="text-sm font-black text-bolivar-green font-mono">{formData.necesidadCuotaMensualFormatted}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-gray-50/50 rounded-lg border border-gray-100">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-[8px] font-black text-bolivar-green uppercase tracking-widest">Supuestos:</span>
                          <div className="flex gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] text-gray-400 font-bold uppercase">Rentabilidad</span>
                              <span className="text-[9px] font-mono font-bold text-gray-600">4.00% E.A.</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] text-gray-400 font-bold uppercase">Inflación</span>
                              <span className="text-[9px] font-mono font-bold text-gray-600">3.00% E.A.</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-[8px] text-gray-400 italic max-w-md text-right">
                          Nota: Proyecciones estimadas basadas en condiciones actuales. No constituyen garantía de rentabilidad futura.
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionSection>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="space-y-6">
            <div className="bv-card">
              <h2 className="text-2xl mb-6 border-b pb-4 flex items-center justify-between gap-4 font-bold text-bolivar-green">
                Declaración Salud
                <span className="text-sm font-mono bg-gray-100 p-2 rounded border shadow-inner">
                  N° {formData.numDeclaracion}
                </span>
              </h2>

              <div className="space-y-4">
                <AccordionSection
                  title="Estado de Salud General"
                  isOpen={isSaludExpanded}
                  onToggle={() => setIsSaludExpanded(!isSaludExpanded)}
                  icon={<Shield className="w-5 h-5 text-bolivar-green" />}
                >
                  <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
                    <SmartQuestion
                      label="¿Sus actividades, profesión u oficio han sido y son lícitos y los ha ejercido y ejerce dentro de los marcos legales?"
                      name="q_licito"
                      value={formData.respuestasSalud['q_licito']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Usted ha sido sindicado, indiciado, denunciante, víctima o condenado por algún proceso penal?"
                      name="q_penal"
                      value={formData.respuestasSalud['q_penal']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Usted ha sido secuestrado y/o extorsionado?"
                      name="q_secuestro"
                      value={formData.respuestasSalud['q_secuestro']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Usted ha recibido amenazas de secuestro o muerte?"
                      name="q_amenazas"
                      value={formData.respuestasSalud['q_amenazas']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Ha cambiado o le han aconsejado cambiar de ocupación o residencia por motivos de salud?"
                      name="q_cambio_residencia"
                      value={formData.respuestasSalud['q_cambio_residencia']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Tiene o ha tenido licencia para pilotear aviones, o piensa pilotear cualquier nave de clase aérea?"
                      name="q_piloto"
                      value={formData.respuestasSalud['q_piloto']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Practica deportes tales como paracaidismo, vuelos delta, cometa, buceo, parapente, bungee, ciclomontañismo u otros deportes denominados de alto riesgo?"
                      name="q_deportes_riesgo"
                      value={formData.respuestasSalud['q_deportes_riesgo']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Le ha sido expedida con recargo en la prima algún seguro de Vida, Accidentes o Salud?"
                      name="q_recargo_seguro"
                      value={formData.respuestasSalud['q_recargo_seguro']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Utiliza como medio de transporte, como conductor y/o como pasajero, motocicleta?"
                      name="q_moto"
                      value={formData.respuestasSalud['q_moto']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Ha recibido alguna indemnización por algún seguro de vida o sus anexos?"
                      name="q_indemnizacion"
                      value={formData.respuestasSalud['q_indemnizacion']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Tiene seguros de vida con alguna otra compañía?"
                      name="q_otros_seguros"
                      value={formData.respuestasSalud['q_otros_seguros']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                    <SmartQuestion
                      label="¿Presentó o presenta en la actualidad limitaciones físicas, anatómicas o funcionales?"
                      name="q_limitaciones"
                      value={formData.respuestasSalud['q_limitaciones']}
                      onChange={handleSaludChange}
                      disabled={isDeclarationPresented}
                    />
                  </div>
                </AccordionSection>

                <AccordionSection
                  title="Información Médica"
                  isOpen={isMedicaExpanded}
                  onToggle={() => setIsMedicaExpanded(!isMedicaExpanded)}
                  icon={<AlertCircle className="w-5 h-5 text-bolivar-green" />}
                >
                  <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="¿Cuál es su peso (Kilogramos)?"
                        type="number"
                        name="pesoKg"
                        value={formData.pesoKg}
                        onChange={handleInputChange}
                        placeholder="Ej. 70"
                        disabled={isDeclarationPresented}
                      />
                      <Input
                        label="¿Cuál es su estatura (centímetros)?"
                        type="number"
                        name="estaturaCm"
                        value={formData.estaturaCm}
                        onChange={handleInputChange}
                        placeholder="Ej. 170"
                        disabled={isDeclarationPresented}
                      />
                    </div>
                    
                    <div className="divide-y divide-gray-50 border-t border-gray-50">
                      <SmartQuestion
                        label="¿Presenta en la actualidad SECUELAS por contagio por CORONAVIRUS cardiacas, pulmonares o neurológicas?"
                        name="m_covid"
                        value={formData.respuestasSalud['m_covid']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿Le han diagnosticado Hipertensión arterial?"
                        name="m_hipertension"
                        value={formData.respuestasSalud['m_hipertension']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿Es Mayor o igual a 45 años?"
                        name="m_edad_45"
                        value={formData.respuestasSalud['m_edad_45']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿Le han diagnosticado colesterol y triglicéridos elevados?"
                        name="m_colesterol"
                        value={formData.respuestasSalud['m_colesterol']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿Es menor o igual a 49 años?"
                        name="m_edad_49"
                        value={formData.respuestasSalud['m_edad_49']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿Actualmente está en tratamiento con medicamentos?"
                        name="m_tratamiento"
                        value={formData.respuestasSalud['m_tratamiento']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿Sus niveles de colesterol y triglicéridos están normales con el tratamiento?"
                        name="m_niveles_normales"
                        value={formData.respuestasSalud['m_niveles_normales']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿Ha salido POSITIVA alguna prueba de VIH que le hayan practicado?"
                        name="m_vih"
                        value={formData.respuestasSalud['m_vih']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿Un médico le ha diagnosticado alguna enfermedad o ha tenido fracturas?"
                        name="m_enfermedad_fractura"
                        value={formData.respuestasSalud['m_enfermedad_fractura']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿Le han prescrito tratamiento para alcoholismo o alucinógenos?"
                        name="m_alcoholismo"
                        value={formData.respuestasSalud['m_alcoholismo']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿En los últimos dos años ha consumido alucinógenos o sustancias psicoactivas?"
                        name="m_sustancias"
                        value={formData.respuestasSalud['m_sustancias']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                      <SmartQuestion
                        label="¿Le han practicado alguna cirugía?"
                        name="m_cirugia"
                        value={formData.respuestasSalud['m_cirugia']}
                        onChange={handleSaludChange}
                        disabled={isDeclarationPresented}
                      />
                    </div>
                  </div>
                </AccordionSection>
              </div>

              {isDeclarationFormComplete && !isDeclarationPresented && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setShowDeclarationConfirmModal(true)}
                    className="bv-btn-pill-primary px-12 py-4 text-lg shadow-xl animate-bounce"
                  >
                    Presentar Declaración
                  </button>
                </div>
              )}

              {isDeclarationConfirmed && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4 animate-fadeIn">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800">Declaración Presentada Exitosamente</h4>
                    <p className="text-green-700 text-sm">Número de Declaración de Asegurabilidad: <span className="font-mono font-bold">{formData.numDeclaracion}</span></p>
                  </div>
                </div>
              )}

              {hasSecondQuote && (
                <div className="mt-6 bg-bolivar-yellow/10 border border-bolivar-yellow/30 rounded-2xl p-6 animate-fadeIn">
                  <div className="flex items-center gap-4 mb-4">
                    <AlertTriangle className="w-6 h-6 text-bolivar-yellow" />
                    <h4 className="font-bold text-bolivar-green">Segunda Cotización Generada</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Dada la declaración de salud, se ha identificado un recargo en la prima. Se ha generado una nueva cotización con los valores ajustados.
                  </p>
                  <div className="bg-white p-4 rounded-xl border border-bolivar-yellow/20 flex justify-between items-center">
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-bold">Nueva Prima Mensual</span>
                      <div className="text-2xl font-black text-bolivar-green">{formatCurrency(primaMensual)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 uppercase font-bold">Recargo Aplicado</span>
                      <div className="text-lg font-bold text-modern-green">+15%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="space-y-6">
            <div className="bv-card">
              <h2 className="text-2xl mb-6 font-bold text-bolivar-green flex items-center gap-2">
                <FileText className="w-6 h-6" /> Resumen de Cotización
              </h2>
              
              <div className="space-y-6">
                {/* 1. Datos del Riesgo */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-6">
                  <h3 className="text-sm font-black text-bolivar-green uppercase tracking-widest mb-4 border-b pb-2">1. Datos del Riesgo</h3>
                  
                  {!formData.tomadorEsAsegurado && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-bolivar-sec uppercase tracking-wider">Datos del Tomador</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[10px] block">Nombre Completo</span>
                          <p className="font-bold text-bolivar-sec">{formData.tomadorNombres} {formData.tomadorApellidos}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[10px] block">Documento</span>
                          <p className="font-bold text-bolivar-sec">{formData.tomadorTipoDoc} {formData.tomadorNumDoc}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[10px] block">Correo</span>
                          <p className="font-bold text-bolivar-sec">{formData.tomadorCorreo}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[10px] block">Tipo Persona</span>
                          <p className="font-bold text-bolivar-sec uppercase">{formData.tomadorTipoPersona}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`space-y-3 ${!formData.tomadorEsAsegurado ? 'pt-4 border-t border-gray-200/50' : ''}`}>
                    <h4 className="text-xs font-black text-bolivar-sec uppercase tracking-wider">
                      {formData.tomadorEsAsegurado ? 'Datos del Tomador y Asegurado' : 'Datos del Asegurado'}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400 font-bold uppercase text-[10px] block">Nombre Completo</span>
                        <p className="font-bold text-bolivar-sec">{formData.aseguradoNombres} {formData.aseguradoApellidos}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase text-[10px] block">Documento</span>
                        <p className="font-bold text-bolivar-sec">{formData.aseguradoTipoDoc} {formData.aseguradoNumDoc}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase text-[10px] block">Edad</span>
                        <p className="font-bold text-bolivar-sec">{formData.aseguradoEdad} Años</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase text-[10px] block">Sexo</span>
                        <p className="font-bold text-bolivar-sec uppercase">{formData.aseguradoSexo}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase text-[10px] block">Ciudad</span>
                        <p className="font-bold text-bolivar-sec">{formData.aseguradoCiudad}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase text-[10px] block">Ingresos</span>
                        <p className="font-bold text-bolivar-sec">{formData.aseguradoSalarioFormatted}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase text-[10px] block">Ocupación</span>
                        <p className="font-bold text-bolivar-sec">{formData.aseguradoOcupacion}</p>
                      </div>
                      {formData.tomadorEsAsegurado && (
                        <div>
                          <span className="text-gray-400 font-bold uppercase text-[10px] block">Correo</span>
                          <p className="font-bold text-bolivar-sec">{formData.tomadorCorreo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Coberturas Seleccionadas */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-4">
                  <h3 className="text-sm font-black text-bolivar-green uppercase tracking-widest mb-4 border-b pb-2">2. Coberturas Seleccionadas</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2 border-b border-gray-200/50">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-bolivar-sec">Amparo Básico (Fallecimiento)</span>
                        <span className="text-[10px] text-gray-400 italic">Suma Asegurada: {formData.amparoBasicoFormatted}</span>
                      </div>
                      <span className="text-xs font-black text-bolivar-green">
                        {formatCurrency(Math.round(valorAseguradoContratado * (0.0005 + (formData.aseguradoEdad && formData.aseguradoEdad > 40 ? 0.0002 : 0) + (Number(formData.aseguradoSalarioRaw) > 10000000 ? 0.0001 : 0))))}
                      </span>
                    </div>

                    {[
                      { label: 'ITP Enfermedad', active: formData.tieneITPEnfermedad, value: formData.itpEnfermedadFormatted, prima: (Number(formData.itpEnfermedadRaw) || 0) * 0.0001 },
                      { label: 'ITP Accidente', active: formData.tieneITPAccidente, value: formData.itpAccidenteFormatted, prima: (Number(formData.itpAccidenteRaw) || 0) * 0.00008 },
                      { label: 'ITP Anticipo', active: formData.tieneITPAnticipo, value: formData.itpAnticipoFormatted, prima: (Number(formData.itpAnticipoRaw) || 0) * 0.00005 },
                      { label: 'Enfermedades Graves (Suma)', active: formData.tieneEnfermedadesGravesSuma, value: formData.egSumaFormatted, prima: (Number(formData.egSumaRaw) || 0) * 0.0002 },
                      { label: 'Enfermedades Graves (Anticipo)', active: formData.tieneEnfermedadesGravesAnticipo, value: formData.egAnticipoFormatted, prima: (Number(formData.egAnticipoRaw) || 0) * 0.00015 },
                      { label: 'Renta Incapacidad', active: formData.tieneRentaIncapacidad, value: 'Amparado', prima: 15000 },
                      { label: 'Accidentes Personales', active: formData.tieneAccidentesPersonales, value: formData.apFormatted, prima: (Number(formData.apRaw) || 0) * 0.00012 },
                    ].filter(a => a.active).map((anexo, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200/50">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-bolivar-sec">{anexo.label}</span>
                          <span className="text-[10px] text-gray-400 italic">Suma Asegurada: {anexo.value}</span>
                        </div>
                        <span className="text-xs font-black text-bolivar-green">{formatCurrency(Math.round(anexo.prima))}</span>
                      </div>
                    ))}

                    {(formData.ahorroTab === 'rentas' || formData.ahorroTab === 'necesidades' || Number(formData.ahorroMensualRaw) > 0) && (
                      <div className="mt-4 pt-2 border-t border-bolivar-green/20">
                        <h4 className="text-[10px] font-black text-bolivar-green uppercase tracking-widest mb-2">Ahorro y Proyección</h4>
                        {formData.ahorroTab === 'rentas' && Number(formData.rentaCuotaMensualRaw) > 0 && (
                          <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-bold text-bolivar-sec">Ahorro para Rentas</span>
                            <span className="text-xs font-black text-bolivar-green">{formData.rentaCuotaMensualFormatted}</span>
                          </div>
                        )}
                        {formData.ahorroTab === 'necesidades' && Number(formData.necesidadCuotaMensualRaw) > 0 && (
                          <div className="flex justify-between items-center py-1">
                            <span className="text-xs font-bold text-bolivar-sec">Ahorro para Necesidades</span>
                            <span className="text-xs font-black text-bolivar-green">{formData.necesidadCuotaMensualFormatted}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4">
                      <span className="text-xs font-black text-gray-400 uppercase">Periodicidad de Pago</span>
                      <span className="text-xs font-black text-modern-green uppercase">{formData.periodicidadPrima}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Declaración de Asegurabilidad */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <h3 className="text-sm font-black text-bolivar-green uppercase tracking-widest mb-4 border-b pb-2">3. Declaración de Asegurabilidad</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-bolivar-sec">Declaración Presentada</p>
                      <p className="text-[10px] text-gray-400 font-mono">N° {formData.numDeclaracion || 'N/A'}</p>
                    </div>
                    {hasSecondQuote && (
                      <div className="ml-auto bg-bolivar-yellow/20 px-3 py-1 rounded-full border border-bolivar-yellow/30">
                        <span className="text-[10px] font-black text-bolivar-green uppercase">Con Recargo (+15%)</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-bolivar-green p-6 rounded-xl shadow-lg transform hover:scale-[1.01] transition-transform">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-bolivar-yellow font-black uppercase text-[10px] tracking-widest">Valor de Prima Mensual</span>
                      <div className="text-4xl font-black text-white mt-1">{formatCurrency(primaMensual)}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-white/60 font-bold uppercase text-[10px] block">Vigencia</span>
                      <p className="text-white font-bold text-sm">Anual Renovable</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="bv-card text-center animate-fadeIn shadow-2xl border-modern-green border-2 max-w-4xl mx-auto mt-10 p-12">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 border-4 border-modern-green mb-8 shadow-lg">
            <CheckCircle2 className="h-12 w-12 text-modern-green" />
          </div>
          <h1 className="text-4xl mb-3 text-bolivar-green font-bold">¡Póliza Emitida Exitosamente!</h1>
          <div className="max-w-xl mx-auto mb-10 text-left bg-bg-app border rounded-card p-6 shadow-inner text-center">
            <p className="bv-label inline text-bolivar-sec">Número Póliza:</p>
            <p className="text-5xl font-extrabold text-modern-green font-mono tracking-wider mt-2">
              1034886234098
            </p>
            <p className="text-sm text-bolivar-sec mt-2 opacity-70">Número FV radicado: 13274</p>
          </div>
          <div className="text-base text-text-main mb-12 max-w-2xl mx-auto space-y-4 bg-white p-8 rounded-card border text-left shadow-sm">
            <p>
              📧 Carátula enviada a: <strong className="text-bolivar-green">{formData.tomadorCorreo}</strong>. Por
              favor revisar su bandeja de entrada.
            </p>
            <p>✍️ Adicionalmente, se inició el proceso de firma electrónica.</p>
          </div>
          {formData.requiereExamenes && (
            <div className="mb-10 bg-amber-50 border border-amber-300 p-5 rounded-lg text-amber-900 text-left max-w-xl mx-auto animate-fadeIn shadow">
              <p className="font-bold text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> NOTA: Pendiente Suscripción
              </p>
              <p className="text-sm">
                Se requiere exámenes médicos. Solicitud **N° {formData.numSolicitudExamen}**.
              </p>
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <button className="bv-btn-pill-secondary shadow">Descargar Carátula</button>
            <button className="bv-btn-pill-primary shadow" onClick={() => window.location.reload()}>
              Nueva Solicitud
            </button>
          </div>
        </div>
      )}

      {currentStep < 5 && (
        <div className="fixed bottom-0 left-[260px] right-0 bg-white p-4 shadow-lg border-t border-gray-100 z-40 animate-fadeIn">
          <div className="max-w-7xl mx-auto flex justify-end gap-4 items-center">
            {currentStep > 1 && (
              <button
                className="bv-btn-pill-secondary shadow flex items-center gap-2"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                <ArrowLeft className="w-4 h-4" /> Atrás
              </button>
            )}
            {currentStep === 1 && (
              <button
                className="bv-btn-pill-primary shadow flex items-center gap-2"
                onClick={irStep2Coberturas}
                disabled={!isStepValid}
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {currentStep === 2 && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowStep2FinalizeConfirm(true)}
                  disabled={!isStep2Valid}
                  className={`bv-btn-pill-secondary shadow flex items-center gap-2 ${!isStep2Valid ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Finalizar Cotización
                </button>
                <button
                  className={`bv-btn-pill-primary shadow flex items-center gap-2 ${!isStep2Valid ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={irStep3Salud}
                  disabled={!isStep2Valid}
                >
                  Suscribir <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {currentStep === 3 && (
              <button
                className="bv-btn-pill-primary shadow flex items-center gap-2"
                onClick={() => {
                  if (!hasSecondQuote) {
                    setShowSurchargeWarning(true);
                  } else {
                    irStep4Emision();
                  }
                }}
                disabled={!isStepValid}
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {currentStep === 4 && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setEmailToSend(formData.tomadorCorreo);
                    setIsSendModalOpen(true);
                    setIsQuoteSaved(true);
                    setHistorialCotizaciones(prev => [
                      ...prev,
                      {
                        id: sessionData.numCotizacion,
                        fecha: sessionData.fechaCotizacion,
                        tomador: `${formData.tomadorNombres} ${formData.tomadorApellidos}`,
                        prima: formatCurrency(primaMensual),
                        estado: 'Enviada'
                      }
                    ]);
                  }}
                  disabled={!isStepValid}
                  className={`bv-btn-pill-primary shadow flex items-center gap-2 ${!isStepValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Smartphone className="w-4 h-4" /> Guardar y Enviar Cotización
                </button>
                <button
                  className={`bv-btn-pill-primary shadow flex items-center gap-2 ${(!isStepValid || !isQuoteSaved) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={finalizarEmision}
                  disabled={!isStepValid || !isQuoteSaved}
                >
                  Finalizar y Emitir <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showDeclarationConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-card p-10 max-w-lg w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-4 mb-8 border-b pb-4">
              <AlertCircle className="w-12 h-12 text-bolivar-green" />
              <div>
                <h3 className="text-2xl text-bolivar-green font-semibold">Presentar Declaración</h3>
                <p className="text-bolivar-sec text-sm">¿Está seguro que desea presentar la declaración de salud? Una vez presentada no podrá ser modificada.</p>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeclarationConfirmModal(false)}
                className="bv-btn-pill-secondary px-8"
              >
                No, Revisar
              </button>
              <button
                onClick={() => {
                  setIsDeclarationConfirmed(true);
                  setIsDeclarationPresented(true);
                  setShowDeclarationConfirmModal(false);
                  // Set extra prima (surcharge)
                  setFormData(prev => ({ ...prev, extraPrima: 15 }));
                  // Trigger surcharge warning immediately after presenting
                  setShowSurchargeWarning(true);
                }}
                className="bv-btn-pill-primary px-8"
              >
                Sí, Presentar
              </button>
            </div>
          </div>
        </div>
      )}

      {showSurchargeWarning && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-card p-10 max-w-lg w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-4 mb-8 border-b pb-4">
              <AlertTriangle className="w-12 h-12 text-bolivar-yellow" />
              <div>
                <h3 className="text-2xl text-bolivar-green font-semibold">Advertencia de Recargo</h3>
                <p className="text-bolivar-sec text-sm">Se ha modificado el valor inicial de cotización dada la declaración se identifica un recargo de la prima.</p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl mb-8">
              <p className="text-sm text-gray-600 mb-2">
                Se ha generado una segunda cotización con los valores ajustados según su declaración de salud.
              </p>
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase">Nueva Prima</span>
                <span className="text-xl font-bold text-bolivar-green">{formatCurrency(primaMensual)}</span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setHasSecondQuote(true);
                  setShowSurchargeWarning(false);
                  irStep4Emision();
                }}
                className="bv-btn-pill-primary px-12"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {isFinalizeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-card p-10 max-w-lg w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-4 mb-8 border-b pb-4">
              <AlertCircle className="w-12 h-12 text-bolivar-green" />
              <div>
                <h3 className="text-2xl text-bolivar-green font-semibold">Finalizar Cotización</h3>
                <p className="text-bolivar-sec text-sm">¿Está seguro que desea finalizar esta cotización?</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsFinalizeModalOpen(false)}
                className="flex-1 bv-btn-pill-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setIsFinalizeModalOpen(false);
                  setIsQuoteSaved(true);
                  setHistorialCotizaciones(prev => [
                    ...prev,
                    {
                      id: sessionData.numCotizacion,
                      fecha: sessionData.fechaCotizacion,
                      tomador: `${formData.tomadorNombres} ${formData.tomadorApellidos}`,
                      prima: formatCurrency(primaMensual),
                      estado: 'Finalizada'
                    }
                  ]);
                }}
                className="flex-1 bv-btn-pill-primary"
              >
                Sí, Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {showStep2FinalizeConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-card p-10 max-w-lg w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-4 mb-8 border-b pb-4">
              <AlertCircle className="w-12 h-12 text-bolivar-green" />
              <div>
                <h3 className="text-2xl text-bolivar-green font-semibold">Finalizar Cotización</h3>
                <p className="text-bolivar-sec text-sm">¿Está seguro que desea finalizar el proceso e ir al Resumen de Cotización?</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowStep2FinalizeConfirm(false)}
                className="flex-1 bv-btn-pill-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowStep2FinalizeConfirm(false);
                  setHasSecondQuote(true);
                  if (!formData.numDeclaracion) {
                    setFormData((prev) => ({
                      ...prev,
                      numDeclaracion: generarNumero('', 10),
                      numSolicitudExamen: generarNumero('', 8),
                    }));
                  }
                  setCurrentStep(4);
                }}
                className="flex-1 bv-btn-pill-primary"
              >
                Sí, Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-card p-10 max-w-lg w-full shadow-2xl animate-fadeIn">
            <div className="flex items-center gap-4 mb-8 border-b pb-4">
              <AlertCircle className="w-12 h-12 text-red-600" />
              <div>
                <h3 className="text-2xl text-red-700 font-semibold">Confirmación Emisión</h3>
                <p className="text-bolivar-sec text-sm">Por favor revise los datos antes de continuar.</p>
              </div>
            </div>
            <div className="bg-bg-app p-6 rounded-lg border mb-8 text-left space-y-2 text-sm shadow-inner">
              <p>
                <span className="font-bold text-bolivar-green">Asegurado:</span> {formData.aseguradoNombres}{' '}
                ({formData.aseguradoNumDoc})
              </p>
              <p>
                <span className="font-bold text-bolivar-green">Producto:</span> Portafolio Tranquilidad
              </p>
              <p>
                <span className="font-bold text-bolivar-green">Prima:</span>{' '}
                <span className="text-2xl font-bold text-modern-green">{formatCurrency(primaMensual)}</span>
              </p>
            </div>
            <p className="text-text-main mb-8 text-center font-semibold text-lg">
              ¿Está seguro de continuar con la emisión definitiva?
            </p>
            <div className="flex gap-4 justify-center border-t pt-8">
              <button
                className="bv-btn-pill-secondary flex-1 shadow"
                onClick={() => setIsModalOpen(false)}
                disabled={isEmitting}
              >
                Cancelar
              </button>
              <button
                className="bv-btn-pill-primary flex-1 min-w-[200px] shadow"
                onClick={ejecutarEmisionFinal}
                disabled={isEmitting}
              >
                {isEmitting ? 'Emitiendo...' : 'Sí, Emitir ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEmitting && (
        <div className="fixed inset-0 bg-white/95 z-[2000] flex flex-col items-center justify-center gap-4 text-bolivar-green animate-fadeIn">
          <Loader2 className="animate-spin h-16 w-16" />
          <p className="text-3xl font-bold">Emitiendo póliza...</p>
        </div>
      )}
      </main>

      {/* Modals */}
      {showConflictPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-bolivar-yellow/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-bolivar-yellow"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-inner">
                <AlertTriangle className="w-10 h-10 text-bolivar-yellow" />
              </div>
              <h3 className="text-2xl font-black text-bolivar-green mb-4 tracking-tight">Conflicto de Coberturas</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                No es posible seleccionar <span className="font-bold text-bolivar-green">Suma Adicional</span> y <span className="font-bold text-bolivar-green">Anticipo</span> simultáneamente para la cobertura de ITP.
                <br/><br/>
                Por favor, elija solo una de las opciones.
              </p>
              <button
                onClick={() => setShowConflictPopup(false)}
                className="w-full bv-btn-pill-primary py-4 text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-modern-green/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-modern-green"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-modern-green" />
              </div>
              <h3 className="text-2xl font-black text-bolivar-green mb-4 tracking-tight">¡Cotización Guardada!</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                La cotización <span className="font-mono font-bold text-bolivar-green">{sessionData.numCotizacion}</span> ha sido guardada exitosamente en el historial.
              </p>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="w-full bv-btn-pill-primary py-4 text-lg shadow-xl"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {isSendModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-bolivar-green/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-bolivar-green"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-inner">
                <Smartphone className="w-10 h-10 text-bolivar-green" />
              </div>
              <h3 className="text-2xl font-black text-bolivar-green mb-4 tracking-tight">Enviar Cotización</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Ingrese el correo electrónico para enviar la cotización <span className="font-mono font-bold text-bolivar-green">{sessionData.numCotizacion}</span>.
              </p>
              <div className="w-full mb-8">
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={emailToSend}
                  onChange={(e) => setEmailToSend(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                />
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsSendModalOpen(false)}
                  className="flex-1 bv-btn-pill-secondary py-3"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setIsSendModalOpen(false);
                    setIsSaveModalOpen(true);
                  }}
                  disabled={!validateEmail(emailToSend)}
                  className={`flex-1 bv-btn-pill-primary py-3 shadow-lg ${!validateEmail(emailToSend) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPDFModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-bolivar-green p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-bolivar-yellow" />
                <span className="font-bold tracking-tight">Vista Previa Cotización - {sessionData.numCotizacion}</span>
              </div>
              <button 
                onClick={() => setIsPDFModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 bg-gray-200 p-8 overflow-auto flex justify-center">
              <div className="bg-white w-[800px] h-[1100px] shadow-2xl p-12 flex flex-col relative">
                {/* PDF Mock Content */}
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-bolivar-green rounded-xl flex items-center justify-center">
                      <Shield className="text-bolivar-yellow w-8 h-8" />
                    </div>
                    <div className="text-bolivar-green font-black text-2xl">Seguros Bolívar</div>
                  </div>
                  <div className="text-right">
                    <div className="text-bolivar-green font-black text-xl">COTIZACIÓN VIDA INDIVIDUAL</div>
                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">N° {sessionData.numCotizacion}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div className="space-y-4">
                    <h4 className="text-bolivar-green font-black text-xs uppercase tracking-widest border-b border-gray-100 pb-2">Información del Cliente</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400 font-bold uppercase text-[10px] block">Tomador:</span> <span className="font-bold text-bolivar-green">{formData.tomadorNombres} {formData.tomadorApellidos}</span></p>
                      <p><span className="text-gray-400 font-bold uppercase text-[10px] block">Documento:</span> <span className="font-bold text-bolivar-green">{formData.tomadorTipoDoc} {formData.tomadorNumDoc}</span></p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-bolivar-green font-black text-xs uppercase tracking-widest border-b border-gray-100 pb-2">Detalles de la Póliza</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400 font-bold uppercase text-[10px] block">Fecha Generación:</span> <span className="font-bold text-bolivar-green">{sessionData.fechaCotizacion}</span></p>
                      <p><span className="text-gray-400 font-bold uppercase text-[10px] block">Periodicidad:</span> <span className="font-bold text-bolivar-green uppercase">{formData.periodicidadPrima}</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 border-t border-gray-100 pt-8">
                  <table className="w-full mb-8">
                    <thead>
                      <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <th className="pb-4">Cobertura</th>
                        <th className="pb-4 text-right">Suma Asegurada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr className="text-sm">
                        <td className="py-4 font-bold text-bolivar-green">Amparo Básico Vida</td>
                        <td className="py-4 text-right font-mono font-bold text-bolivar-green">{formData.amparoBasicoFormatted}</td>
                      </tr>
                      {formData.tieneITPEnfermedad && (
                        <tr className="text-sm">
                          <td className="py-4 font-bold text-bolivar-green">ITP Enfermedad</td>
                          <td className="py-4 text-right font-mono font-bold text-bolivar-green">{formData.itpEnfermedadFormatted}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="bg-bolivar-green/5 p-8 rounded-3xl border border-bolivar-green/10 flex justify-between items-center">
                  <div>
                    <div className="text-[10px] font-black text-bolivar-green uppercase tracking-widest mb-1">Total Prima {formData.periodicidadPrima}</div>
                    <div className="text-4xl font-black text-bolivar-green font-mono tracking-tighter">{formatCurrency(primaMensual)}</div>
                  </div>
                  <div className="w-24 h-24 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center text-[10px] text-gray-400 font-bold text-center uppercase">QR Code</div>
                  </div>
                </div>

                <div className="mt-12 text-[9px] text-gray-400 leading-relaxed italic text-center">
                  Esta cotización tiene una validez de 30 días calendario a partir de su fecha de emisión. Sujeta a políticas de suscripción de Seguros Bolívar.
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 flex justify-center gap-4 border-t">
              <button className="bv-btn-pill-secondary px-8 flex items-center gap-2">
                <Download className="w-4 h-4" /> Descargar PDF
              </button>
              <button className="bv-btn-pill-primary px-8 flex items-center gap-2">
                <Smartphone className="w-4 h-4" /> Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
