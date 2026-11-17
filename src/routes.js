import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Cpu,
  FileCheck2,
  ShieldCheck
} from 'lucide-react'

export const MODULE_ROUTES = [
  {
    id: 'etapa1',
    path: '/transferencia-usados',
    label: 'Transferência de Usados',
    icon: ArrowLeftRight
  },
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard & Auditoria',
    icon: Activity
  },
  {
    id: 'etapa2',
    path: '/antifraude',
    label: 'Etapa II · Antifraude',
    icon: AlertTriangle
  },
  {
    id: 'etapa3',
    path: '/visao-computacional',
    label: 'Etapa III · 100 Imagens (IA)',
    icon: Cpu
  },
  {
    id: 'mesa',
    path: '/mesa-revisora',
    label: 'Mesa Revisora & Faixas',
    icon: ShieldCheck
  }
]
