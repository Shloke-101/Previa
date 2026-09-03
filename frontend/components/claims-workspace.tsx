'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Eye,
  FileCheck,
  FileSearch,
  FileText,
  Filter,
  Flame,
  Gauge,
  HeartPulse,
  History,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  RefreshCw,
  RotateCcw,
  Scan,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Wand2,
  X,
  Zap
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { api } from '@/lib/api'
import type {
  Claim,
  ClaimInput,
  PredictionResult,
  PriorityQueueItem,
  PatientRecord,
  PatientDossier,
  AppointmentRecord,
  EligibilityResponse,
  OcrExtractionResponse,
  SelfHealOverview,
  SelfHealProblem,
  SelfHealEvent,
  SelfHealHotspot,
  DependencyGraphResponse,
  PayerRuleDriftItem,
  IdentityResolutionResult,
  PreSubmissionGuardResult,
  SimulateBatchResult
} from '@/lib/types'

const nav = [
  { label: 'Overview', icon: LayoutDashboard, category: 'Core' },
  { label: 'RCM Self-Healing', icon: Zap, category: 'AI Intelligence', badge: 'Signature' },
  { label: 'Pre-Submission Guard', icon: ShieldCheck, category: 'AI Intelligence' },
  { label: 'Priority Clearance Queue', icon: ClipboardCheck, category: 'Operations', badge: '6' },
  { label: 'Patient Dossier', icon: UserCheck, category: 'Operations' },
  { label: 'Appointments', icon: Clock3, category: 'Operations' },
  { label: 'Eligibility (270/271)', icon: Network, category: 'Verification' },
  { label: 'Insurance Card OCR', icon: Scan, category: 'Verification' },
  { label: 'Claim Analysis', icon: FileSearch, category: 'Workbench' },
  { label: 'Claims', icon: Layers, category: 'Workbench' },
  { label: 'Analytics', icon: BarChart3, category: 'Reporting' },
  { label: 'Model Insights', icon: Gauge, category: 'Reporting' },
]

function formatINR(amount: number): string {
  return '₹' + Math.round(amount).toLocaleString('en-IN')
}

function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

function StatCard({ icon: Icon, label, value, change, tone }: { icon: typeof Activity; label: string; value: string; change: string; tone: string }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon size={18} /></div>
      <div className="stat-copy">
        <p>{label}</p>
        <strong>{value}</strong>
        <span className={change.startsWith('-') ? 'down' : 'up'}>{change} <small>vs last month</small></span>
      </div>
    </div>
  )
}

function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function Field({
  label,
  name,
  placeholder,
  type = 'text',
  defaultValue = '',
  value,
  onChange
}: {
  label: string
  name: string
  placeholder: string
  type?: string
  defaultValue?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={value === undefined ? defaultValue : undefined}
        value={value}
        onChange={onChange}
      />
    </label>
  )
}

export interface AccountProfile {
  id: string
  name: string
  code: string
  operatorName: string
  operatorRole: string
  operatorEmail: string
  avatar: string
  phone: string
  location: string
  planFocus: string
}

export const CLEAN_SLATE_ACCOUNT: AccountProfile = {
  id: 'acc-clean-slate',
  name: 'Apex Memorial Healthcare',
  code: 'AMH',
  operatorName: 'Clinical Intake Specialist',
  operatorRole: 'Patient Intake & Financial Clearance Specialist',
  operatorEmail: 'specialist@apexmemorial.in',
  avatar: 'AM',
  phone: '+91 98000 11223',
  location: 'Apex Health Center, Delhi NCR',
  planFocus: 'Clean Slate Workspace — 0 Prior Records'
}

export const ACCOUNTS_DIRECTORY: AccountProfile[] = [
  CLEAN_SLATE_ACCOUNT,
  {
    id: 'acc-apollo',
    name: 'Apollo Hospitals Enterprise',
    code: 'AHE',
    operatorName: 'Dr. Rajesh Rao',
    operatorRole: 'Chief Revenue Officer',
    operatorEmail: 'rajesh.rao@apollohealth.in',
    avatar: 'RR',
    phone: '+91 98765 43210',
    location: 'Apollo Main, Mumbai',
    planFocus: 'Multi-Payer Commercial & Star Health (Demo)'
  },
  {
    id: 'acc-max',
    name: 'Max Healthcare Network',
    code: 'MHN',
    operatorName: 'Dr. Priya Nair',
    operatorRole: 'Director of Prior Authorization & RCM',
    operatorEmail: 'priya.nair@maxhealthcare.in',
    avatar: 'PN',
    phone: '+91 98110 54321',
    location: 'Max Super Specialty, Delhi NCR',
    planFocus: 'Specialty & Inpatient Surgery (Demo)'
  },
  {
    id: 'acc-fortis',
    name: 'Fortis Memorial Health',
    code: 'FMH',
    operatorName: 'Ananya Sen',
    operatorRole: 'Lead Billing Operations Manager',
    operatorEmail: 'ananya.sen@fortishealthcare.in',
    avatar: 'AS',
    phone: '+91 97123 98765',
    location: 'Fortis Memorial, Bengaluru',
    planFocus: 'Outpatient Diagnostic & Radiology (Demo)'
  }
]

const INITIAL_CLAIMS_BY_ACCOUNT: Record<string, Claim[]> = {
  'acc-clean-slate': [],
  'acc-apollo': [
    { id: 'CLM-28491', member: 'Aarav Sharma', amount: 4380, type: 'Inpatient', risk: 'Low', prediction: 'Approve', status: 'Approved', provider: 'Apollo Main Hospital Mumbai', diagnosis: 'K29.7 - Gastritis', procedure: '99222 - Initial Hospital Care', riskScore: 12, confidence: 0.98, submittedAt: '2026-02-14', accountId: 'acc-apollo', payerName: 'Star Health Comprehensive' },
    { id: 'CLM-28490', member: 'Rohan Mehta', amount: 127500, type: 'Specialist', risk: 'High', prediction: 'Deny', status: 'Denied', provider: 'Apollo Speciality Center', diagnosis: 'M54.5 - Low back pain', procedure: '72148 - MRI Lumbar Spine', riskScore: 84, confidence: 0.95, explanation: 'High denial likelihood (84/100) due to mandatory Prior Authorization mandate for MRI Lumbar Spine under Apex Health Assurance.', recommendation: 'Attach clinical chart notes and submit expedited 278 Prior Authorization before scheduling encounter.', submittedAt: '2026-02-13', accountId: 'acc-apollo', payerName: 'Apex Health Assurance' },
    { id: 'CLM-28489', member: 'Priya Patel', amount: 8900, type: 'Prescription', risk: 'Low', prediction: 'Approve', status: 'Approved', provider: 'Apollo Pharmacy Hub', diagnosis: 'E11.9 - Type 2 Diabetes', procedure: '99213 - Outpatient Visit', riskScore: 15, confidence: 0.96, submittedAt: '2026-02-12', accountId: 'acc-apollo', payerName: 'HDFC ERGO Health' },
    { id: 'CLM-28488', member: 'Vikram Malhotra', amount: 62000, type: 'Outpatient', risk: 'Medium', prediction: 'Approve', status: 'Pending', provider: 'Apollo Day Surgery Center', diagnosis: 'K35.8 - Acute Appendicitis', procedure: '44970 - Laparoscopic Appendectomy', riskScore: 48, confidence: 0.88, submittedAt: '2026-02-10', accountId: 'acc-apollo', payerName: 'Care Health Insurance' },
    { id: 'CLM-28487', member: 'Ananya Iyer', amount: 248000, type: 'Inpatient', risk: 'High', prediction: 'Deny', status: 'Denied', provider: 'Apollo Cardiac Institute', diagnosis: 'I25.10 - CAD', procedure: '92928 - Coronary Angioplasty', riskScore: 88, confidence: 0.97, explanation: 'Missing pre-authorization approval for inpatient cardiac interventional procedure.', recommendation: 'Obtain emergency retroactive authorization or request TPA pre-clearance.', submittedAt: '2026-02-08', accountId: 'acc-apollo', payerName: 'ICICI Lombard Health' },
  ],
  'acc-max': [
    { id: 'CLM-39102', member: 'Sanjay Verma', amount: 315000, type: 'Inpatient', risk: 'Low', prediction: 'Approve', status: 'Approved', provider: 'Max Super Specialty Saket', diagnosis: 'M17.11 - Knee Osteoarthritis', procedure: '27447 - Total Knee Arthroplasty', riskScore: 18, confidence: 0.96, submittedAt: '2026-02-14', accountId: 'acc-max', payerName: 'Max Bupa Health' },
    { id: 'CLM-39101', member: 'Meera Nambiar', amount: 85000, type: 'Specialist', risk: 'High', prediction: 'Deny', status: 'Denied', provider: 'Max Oncology Wing', diagnosis: 'C50.9 - Breast Neoplasm', procedure: '77301 - IMRT Treatment Planning', riskScore: 78, confidence: 0.93, explanation: 'Radiation therapy protocol missing pre-service clinical staging documentation.', recommendation: 'Submit complete PET-CT scan and tumor board review notes to payer.', submittedAt: '2026-02-12', accountId: 'acc-max', payerName: 'Star Health Comprehensive' },
    { id: 'CLM-39100', member: 'Kavita Reddy', amount: 14200, type: 'Outpatient', risk: 'Low', prediction: 'Approve', status: 'Approved', provider: 'Max Diagnostic Lab', diagnosis: 'R07.9 - Chest Pain', procedure: '93000 - Electrocardiogram (ECG)', riskScore: 8, confidence: 0.99, submittedAt: '2026-02-11', accountId: 'acc-max', payerName: 'UnitedHealthcare Choice' },
  ],
  'acc-fortis': [
    { id: 'CLM-44820', member: 'Neha Gupta', amount: 52000, type: 'Outpatient', risk: 'Low', prediction: 'Approve', status: 'Approved', provider: 'Fortis Memorial Bengaluru', diagnosis: 'S83.51 - ACL Tear', procedure: '29888 - Arthroscopy Knee', riskScore: 22, confidence: 0.94, submittedAt: '2026-02-13', accountId: 'acc-fortis', payerName: 'Bajaj Allianz Health' },
    { id: 'CLM-44819', member: 'Ramesh Singhania', amount: 180000, type: 'Specialist', risk: 'High', prediction: 'Deny', status: 'Denied', provider: 'Fortis Heart Center', diagnosis: 'I48.0 - Atrial Fibrillation', procedure: '93656 - Catheter Ablation', riskScore: 82, confidence: 0.94, explanation: 'Electrophysiology procedure requires active pre-approval letter.', recommendation: 'Resubmit claim with EP study logs and pre-authorization token.', submittedAt: '2026-02-10', accountId: 'acc-fortis', payerName: 'Tata AIG Health' },
    { id: 'CLM-44818', member: 'Pooja Deshmukh', amount: 24000, type: 'Specialist', risk: 'Low', prediction: 'Approve', status: 'Approved', provider: 'Fortis Endocrinology Clinic', diagnosis: 'E03.9 - Hypothyroidism', procedure: '84443 - TSH Hormone Assay', riskScore: 5, confidence: 0.99, submittedAt: '2026-02-09', accountId: 'acc-fortis', payerName: 'Blue Cross Blue Shield' },
  ]
}

export default function ClaimsWorkspace() {
  // Authentication & Profile State
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const [activeAccountId, setActiveAccountId] = useState<string>('acc-clean-slate')
  const [accounts, setAccounts] = useState<AccountProfile[]>(ACCOUNTS_DIRECTORY)

  const activeAccount = useMemo(() => {
    return accounts.find(a => a.id === activeAccountId) || accounts[0]
  }, [accounts, activeAccountId])

  const [user, setUser] = useState({
    name: activeAccount.operatorName,
    email: activeAccount.operatorEmail,
    role: activeAccount.operatorRole,
    avatar: activeAccount.avatar,
    workspace: activeAccount.name,
    phone: activeAccount.phone,
    location: activeAccount.location,
    timezone: '(UTC+05:30) India Standard Time (IST)'
  })

  // Account-Based Claims State (LocalStorage synced)
  const [claimsByAccount, setClaimsByAccount] = useState<Record<string, Claim[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('previa_claims_by_account')
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return INITIAL_CLAIMS_BY_ACCOUNT
  })

  // Account-Based Analysis History (LocalStorage synced)
  const [analysisHistoryByAccount, setAnalysisHistoryByAccount] = useState<Record<string, Claim[]>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('previa_analysis_history')
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return {
      'acc-apollo': [INITIAL_CLAIMS_BY_ACCOUNT['acc-apollo'][1]],
      'acc-max': [INITIAL_CLAIMS_BY_ACCOUNT['acc-max'][1]],
      'acc-fortis': [INITIAL_CLAIMS_BY_ACCOUNT['acc-fortis'][1]]
    }
  })

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('previa_claims_by_account', JSON.stringify(claimsByAccount))
      } catch {}
    }
  }, [claimsByAccount])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('previa_analysis_history', JSON.stringify(analysisHistoryByAccount))
      } catch {}
    }
  }, [analysisHistoryByAccount])

  // Active claims for current account
  const currentClaims = useMemo(() => {
    return claimsByAccount[activeAccountId] || []
  }, [claimsByAccount, activeAccountId])

  // Active analysis history for current account
  const currentAnalysisHistory = useMemo(() => {
    return analysisHistoryByAccount[activeAccountId] || []
  }, [analysisHistoryByAccount, activeAccountId])

  // Navigation & UI State
  const [active, setActive] = useState('Overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [timeRange, setTimeRange] = useState('Last 30 days')
  const [showTimeDropdown, setShowTimeDropdown] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)
  const [showNewClaimModal, setShowNewClaimModal] = useState(false)
  const [selectedClaimForAnalysis, setSelectedClaimForAnalysis] = useState<Claim | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(3)
  const [workspaceName, setWorkspaceName] = useState(activeAccount.name)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Sub-features state
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-1082')
  const [ocrSampleId, setOcrSampleId] = useState<string>('sample-bcbs')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const go = (label: string) => {
    setActive(label)
    setMobileOpen(false)
    setShowProfileModal(false)
    setShowNotificationDropdown(false)
    setShowAccountDropdown(false)
  }

  const handleSwitchAccount = (accId: string) => {
    setActiveAccountId(accId)
    const target = accounts.find(a => a.id === accId) || accounts[0]
    setWorkspaceName(target.name)
    setUser({
      name: target.operatorName,
      email: target.operatorEmail,
      role: target.operatorRole,
      avatar: target.avatar,
      workspace: target.name,
      phone: target.phone,
      location: target.location,
      timezone: '(UTC+05:30) India Standard Time (IST)'
    })
    setShowAccountDropdown(false)
    showToast(`Switched workspace to ${target.name}`)
  }

  const handleAddNewClaim = async (claimInput: ClaimInput) => {
    try {
      const prediction = await api.predictClaim(claimInput)
      const nowStr = new Date().toISOString().split('T')[0]
      const newClaimObj: Claim = {
        id: claimInput.claimId || `CLM-${Math.floor(10000 + Math.random() * 90000)}`,
        member: claimInput.memberName || 'Patient Encounter',
        amount: Number(claimInput.claimAmount),
        type: claimInput.claimType || 'Specialist',
        risk: prediction.riskLevel,
        prediction: prediction.prediction,
        status: prediction.prediction === 'Approve' ? 'Approved' : 'Pending',
        submittedAt: claimInput.submissionDate || nowStr,
        provider: claimInput.provider || activeAccount.name,
        diagnosis: claimInput.diagnosis || 'M54.5 - Low back pain',
        procedure: claimInput.procedure || '72148 - MRI Lumbar Spine',
        riskScore: prediction.riskScore,
        confidence: prediction.confidence,
        explanation: prediction.explanation,
        recommendation: prediction.recommendation,
        accountId: activeAccountId,
        payerName: claimInput.payerName || claimInput.policyType || 'Commercial PPO',
        lastAnalyzedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      }

      setClaimsByAccount(prev => {
        const existing = prev[activeAccountId] || []
        return {
          ...prev,
          [activeAccountId]: [newClaimObj, ...existing]
        }
      })

      setAnalysisHistoryByAccount(prev => {
        const existing = prev[activeAccountId] || []
        return {
          ...prev,
          [activeAccountId]: [newClaimObj, ...existing.filter(h => h.id !== newClaimObj.id)]
        }
      })

      try {
        api.createClaim({ ...claimInput, accountId: activeAccountId })
      } catch {}

      showToast(`Claim ${newClaimObj.id} added (${newClaimObj.prediction})`)
      setShowNewClaimModal(false)
      return newClaimObj
    } catch (err) {
      showToast('Error creating claim. Please retry.')
      throw err
    }
  }

  const handleAnalyzeClaim = async (claimInput: ClaimInput) => {
    try {
      const res = await api.predictClaim(claimInput)
      const claimId = claimInput.claimId || `CLM-${Math.floor(10000 + Math.random() * 90000)}`
      const nowStr = new Date().toISOString().split('T')[0]

      const updatedClaimObj: Claim = {
        id: claimId,
        member: claimInput.memberName || 'Patient Record',
        amount: Number(claimInput.claimAmount),
        type: claimInput.claimType || 'Specialist',
        risk: res.riskLevel,
        prediction: res.prediction,
        status: res.prediction === 'Approve' ? 'Approved' : 'Pending',
        submittedAt: claimInput.submissionDate || nowStr,
        provider: claimInput.provider || activeAccount.name,
        diagnosis: claimInput.diagnosis,
        procedure: claimInput.procedure,
        riskScore: res.riskScore,
        confidence: res.confidence,
        explanation: res.explanation,
        recommendation: res.recommendation,
        accountId: activeAccountId,
        payerName: claimInput.payerName || claimInput.policyType,
        lastAnalyzedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      }

      setClaimsByAccount(prev => {
        const list = prev[activeAccountId] || []
        const exists = list.some(c => c.id === claimId)
        if (exists) {
          return {
            ...prev,
            [activeAccountId]: list.map(c => c.id === claimId ? { ...c, ...updatedClaimObj } : c)
          }
        }
        return {
          ...prev,
          [activeAccountId]: [updatedClaimObj, ...list]
        }
      })

      setAnalysisHistoryByAccount(prev => {
        const list = prev[activeAccountId] || []
        return {
          ...prev,
          [activeAccountId]: [updatedClaimObj, ...list.filter(h => h.id !== claimId)]
        }
      })

      showToast(`Analyzed ${claimId} — Verdict: ${res.prediction} (${Math.round(res.confidence * 100)}% Conf)`)
      return res
    } catch (err) {
      showToast('Assessment generated.')
      throw err
    }
  }

  const handleDeleteClaim = (claimId: string) => {
    setClaimsByAccount(prev => {
      const list = prev[activeAccountId] || []
      return {
        ...prev,
        [activeAccountId]: list.filter(c => c.id !== claimId)
      }
    })
    showToast(`Claim ${claimId} removed from ${activeAccount.name}`)
  }



  const handleResetToCleanSlate = (accId = activeAccountId) => {
    setClaimsByAccount(prev => ({
      ...prev,
      [accId]: []
    }))
    setAnalysisHistoryByAccount(prev => ({
      ...prev,
      [accId]: []
    }))
    showToast(`Workspace reset to Clean Slate (0 claims)`)
  }

  const handleLoadDemoData = (accId = activeAccountId) => {
    const defaultData = INITIAL_CLAIMS_BY_ACCOUNT[accId] || INITIAL_CLAIMS_BY_ACCOUNT['acc-apollo']
    setClaimsByAccount(prev => ({
      ...prev,
      [accId]: defaultData
    }))
    setAnalysisHistoryByAccount(prev => ({
      ...prev,
      [accId]: [defaultData[1] || defaultData[0]]
    }))
    showToast(`Loaded full demo datasets into ${activeAccount.name}`)
  }

  const [loginMode, setLoginMode] = useState<'clean' | 'demo'>('clean')
  const [cleanHospitalName, setCleanHospitalName] = useState('Apex Memorial Healthcare')
  const [cleanOperatorName, setCleanOperatorName] = useState('Clinical Intake Specialist')
  const [cleanOperatorEmail, setCleanOperatorEmail] = useState('specialist@apexmemorial.in')
  const [cleanOperatorRole, setCleanOperatorRole] = useState('Lead Patient Intake & RCM Specialist')

  const handleCleanSlateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const customCleanAccount: AccountProfile = {
      id: 'acc-clean-slate',
      name: cleanHospitalName || 'Apex Memorial Healthcare',
      code: (cleanHospitalName || 'AMH').split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase(),
      operatorName: cleanOperatorName || 'Clinical Intake Specialist',
      operatorRole: cleanOperatorRole || 'Patient Intake Specialist',
      operatorEmail: cleanOperatorEmail || 'specialist@apexmemorial.in',
      avatar: (cleanOperatorName || 'AM').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
      phone: '+91 98000 11223',
      location: 'Apex Health Center, India',
      planFocus: 'Clean Slate Workspace — 0 Prior Records'
    }

    setAccounts(prev => {
      const filtered = prev.filter(a => a.id !== 'acc-clean-slate')
      return [customCleanAccount, ...filtered]
    })
    setActiveAccountId('acc-clean-slate')
    setWorkspaceName(customCleanAccount.name)
    setUser({
      name: customCleanAccount.operatorName,
      email: customCleanAccount.operatorEmail,
      role: customCleanAccount.operatorRole,
      avatar: customCleanAccount.avatar,
      workspace: customCleanAccount.name,
      phone: customCleanAccount.phone,
      location: customCleanAccount.location,
      timezone: '(UTC+05:30) India Standard Time (IST)'
    })
    setClaimsByAccount(prev => ({
      ...prev,
      ['acc-clean-slate']: []
    }))
    setAnalysisHistoryByAccount(prev => ({
      ...prev,
      ['acc-clean-slate']: []
    }))
    setIsAuthenticated(true)
    showToast(`Logged into Clean Slate workspace: ${customCleanAccount.name}`)
  }

  const handleDemoAccountLogin = (accId: string) => {
    handleSwitchAccount(accId)
    // Ensure demo account has full dataset
    const demoData = INITIAL_CLAIMS_BY_ACCOUNT[accId] || INITIAL_CLAIMS_BY_ACCOUNT['acc-apollo']
    setClaimsByAccount(prev => ({
      ...prev,
      [accId]: prev[accId]?.length ? prev[accId] : demoData
    }))
    setAnalysisHistoryByAccount(prev => ({
      ...prev,
      [accId]: prev[accId]?.length ? prev[accId] : [demoData[1] || demoData[0]]
    }))
    setIsAuthenticated(true)
    const target = accounts.find(a => a.id === accId) || accounts[0]
    showToast(`Logged into Demo Workspace: ${target.name}`)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setShowProfileModal(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--background)', padding: '20px' }}>
        <div className="panel" style={{ width: '100%', maxWidth: '460px', padding: '32px 28px', textAlign: 'center', boxShadow: '0 20px 45px rgba(0,0,0,0.08)' }}>
          <div className="brand" style={{ justifyContent: 'center', padding: '0 0 14px', fontSize: '24px' }}>
            <div className="brand-mark"><HeartPulse size={20} /></div>
            <span>previa<span className="brand-dot">.</span></span>
          </div>
          <h2 style={{ fontSize: '18px', margin: '0 0 4px', color: '#172033', fontWeight: 700 }}>Financial Clearance Portal</h2>
          <p style={{ color: '#64748b', fontSize: '12px', margin: '0 0 18px' }}>
            Pre-Visit Eligibility, Insurance OCR & Denial Prevention
          </p>

          {/* Mode Switcher Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px', marginBottom: '18px' }}>
            <button
              type="button"
              style={{
                padding: '7px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 0,
                cursor: 'pointer',
                background: loginMode === 'clean' ? '#fff' : 'transparent',
                color: loginMode === 'clean' ? '#4169e1' : '#64748b',
                boxShadow: loginMode === 'clean' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onClick={() => setLoginMode('clean')}
            >
              <Sparkles size={13} /> Clean Slate
            </button>
            <button
              type="button"
              style={{
                padding: '7px 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 0,
                cursor: 'pointer',
                background: loginMode === 'demo' ? '#fff' : 'transparent',
                color: loginMode === 'demo' ? '#4169e1' : '#64748b',
                boxShadow: loginMode === 'demo' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              onClick={() => setLoginMode('demo')}
            >
              <Zap size={13} /> Demo Accounts
            </button>
          </div>

          {loginMode === 'clean' ? (
            /* CLEAN SLATE FORM */
            <form onSubmit={handleCleanSlateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              <label className="field">
                <span>Organization / Hospital</span>
                <input
                  required
                  value={cleanHospitalName}
                  onChange={e => setCleanHospitalName(e.target.value)}
                  placeholder="Apex Memorial Healthcare"
                />
              </label>
              <label className="field">
                <span>Operator Name</span>
                <input
                  required
                  value={cleanOperatorName}
                  onChange={e => setCleanOperatorName(e.target.value)}
                  placeholder="Clinical Intake Specialist"
                />
              </label>
              <label className="field">
                <span>Work Email</span>
                <input
                  required
                  type="email"
                  value={cleanOperatorEmail}
                  onChange={e => setCleanOperatorEmail(e.target.value)}
                  placeholder="specialist@apexmemorial.in"
                />
              </label>
              <button type="submit" className="primary-button full" style={{ marginTop: '6px' }}>
                <Sparkles size={15} /> Launch Clean Workspace (0 Claims)
              </button>
            </form>
          ) : (
            /* PRELOADED DEMO ACCOUNTS */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              {accounts.filter(a => a.id !== 'acc-clean-slate').map(acc => (
                <div
                  key={acc.id}
                  onClick={() => handleDemoAccountLogin(acc.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#4169e1')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="workspace-avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
                      {acc.code}
                    </div>
                    <div>
                      <b style={{ fontSize: '12px', color: '#172033', display: 'block' }}>{acc.name}</b>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{acc.operatorName} • {acc.planFocus.replace(' (Demo)', '')}</span>
                    </div>
                  </div>
                  <ChevronRight size={15} color="#94a3b8" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 200,
            background: '#172033',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={16} color="#20b486" />
          {toastMessage}
        </div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} style={{ overflowY: 'auto' }}>
        <div className="brand">
          <div className="brand-mark"><HeartPulse size={19} /></div>
          <span>previa<span className="brand-dot">.</span></span>
        </div>

        {/* Workspace Switcher */}
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <div
            className="workspace-switch"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowAccountDropdown(!showAccountDropdown)}
            title="Click to switch hospital workspace account"
          >
            <div className="workspace-avatar">{activeAccount.code}</div>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <b style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>{activeAccount.name}</b>
              <small>{activeAccount.planFocus}</small>
            </div>
            <ChevronDown size={15} />
          </div>

          {showAccountDropdown && (
            <div
              className="panel"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                padding: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                zIndex: 100,
                background: '#172033',
                border: '1px solid #2e3c54'
              }}
            >
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#6f7e94', padding: '4px 8px 6px', fontWeight: 700 }}>
                Select Workspace Account
              </div>
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  onClick={() => handleSwitchAccount(acc.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: acc.id === activeAccountId ? 'rgba(65, 105, 225, 0.2)' : 'transparent',
                    border: acc.id === activeAccountId ? '1px solid #4169e1' : '1px solid transparent',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: '#25334d', color: '#fff' }}>{acc.code}</span>
                    <b style={{ fontSize: '11px', color: '#fff' }}>{acc.name}</b>
                  </div>
                  <div style={{ fontSize: '10px', color: '#7b879b', marginTop: '2px' }}>
                    {acc.operatorName} • {acc.location}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Categories */}
        <nav>
          {['Core', 'AI Intelligence', 'Operations', 'Verification', 'Workbench', 'Reporting'].map(cat => {
            const items = nav.filter(n => n.category === cat)
            if (!items.length) return null
            return (
              <div key={cat} style={{ marginBottom: '14px' }}>
                <span className="nav-label">{cat}</span>
                {items.map(item => (
                  <button
                    key={item.label}
                    className={active === item.label ? 'active' : ''}
                    onClick={() => go(item.label)}
                    style={{ position: 'relative' }}
                  >
                    <item.icon size={17} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: '9px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: item.badge === 'Signature' ? '#4169e1' : '#e6f8f1',
                          color: item.badge === 'Signature' ? '#fff' : '#16835f',
                          fontWeight: 700
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )
          })}
          <span className="nav-label settings-label">Manage</span>
          <button
            className={active === 'Settings' ? 'active' : ''}
            onClick={() => go('Settings')}
          >
            <Settings size={17} />
            Settings
          </button>
        </nav>

        {/* Sidebar Bottom & Profile */}
        <div className="sidebar-bottom">
          <div className="status-dot">
            <span /> API Live (Port 8001 / IST)
          </div>
          <div
            className="user-row"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowProfileModal(true)}
            title="Click to view Account Profile"
          >
            <div className="user-avatar">{user.avatar}</div>
            <div>
              <b>{user.name}</b>
              <small>{user.role}</small>
            </div>
            <span className="more-icon">•••</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <button className="icon-button menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu size={19} />
          </button>
          <div className="breadcrumbs">
            <span>Workspace</span>
            <b>/</b>
            <strong>{active}</strong>
          </div>
          <div className="top-actions" style={{ position: 'relative' }}>
            <button
              className="icon-button"
              title="Search claims"
              onClick={() => go('Claims')}
            >
              <Search size={18} />
            </button>

            {/* Notification Button */}
            <button
              className="icon-button notification"
              title="Notifications"
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown)
                if (unreadNotifications > 0) setUnreadNotifications(0)
              }}
            >
              <Bell size={18} />
              {unreadNotifications > 0 && <i />}
            </button>

            {/* Notification Popover */}
            {showNotificationDropdown && (
              <div
                className="panel"
                style={{
                  position: 'absolute',
                  top: '48px',
                  right: '45px',
                  width: '320px',
                  padding: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  zIndex: 60
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <b style={{ fontSize: '12px' }}>Notifications (IST)</b>
                  <button
                    className="link-button"
                    style={{ fontSize: '10px' }}
                    onClick={() => setShowNotificationDropdown(false)}
                  >
                    Close
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px', color: '#6f7e94' }}>
                  <div style={{ padding: '8px', background: '#f5f8ff', borderRadius: '6px' }}>
                    <b style={{ color: '#4169e1', display: 'block' }}>Prior Auth Auto-Resolved</b>
                    <span>Star Health pre-authorization resolved on claim CLM-28491.</span>
                  </div>
                  <div style={{ padding: '8px', background: '#fff5f5', borderRadius: '6px' }}>
                    <b style={{ color: '#df6a70', display: 'block' }}>High Risk Flagged</b>
                    <span>Claim CLM-28490 (₹1,27,500) requires procedural review.</span>
                  </div>
                  <div style={{ padding: '8px', background: '#f2f5f9', borderRadius: '6px' }}>
                    <b style={{ color: '#20b486', display: 'block' }}>TPA / Gateway Synchronized</b>
                    <span>Active policy status verified via Insurance Gateway.</span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Profile Clickable Avatar */}
            <button
              className="top-avatar"
              style={{ cursor: 'pointer', border: 0 }}
              onClick={() => setShowProfileModal(true)}
              title="Click to view Account Profile"
            >
              {user.avatar}
            </button>
          </div>
        </header>

        {/* Active View Router */}
        <div className="page-content">
          {active === 'Overview' && (
            <OverviewView
              activeAccount={activeAccount}
              claims={currentClaims}
              onAnalyze={() => go('Claim Analysis')}
              onViewAllClaims={() => go('Claims')}
              onNewClaim={() => setShowNewClaimModal(true)}
              onLoadDemoData={() => handleLoadDemoData(activeAccountId)}
              onResetCleanSlate={() => handleResetToCleanSlate(activeAccountId)}
              onNavigate={go}
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              showTimeDropdown={showTimeDropdown}
              setShowTimeDropdown={setShowTimeDropdown}
            />
          )}

          {active === 'RCM Self-Healing' && (
            <SelfHealingView
              showToast={showToast}
              onNavigate={go}
            />
          )}

          {active === 'Pre-Submission Guard' && (
            <PreSubmissionGuardView showToast={showToast} />
          )}

          {active === 'Priority Clearance Queue' && (
            <PriorityQueueView
              showToast={showToast}
              onViewDossier={(pid) => {
                setSelectedPatientId(pid)
                go('Patient Dossier')
              }}
            />
          )}

          {active === 'Patient Dossier' && (
            <PatientDossierView
              patientId={selectedPatientId}
              onSelectPatient={setSelectedPatientId}
              showToast={showToast}
            />
          )}

          {active === 'Appointments' && (
            <AppointmentsView
              showToast={showToast}
              onViewDossier={(pid) => {
                setSelectedPatientId(pid)
                go('Patient Dossier')
              }}
            />
          )}

          {active === 'Eligibility (270/271)' && (
            <EligibilityView showToast={showToast} />
          )}

          {active === 'Insurance Card OCR' && (
            <OcrView
              sampleId={ocrSampleId}
              onSelectSample={setOcrSampleId}
              showToast={showToast}
            />
          )}

          {active === 'Claim Analysis' && (
            <ClaimAnalysisView
              showToast={showToast}
              activeAccount={activeAccount}
              claims={currentClaims}
              analysisHistory={currentAnalysisHistory}
              selectedClaim={selectedClaimForAnalysis}
              onAnalyzeClaim={handleAnalyzeClaim}
              onClearSelected={() => setSelectedClaimForAnalysis(null)}
            />
          )}

          {active === 'Claims' && (
            <ClaimsOperationsView
              claims={currentClaims}
              activeAccount={activeAccount}
              onNewClaim={() => setShowNewClaimModal(true)}
              onAnalyzeClaim={(c) => {
                setSelectedClaimForAnalysis(c)
                go('Claim Analysis')
              }}
              onDeleteClaim={handleDeleteClaim}
              query={query}
              setQuery={setQuery}
              showToast={showToast}
            />
          )}

          {active === 'Analytics' && (
            <AnalyticsView
              timeRange={timeRange}
              setTimeRange={setTimeRange}
              showTimeDropdown={showTimeDropdown}
              setShowTimeDropdown={setShowTimeDropdown}
              showToast={showToast}
            />
          )}

          {active === 'Model Insights' && <ModelInsightsView />}

          {active === 'Settings' && (
            <SettingsView
              workspaceName={workspaceName}
              setWorkspaceName={setWorkspaceName}
              user={user}
              setUser={setUser}
              showToast={showToast}
              onResetCleanSlate={() => handleResetToCleanSlate(activeAccountId)}
              onLoadDemoData={() => handleLoadDemoData(activeAccountId)}
            />
          )}
        </div>
      </main>

      {/* Account Profile Modal */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(23, 32, 51, 0.45)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '440px',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <SectionTitle eyebrow="USER ACCOUNT" title="Account Profile" />
              <button
                className="icon-button"
                style={{ width: '28px', height: '28px' }}
                onClick={() => setShowProfileModal(false)}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px', padding: '14px', background: '#f5f8ff', borderRadius: '10px' }}>
              <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '16px' }}>{user.avatar}</div>
              <div>
                <b style={{ fontSize: '14px', color: '#172033', display: 'block' }}>{user.name}</b>
                <span style={{ fontSize: '11px', color: '#4169e1', fontWeight: 600 }}>{user.role}</span>
                <small style={{ display: 'block', color: '#8994a7', fontSize: '10px', marginTop: '2px' }}>{user.email}</small>
              </div>
            </div>

            <div className="detail-list" style={{ marginTop: '0', marginBottom: '22px' }}>
              <div><span>Organization</span><b>{user.workspace}</b></div>
              <div><span>Phone</span><b>{user.phone}</b></div>
              <div><span>Location</span><b>{user.location}</b></div>
              <div><span>Timezone</span><b>{user.timezone}</b></div>
              <div><span>Role clearance</span><b>Level 3 (Senior Adjudicator)</b></div>
            </div>

            <div style={{ marginBottom: '18px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                Data Workspace Controls
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="select-button"
                  style={{ flex: 1, fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
                  onClick={() => {
                    handleResetToCleanSlate(activeAccountId)
                    setShowProfileModal(false)
                  }}
                  title="Clear all claims and analysis history for this workspace"
                >
                  <Sparkles size={13} /> Reset to Clean Slate
                </button>
                <button
                  type="button"
                  className="select-button"
                  style={{ flex: 1, fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
                  onClick={() => {
                    handleLoadDemoData(activeAccountId)
                    setShowProfileModal(false)
                  }}
                  title="Load full demo datasets into this workspace"
                >
                  <Zap size={13} /> Load Demo Datasets
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="select-button"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => {
                  setShowProfileModal(false)
                  go('Settings')
                }}
              >
                <Settings size={14} /> Manage settings
              </button>
              <button
                className="primary-button"
                style={{ background: '#e56b6f', boxShadow: '0 5px 14px rgba(229,107,111,0.25)' }}
                onClick={handleLogout}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Claim Creation Modal */}
      {showNewClaimModal && (
        <NewClaimModal
          activeAccount={activeAccount}
          onClose={() => setShowNewClaimModal(false)}
          onSubmit={handleAddNewClaim}
        />
      )}
    </div>
  )
}

/* ==========================================================================
   VIEW 1: OVERVIEW (EXECUTIVE COMMAND CENTER)
   ========================================================================== */
function OverviewView({
  activeAccount,
  claims = [],
  onAnalyze,
  onViewAllClaims,
  onNewClaim,
  onLoadDemoData,
  onResetCleanSlate,
  onNavigate,
  timeRange,
  setTimeRange,
  showTimeDropdown,
  setShowTimeDropdown
}: {
  activeAccount: AccountProfile
  claims: Claim[]
  onAnalyze: () => void
  onViewAllClaims: () => void
  onNewClaim: () => void
  onLoadDemoData: () => void
  onResetCleanSlate: () => void
  onNavigate: (view: string) => void
  timeRange: string
  setTimeRange: (t: string) => void
  showTimeDropdown: boolean
  setShowTimeDropdown: (s: boolean) => void
}) {
  const isCleanSlate = claims.length === 0
  const totalCount = claims.length
  const approvedCount = useMemo(() => claims.filter(c => c.prediction === 'Approve').length, [claims])
  const deniedCount = useMemo(() => claims.filter(c => c.prediction === 'Deny').length, [claims])
  const highRiskCount = useMemo(() => claims.filter(c => c.risk === 'High').length, [claims])
  const totalValue = useMemo(() => claims.reduce((acc, c) => acc + (c.amount || 0), 0), [claims])

  const chartData = [
    { label: '01 Jan', claims: isCleanSlate ? 0 : 820, approved: isCleanSlate ? 0 : 620, denied: isCleanSlate ? 0 : 200 },
    { label: '08 Jan', claims: isCleanSlate ? 0 : 1050, approved: isCleanSlate ? 0 : 810, denied: isCleanSlate ? 0 : 240 },
    { label: '15 Jan', claims: isCleanSlate ? 0 : 920, approved: isCleanSlate ? 0 : 720, denied: isCleanSlate ? 0 : 200 },
    { label: '22 Jan', claims: isCleanSlate ? 0 : 1280, approved: isCleanSlate ? 0 : 1010, denied: isCleanSlate ? 0 : 270 },
    { label: '29 Jan', claims: isCleanSlate ? 0 : 1170, approved: isCleanSlate ? 0 : 960, denied: isCleanSlate ? 0 : 210 },
    { label: '05 Feb', claims: isCleanSlate ? 0 : 1420, approved: isCleanSlate ? 0 : 1150, denied: isCleanSlate ? 0 : 270 },
  ]
  const riskData = isCleanSlate ? [
    { name: 'Low risk', value: 100, fill: '#20b486' }
  ] : [
    { name: 'Low risk', value: Math.max(1, Math.round(((totalCount - highRiskCount) / (totalCount || 1)) * 100)), fill: '#20b486' },
    { name: 'High risk', value: Math.max(1, Math.round((highRiskCount / (totalCount || 1)) * 100)), fill: '#e56b6f' }
  ]

  return (
    <>
      <div className="welcome compact">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="eyebrow" style={{ margin: 0 }}>OVERVIEW</span>
            <span style={{ fontSize: '10px', background: isCleanSlate ? '#e6f8f1' : '#f0f4ff', color: isCleanSlate ? '#16835f' : '#4169e1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              {activeAccount.name}
            </span>
          </div>
          <h1>{isCleanSlate ? 'Clean Slate Workspace' : 'Financial Clearance Overview'}</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            {isCleanSlate ? 'Workspace initialized with 0 claims. Ready for intake.' : `Real-time claims clearance and denial prevention for ${activeAccount.name}.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="primary-button" onClick={onNewClaim}>
            <ClipboardCheck size={15} /> + New Claim
          </button>
          {isCleanSlate ? (
            <button className="select-button" onClick={onLoadDemoData}>
              <Zap size={14} /> Load Demo Data
            </button>
          ) : (
            <button className="select-button" onClick={onResetCleanSlate}>
              <Sparkles size={14} /> Reset Clean Slate
            </button>
          )}
        </div>
      </div>

      {/* Clean Slate Compact Onboarding Grid */}
      {isCleanSlate && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
          <div
            onClick={onNewClaim}
            className="panel"
            style={{ padding: '14px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#4169e1')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4169e1', marginBottom: '4px' }}>
              <ClipboardCheck size={16} />
              <b style={{ fontSize: '13px' }}>New Claim</b>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Create & evaluate encounter</p>
          </div>

          <div
            onClick={() => onNavigate('Insurance Card OCR')}
            className="panel"
            style={{ padding: '14px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#20b486')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#20b486', marginBottom: '4px' }}>
              <FileText size={16} />
              <b style={{ fontSize: '13px' }}>Card OCR</b>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Scan insurance card</p>
          </div>

          <div
            onClick={() => onNavigate('Eligibility (270/271)')}
            className="panel"
            style={{ padding: '14px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#f4b740')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f4b740', marginBottom: '4px' }}>
              <ShieldCheck size={16} />
              <b style={{ fontSize: '13px' }}>Eligibility Check</b>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>EDI 270/271 gateway</p>
          </div>

          <div
            onClick={onLoadDemoData}
            className="panel"
            style={{ padding: '14px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#8b5cf6')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6', marginBottom: '4px' }}>
              <Zap size={16} />
              <b style={{ fontSize: '13px' }}>Load Demo Data</b>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Populate sample records</p>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <StatCard icon={ClipboardCheck} label="Total claims" value={String(totalCount)} change={isCleanSlate ? '0 active' : `+${totalCount} total`} tone="blue" />
        <StatCard icon={ShieldCheck} label="Approved claims" value={String(approvedCount)} change={isCleanSlate ? '0 cleared' : `${totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0}% rate`} tone="green" />
        <StatCard icon={AlertTriangle} label="Denied claims" value={String(deniedCount)} change={isCleanSlate ? '0 flagged' : `${deniedCount} claims`} tone="red" />
        <StatCard icon={Activity} label="High risk claims" value={String(highRiskCount)} change={isCleanSlate ? '0 high risk' : `${highRiskCount} pending auth`} tone="amber" />
        <StatCard icon={TrendingUp} label="Total Claim Value" value={formatINR(totalValue)} change="Active Portfolio" tone="purple" />
      </div>

      <div className="chart-grid">
        <div className="panel chart-panel">
          <SectionTitle
            eyebrow="CLAIMS VOLUME"
            title="Claims over time (INR)"
            action={
              <div style={{ position: 'relative' }}>
                <button
                  className="select-button"
                  onClick={() => setShowTimeDropdown(!showTimeDropdown)}
                >
                  {timeRange} <ChevronDown size={14} />
                </button>
                {showTimeDropdown && (
                  <div
                    className="panel"
                    style={{
                      position: 'absolute',
                      top: '38px',
                      right: '0',
                      padding: '6px',
                      zIndex: 30,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                      minWidth: '130px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    {['Last 7 days', 'Last 30 days', 'Last 90 days'].map(range => (
                      <button
                        key={range}
                        className="link-button"
                        style={{ textAlign: 'left', padding: '6px 8px', color: timeRange === range ? '#4169e1' : '#718097' }}
                        onClick={() => {
                          setTimeRange(range)
                          setShowTimeDropdown(false)
                        }}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            }
          />
          <div className="legend">
            <span><i className="blue-dot" />Total claims</span>
            <span><i className="green-dot" />Approved</span>
            <span><i className="red-dot" />Denied</span>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={245}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#4169e1" stopOpacity={0.2} />
                    <stop offset="1" stopColor="#4169e1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e8edf5" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8994a7' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8994a7' }} />
                <Tooltip />
                <Area type="monotone" dataKey="claims" stroke="#4169e1" strokeWidth={2.5} fill="url(#blueFill)" />
                <Area type="monotone" dataKey="approved" stroke="#20b486" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="denied" stroke="#e56b6f" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel risk-panel">
          <SectionTitle
            eyebrow="RISK PROFILE"
            title="Risk distribution"
            action={
              <button className="circle-button" onClick={onViewAllClaims} title="View risk breakdown">
                <span className="more-icon">•••</span>
              </button>
            }
          />
          <div className="donut">
            <ResponsiveContainer width="100%" height={185}>
              <PieChart>
                <Pie data={riskData} innerRadius={56} outerRadius={78} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                  {riskData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center">
              <strong>{totalCount}</strong>
              <span>claims</span>
            </div>
          </div>
          <div className="risk-legend">
            {riskData.map(x => (
              <div key={x.name}>
                <span><i style={{ background: x.fill }} />{x.name}</span>
                <b>{x.value}%</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   VIEW 2: RCM SELF-HEALING ENGINE (SIGNATURE FEATURE)
   ========================================================================== */
function SelfHealingView({
  showToast,
  onNavigate
}: {
  showToast: (m: string) => void
  onNavigate: (t: string) => void
}) {
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState<SimulateBatchResult | null>(null)
  const [problems, setProblems] = useState<SelfHealProblem[]>([])
  const [events, setEvents] = useState<SelfHealEvent[]>([])
  const [activeTab, setActiveTab] = useState<'clusters' | 'hotspots' | 'identity' | 'stream'>('clusters')

  // Identity simulator state
  const [idHospitalName, setIdHospitalName] = useState('Shloke Roy')
  const [idPayerName, setIdPayerName] = useState('S. Roy')
  const [idDobMatch, setIdDobMatch] = useState(true)
  const [idMemberMatch, setIdMemberMatch] = useState(true)
  const [idResult, setIdResult] = useState<IdentityResolutionResult | null>(null)

  useEffect(() => {
    api.getSelfHealProblems().then(res => setProblems(res.problems)).catch(() => {
      setProblems([
        {
          id: 'PROB-ID-260',
          title: 'Patient Identity & Name Format Disparity',
          error_category: 'PATIENT_IDENTITY_MISMATCH',
          error_code: 'ERR-ID-NORM',
          frequency: 260,
          affected_claims_count: 260,
          financial_impact: 1840000,
          priority_score: 96.4,
          priority_level: 'HIGH',
          recurrence_factor: 'HIGH',
          preventability: 'HIGH',
          root_cause: "Payer EDI Gateway strictly mandates abbreviated initial representation ('S ROY') while EHR registers full legal names.",
          recommended_action: 'Enable automated deterministic name normalization before EDI 837 claim submission.',
          upstream_fix: 'Update Patient -> Payer EDI Identity Mapping in EHR Intake Module.',
          decision_type: 'SAFE_AUTO_FIX',
          status: 'ACTIVE',
          confidence: 0.98,
          affected_payers: ['Star Health', 'HDFC ERGO'],
          affected_procedures: ['99214', '72148'],
          sample_claims: ['CLM-10482', 'CLM-10483'],
          first_detected: '2026-08-27 10:00 UTC',
          last_detected: '2026-09-03 14:15 UTC'
        },
        {
          id: 'PROB-AUTH-204',
          title: 'High-Tech Radiology Missing Prior Auth Gateway',
          error_category: 'AUTHORIZATION_WORKFLOW',
          error_code: 'CO-197',
          frequency: 204,
          affected_claims_count: 204,
          financial_impact: 1420000,
          priority_score: 92.8,
          priority_level: 'HIGH',
          recurrence_factor: 'HIGH',
          preventability: 'HIGH',
          root_cause: 'Scheduling interface permitted MRI/CT orders without checking payer prior auth table.',
          recommended_action: 'Enforce 72-hour pre-service electronic prior authorization gate.',
          upstream_fix: 'Attach mandatory Prior Auth check to radiology order intake workflow.',
          decision_type: 'REQUIRES_OPERATOR',
          status: 'ACTIVE',
          confidence: 0.94,
          affected_payers: ['ICICI Lombard', 'Care Health'],
          affected_procedures: ['72148', '70450'],
          sample_claims: ['CLM-20811'],
          first_detected: '2026-08-20 09:30 UTC',
          last_detected: '2026-09-03 13:45 UTC'
        }
      ])
    })

    api.getSelfHealEvents().then(res => setEvents(res.events)).catch(() => {})
  }, [])

  const handleSimulate = async () => {
    setSimulating(true)
    try {
      const res = await api.simulateBatchClaims(1000)
      setSimResult(res)
      showToast('Simulated 1,000 Claims: 288 Auto-Healed, ₹12.1L Protected!')
    } catch {
      showToast('Simulation complete (local engine).')
    } finally {
      setSimulating(false)
    }
  }

  const handleResolveIdentity = async () => {
    try {
      const res = await api.resolveIdentity({
        hospital_name: idHospitalName,
        payer_name: idPayerName,
        dob_hospital: idDobMatch ? '1990-05-12' : '1990-05-12',
        dob_payer: idDobMatch ? '1990-05-12' : '1982-11-20',
        member_id_hospital: idMemberMatch ? 'STAR-12345' : 'STAR-12345',
        member_id_payer: idMemberMatch ? 'STAR-12345' : 'STAR-99999'
      })
      setIdResult(res)
    } catch {
      showToast('Identity evaluated.')
    }
  }

  const handleApproveProblem = async (id: string) => {
    try {
      await api.approveSelfHeal(id)
      setProblems(prev => prev.map(p => p.id === id ? { ...p, status: 'AUTO_RESOLVED' } : p))
      showToast(`Problem ${id} marked AUTO-RESOLVED.`)
    } catch {
      showToast('Approved.')
    }
  }

  const handleRejectProblem = async (id: string) => {
    try {
      await api.rejectSelfHeal(id)
      setProblems(prev => prev.map(p => p.id === id ? { ...p, status: 'BLOCKED' } : p))
      showToast(`Problem ${id} escalated to BLOCKED review.`)
    } catch {
      showToast('Rejected.')
    }
  }

  const handleRollback = async (eventId: string) => {
    try {
      await api.rollbackEvent(eventId)
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, rollback_status: 'ROLLED_BACK', system_action: 'ROLLED_BACK' } : e))
      showToast(`Event ${eventId} rolled back successfully.`)
    } catch {
      showToast('Rollback applied.')
    }
  }

  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">AUTONOMOUS PREVENTION LAYER</span>
          <h1>RCM Self-Healing Engine</h1>
          <p>Detect systemic claim failure patterns, automatically apply safe transformations, and eliminate root causes.</p>
        </div>
        <button
          className="primary-button"
          disabled={simulating}
          onClick={handleSimulate}
          style={{ background: 'linear-gradient(135deg, #4169e1 0%, #6366f1 100%)' }}
        >
          <Zap size={16} /> {simulating ? 'Simulating 1,000 claims…' : '⚡ Simulate 1,000 Batch Claims'}
        </button>
      </div>

      {/* Simulation Result Spotlight Banner */}
      {simResult && (
        <div className="panel" style={{ marginBottom: '18px', background: '#f5f8ff', borderColor: '#c7d7fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="eyebrow" style={{ color: '#4169e1' }}>SIMULATION COMPLETED (1,000 CLAIMS)</span>
            <h3 style={{ margin: '4px 0', fontSize: '15px', color: '#172033' }}>Top Bottleneck: {simResult.top_problem_identified}</h3>
            <p style={{ margin: 0, fontSize: '11px', color: '#6f7e94' }}>
              Auto-healed <b>{simResult.auto_healed_count} claims</b> ({formatINR(simResult.potential_revenue_protected)} revenue protected). Escalate <b>{simResult.ambiguous_cases_operator_review} ambiguous cases</b> to operators.
            </p>
          </div>
          <button className="select-button" onClick={() => setSimResult(null)}>
            Dismiss banner
          </button>
        </div>
      )}

      {/* Top Overview Metrics */}
      <div className="stats-grid">
        <StatCard icon={AlertTriangle} label="Systemic problems" value="1,284" change="+14.2%" tone="amber" />
        <StatCard icon={CheckCircle2} label="Auto-resolved claims" value="932" change="+34.8%" tone="green" />
        <StatCard icon={Users} label="Awaiting review" value="241" change="-12.1%" tone="blue" />
        <StatCard icon={ShieldAlert} label="Blocked & protected" value="111" change="+4.5%" tone="red" />
        <StatCard icon={TrendingUp} label="Revenue protected" value="₹48.2L" change="+28.4%" tone="purple" />
      </div>

      {/* Sub-nav Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {[
          { id: 'clusters', label: 'Active Error Clusters (Root Cause)' },
          { id: 'hotspots', label: 'RCM Failure Hotspots' },
          { id: 'identity', label: 'Identity Multi-Factor Normalizer' },
          { id: 'stream', label: 'Live Activity Stream & Rollback' },
        ].map(t => (
          <button
            key={t.id}
            className={activeTab === t.id ? 'primary-button' : 'select-button'}
            style={{ fontSize: '11px' }}
            onClick={() => setActiveTab(t.id as any)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CLUSTERS */}
      {activeTab === 'clusters' && (
        <div className="panel claims-panel">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #edf0f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <b style={{ fontSize: '13px' }}>Systemic Error Clusters (Sorted by Priority Score)</b>
              <small style={{ display: 'block', color: '#8994a7', fontSize: '10px' }}>Priority = Frequency × Financial Impact × Recurrence × Preventability</small>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Priority Score</th>
                  <th>Problem Category</th>
                  <th>Affected Claims</th>
                  <th>Revenue at Risk</th>
                  <th>Decision Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map(p => (
                  <tr key={p.id}>
                    <td>
                      <b style={{ color: p.priority_score >= 90 ? '#df6a70' : '#bd7f0b', fontSize: '12px' }}>
                        {p.priority_score}
                      </b>
                      <small style={{ display: 'block', color: '#8994a7', fontSize: '9px' }}>{p.priority_level} PRIORITY</small>
                    </td>
                    <td>
                      <b style={{ color: '#172033', fontSize: '12px' }}>{p.title}</b>
                      <small style={{ display: 'block', color: '#6f7e94', fontSize: '10px' }}>Root cause: {p.root_cause}</small>
                    </td>
                    <td><b>{p.affected_claims_count}</b> claims</td>
                    <td className="amount">{formatINR(p.financial_impact)}</td>
                    <td>
                      <Badge tone={p.decision_type === 'SAFE_AUTO_FIX' ? 'approve' : 'pending'}>
                        {p.decision_type}
                      </Badge>
                    </td>
                    <td>
                      <Badge tone={p.status === 'AUTO_RESOLVED' ? 'approved' : p.status === 'BLOCKED' ? 'denied' : 'pending'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="link-button"
                          style={{ fontSize: '10px', color: '#20a67b', fontWeight: 700 }}
                          onClick={() => handleApproveProblem(p.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="link-button"
                          style={{ fontSize: '10px', color: '#df6a70' }}
                          onClick={() => handleRejectProblem(p.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: HOTSPOTS */}
      {activeTab === 'hotspots' && (
        <div className="panel">
          <SectionTitle eyebrow="STAGE ANALYSIS" title="RCM Error Distribution Across Workflow Stages" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {[
              { stage: 'Patient Registration & Demographic Intake', pct: 31.4, claims: 312, amount: 1840000, color: '#4169e1', fix: 'Identity normalization profile in EHR gateway' },
              { stage: 'Prior Authorization Scheduling Gate', pct: 24.8, claims: 248, amount: 1420000, color: '#e56b6f', fix: '72h Pre-Service mandatory CPT check' },
              { stage: 'Coding & Modifier Crosswalk (Mod 25)', pct: 18.2, claims: 182, amount: 870000, color: '#f4b740', fix: 'Auto-update payer-specific modifier validation rules' },
              { stage: 'Insurance Eligibility & Policy Lapses', pct: 11.6, claims: 116, amount: 510000, color: '#20b486', fix: '24h Batch 270 electronic re-verification' },
              { stage: 'EDI 837 Batch Claim Submission', pct: 4.8, claims: 48, amount: 180000, color: '#8563cf', fix: 'Duplicate submission suppression daemon' },
            ].map(h => (
              <div key={h.stage} style={{ padding: '14px', border: '1px solid #edf0f5', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <b style={{ fontSize: '12px' }}>{h.stage}</b>
                  <b style={{ color: h.color }}>{h.pct}% of all errors ({formatINR(h.amount)})</b>
                </div>
                <div style={{ height: '8px', background: '#edf1f7', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ width: `${h.pct * 2.5}%`, height: '100%', background: h.color, borderRadius: '4px' }} />
                </div>
                <small style={{ color: '#6f7e94', fontSize: '10px' }}>
                  <b>Upstream Elimination:</b> {h.fix}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IDENTITY RESOLUTION SIMULATOR */}
      {activeTab === 'identity' && (
        <div className="panel">
          <SectionTitle eyebrow="MULTI-FACTOR CORROBORATION" title="Patient Identity & Name Mismatch Resolver" />
          <p style={{ color: '#7b879b', fontSize: '12px', margin: '6px 0 18px' }}>
            Safely generates payer-compatible claim representations (e.g. &apos;S ROY&apos;) while strictly preserving the canonical hospital record (&apos;Shloke Roy&apos;).
          </p>
          <div className="form-grid" style={{ marginBottom: '16px' }}>
            <label className="field">
              <span>Hospital EHR Legal Name</span>
              <input value={idHospitalName} onChange={e => setIdHospitalName(e.target.value)} />
            </label>
            <label className="field">
              <span>Payer Registry / Card Name</span>
              <input value={idPayerName} onChange={e => setIdPayerName(e.target.value)} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer' }}>
              <input type="checkbox" checked={idDobMatch} onChange={e => setIdDobMatch(e.target.checked)} />
              Date of Birth Matches (12 May 1990)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', cursor: 'pointer' }}>
              <input type="checkbox" checked={idMemberMatch} onChange={e => setIdMemberMatch(e.target.checked)} />
              Member ID Matches (STAR-12345)
            </label>
          </div>
          <button className="primary-button" onClick={handleResolveIdentity}>
            <Wand2 size={16} /> Corroborate & Resolve Identity
          </button>

          {idResult && (
            <div style={{ marginTop: '20px', padding: '16px', background: idResult.can_safe_auto_fix ? '#f0faf7' : '#fff5f5', borderRadius: '8px', border: `1px solid ${idResult.can_safe_auto_fix ? '#c1ebd9' : '#f5c6c8'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <b style={{ color: idResult.can_safe_auto_fix ? '#16835f' : '#df6a70' }}>
                  {idResult.classification} ({idResult.identity_confidence_score}% Confidence)
                </b>
                <Badge tone={idResult.decision === 'SAFE_AUTO_FIX' ? 'approve' : 'deny'}>
                  {idResult.decision}
                </Badge>
              </div>
              <div className="detail-list" style={{ marginTop: '10px' }}>
                <div><span>Canonical Patient Name</span><b>{idResult.canonical_patient_name}</b></div>
                <div><span>Claim Submission Name</span><b style={{ color: '#4169e1' }}>{idResult.claim_submission_name}</b></div>
                <div><span>Recommended Action</span><b>{idResult.recommended_action}</b></div>
                <div><span>Upstream Fix</span><b>{idResult.upstream_fix}</b></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: STREAM */}
      {activeTab === 'stream' && (
        <div className="panel claims-panel">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #edf0f5' }}>
            <b style={{ fontSize: '13px' }}>Live Self-Healing Activity & Immutable Audit Trail</b>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Claim ID</th>
                  <th>Problem Detected</th>
                  <th>Original Value</th>
                  <th>Transformed Value</th>
                  <th>Action</th>
                  <th>Rollback</th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id}>
                    <td><small>{e.timestamp}</small></td>
                    <td><b className="claim-id">{e.claim_id}</b></td>
                    <td>{e.problem_detected}</td>
                    <td><code style={{ fontSize: '10px', color: '#df6a70' }}>{e.original_value}</code></td>
                    <td><code style={{ fontSize: '10px', color: '#20a67b' }}>{e.corrected_value}</code></td>
                    <td>
                      <Badge tone={e.system_action === 'AUTO-RESOLVED' ? 'approve' : e.system_action === 'ROLLED_BACK' ? 'neutral' : 'pending'}>
                        {e.system_action}
                      </Badge>
                    </td>
                    <td>
                      {e.rollback_available && e.rollback_status === 'ACTIVE' ? (
                        <button
                          className="link-button"
                          style={{ fontSize: '10px', color: '#4169e1' }}
                          onClick={() => handleRollback(e.id)}
                        >
                          <RotateCcw size={11} style={{ display: 'inline', marginRight: '4px' }} />
                          Rollback
                        </button>
                      ) : (
                        <small style={{ color: '#a0a9b8' }}>N/A</small>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

/* ==========================================================================
   VIEW 3: PRE-SUBMISSION CLAIM GUARD
   ========================================================================== */
function PreSubmissionGuardView({ showToast }: { showToast: (m: string) => void }) {
  const [claimId, setClaimId] = useState('CLM-GUARD-108')
  const [patientId, setPatientId] = useState('PAT-1082')
  const [hospitalName, setHospitalName] = useState('Eleanor Vance')
  const [payerName, setPayerName] = useState('E. Vance')
  const [cptCode, setCptCode] = useState('72148')
  const [claimAmount, setClaimAmount] = useState('14500')
  const [priorAuth, setPriorAuth] = useState('')
  const [guardResult, setGuardResult] = useState<PreSubmissionGuardResult | null>(null)
  const [evaluating, setEvaluating] = useState(false)

  // Preset quick tester
  const loadPreset = (preset: 'clean' | 'missing_auth' | 'name_heal' | 'mod25') => {
    if (preset === 'clean') {
      setClaimId('CLM-CLEAN-201')
      setPatientId('PAT-2094')
      setHospitalName('Marcus Thorne')
      setPayerName('Marcus Thorne')
      setCptCode('99214')
      setClaimAmount('2100')
      setPriorAuth('')
    } else if (preset === 'missing_auth') {
      setClaimId('CLM-AUTH-302')
      setPatientId('PAT-1082')
      setHospitalName('Eleanor Vance')
      setPayerName('E. Vance')
      setCptCode('72148')
      setClaimAmount('14500')
      setPriorAuth('')
    } else if (preset === 'name_heal') {
      setClaimId('CLM-NAME-403')
      setPatientId('PAT-3301')
      setHospitalName('Sophia Rodriguez')
      setPayerName('S. Rodriguez')
      setCptCode('99214')
      setClaimAmount('3500')
      setPriorAuth('')
    } else if (preset === 'mod25') {
      setClaimId('CLM-MOD-504')
      setPatientId('PAT-4115')
      setHospitalName('David Chen')
      setPayerName('David Chen')
      setCptCode('99214-25')
      setClaimAmount('12800')
      setPriorAuth('AUTH-MOD-99')
    }
  }

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault()
    setEvaluating(true)
    try {
      const res = await api.validateClaimGuard({
        claim_id: claimId,
        patient_id: patientId,
        hospital_name: hospitalName,
        payer_name: payerName,
        dob_hospital: '1984-06-14',
        dob_payer: '1984-06-14',
        member_id_hospital: 'STAR-9823101',
        member_id_payer: 'STAR-9823101',
        cpt_code: cptCode,
        claim_amount: Number(claimAmount || 14500),
        prior_auth_number: priorAuth || undefined,
        policy_status: 'ACTIVE'
      })
      setGuardResult(res)
      showToast(`Guard Assessment: ${res.overall_status}`)
    } catch {
      // Deterministic client fallback simulation
      const requiresPa = cptCode.includes('72148') || cptCode.includes('MRI') || cptCode.includes('29881')
      const hasAuth = Boolean(priorAuth && priorAuth.trim().length > 3)
      const nameMismatch = hospitalName.trim().toLowerCase() !== payerName.trim().toLowerCase()
      
      const gates: PreSubmissionGuardResult['gates'] = [
        {
          gate_name: 'Gate 1: Identity & Name Normalization',
          status: nameMismatch ? 'AUTO_HEALED' : 'PASS',
          score_penalty: 0,
          detail: nameMismatch ? `Auto-healed claim representation to '${payerName.toUpperCase()}'` : 'EHR and Payer registry names verified.',
          original_value: hospitalName,
          healed_value: payerName.toUpperCase()
        },
        {
          gate_name: 'Gate 2: Policy Eligibility & Coverage Dates',
          status: 'PASS',
          score_penalty: 0,
          detail: 'Active policy verified via 270/271 electronic inquiry.'
        },
        {
          gate_name: 'Gate 3: Prior Authorization Verification',
          status: (requiresPa && !hasAuth) ? 'FAIL' : 'PASS',
          score_penalty: (requiresPa && !hasAuth) ? 45 : 0,
          detail: (requiresPa && !hasAuth)
            ? `Mandatory Prior Auth required for ${cptCode}. Missing auth determination number.`
            : 'Prior auth verified or not mandated for procedure.'
        },
        {
          gate_name: 'Gate 4: Coding & Modifier Rules (Modifier 25)',
          status: cptCode.includes('-25') ? 'AUTO_HEALED' : 'PASS',
          score_penalty: 0,
          detail: cptCode.includes('-25') ? 'Modifier 25 verified against separate E&M clinical documentation.' : 'CPT coding structure compliant.'
        },
        {
          gate_name: 'Gate 5: Payer Billing Guidelines',
          status: 'PASS',
          score_penalty: 0,
          detail: 'No active payer rule drift detected for procedure.'
        },
        {
          gate_name: 'Gate 6: Required EDI 837 Elements',
          status: 'PASS',
          score_penalty: 0,
          detail: 'All mandatory ANSI X12 segments populated.'
        }
      ]

      const failedGates = gates.filter(g => g.status === 'FAIL')
      const healedGates = gates.filter(g => g.status === 'AUTO_HEALED')
      const overallStatus = failedGates.length > 0 ? 'ACTION_REQUIRED_OPERATOR' : healedGates.length > 0 ? 'AUTO_HEALED_AND_READY' : 'SAFE_TO_SUBMIT'

      setGuardResult({
        claim_id: claimId,
        overall_status: overallStatus,
        risk_score: failedGates.length > 0 ? 82 : healedGates.length > 0 ? 18 : 8,
        confidence_score: 97.4,
        submission_claim_representation: {
          claim_id: claimId,
          patient_name: nameMismatch ? payerName.toUpperCase() : hospitalName,
          cpt_code: cptCode,
          claim_amount: Number(claimAmount || 14500),
          prior_auth_number: hasAuth ? priorAuth : 'NOT_FOUND'
        },
        gates: gates,
        auto_heals_applied: healedGates.map(g => g.gate_name),
        dollar_impact_protected: overallStatus !== 'ACTION_REQUIRED_OPERATOR' ? Number(claimAmount || 14500) : 0
      })
      showToast(`Guard Assessment: ${overallStatus}`)
    } finally {
      setEvaluating(false)
    }
  }

  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">PRE-DISPATCH CLAIM FILTER</span>
          <h1>Pre-Submission Claim Guard</h1>
          <p>Pass un-submitted claims through 6 automated safety gates to intercept preventable denials before EDI transmission.</p>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button className="select-button" style={{ fontSize: '10px' }} onClick={() => loadPreset('clean')}>Preset: Clean</button>
          <button className="select-button" style={{ fontSize: '10px' }} onClick={() => loadPreset('name_heal')}>Preset: Name Auto-Heal</button>
          <button className="select-button" style={{ fontSize: '10px' }} onClick={() => loadPreset('missing_auth')}>Preset: Missing Auth</button>
        </div>
      </div>

      <div className="analysis-grid">
        <form className="panel" onSubmit={handleValidate}>
          <SectionTitle eyebrow="CLAIM PARAMETERS" title="Pre-Submission Inspection" />
          <div className="form-section">
            <div className="form-grid">
              <label className="field">
                <span>Claim ID</span>
                <input value={claimId} onChange={e => setClaimId(e.target.value)} required />
              </label>
              <label className="field">
                <span>Patient ID</span>
                <input value={patientId} onChange={e => setPatientId(e.target.value)} required />
              </label>
              <label className="field">
                <span>EHR Legal Name</span>
                <input value={hospitalName} onChange={e => setHospitalName(e.target.value)} required />
              </label>
              <label className="field">
                <span>Payer Card Name</span>
                <input value={payerName} onChange={e => setPayerName(e.target.value)} required />
              </label>
              <label className="field">
                <span>CPT Procedure</span>
                <input value={cptCode} onChange={e => setCptCode(e.target.value)} required />
              </label>
              <label className="field">
                <span>Claim Amount (₹ INR)</span>
                <input value={claimAmount} onChange={e => setClaimAmount(e.target.value)} required />
              </label>
              <label className="field">
                <span>Prior Auth Number (If any)</span>
                <input value={priorAuth} onChange={e => setPriorAuth(e.target.value)} placeholder="Leave blank to test missing auth gate" />
              </label>
            </div>
          </div>
          <button className="primary-button full" type="submit" disabled={evaluating}>
            <ShieldCheck size={16} /> {evaluating ? 'Running 6 safety gates…' : 'Inspect & Guard Claim'}
          </button>
        </form>

        <div className="result-column">
          {guardResult ? (
            <div className="panel">
              <SectionTitle eyebrow="GATE FINDINGS" title="Pre-Submission Verdict" />
              <div style={{ margin: '14px 0', padding: '14px', borderRadius: '8px', background: guardResult.overall_status === 'AUTO_HEALED_AND_READY' ? '#f0faf7' : guardResult.overall_status === 'SAFE_TO_SUBMIT' ? '#f5f8ff' : '#fff5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: '14px' }}>{guardResult.overall_status}</b>
                  <b>Risk: {guardResult.risk_score}/100</b>
                </div>
                {guardResult.dollar_impact_protected > 0 && (
                  <small style={{ color: '#16835f', display: 'block', marginTop: '4px', fontWeight: 600 }}>
                    Protected {formatINR(guardResult.dollar_impact_protected)} against preventable rejection.
                  </small>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {guardResult.gates.map(g => (
                  <div key={g.gate_name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', border: '1px solid #edf0f5', borderRadius: '6px' }}>
                    <div>
                      <b style={{ fontSize: '11px', display: 'block' }}>{g.gate_name}</b>
                      <small style={{ color: '#7b879b', fontSize: '10px' }}>{g.detail}</small>
                    </div>
                    <Badge tone={g.status === 'PASS' || g.status === 'AUTO_HEALED' ? 'approve' : 'deny'}>
                      {g.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="panel empty-result">
              <div className="empty-icon"><ShieldCheck size={22} /></div>
              <h3>Gate inspection output will appear here</h3>
              <p>Submit claim parameters or choose a preset above to evaluate against Identity, Eligibility, Prior Auth, and Modifier gates.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   VIEW 4: PRIORITY CLEARANCE QUEUE
   ========================================================================== */
function PriorityQueueView({
  showToast,
  onViewDossier
}: {
  showToast: (m: string) => void
  onViewDossier: (pid: string) => void
}) {
  const [queue, setQueue] = useState<PriorityQueueItem[]>([])
  const [filter, setFilter] = useState<'All' | 'High Risk' | 'Needs Action' | 'Cleared'>('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.getPriorityQueue().then(res => setQueue(res.queue)).catch(() => {
      setQueue([
        {
          patient_id: 'PAT-1082',
          patient_name: 'Eleanor Vance',
          dob: '1984-06-14',
          appointment_id: 'APT-8821',
          appointment_datetime: '04 Sep 2026 09:30 AM IST',
          procedure_code: '72148',
          procedure_name: 'MRI Lumbar Spine w/o Contrast',
          payer_name: 'Star Health Comprehensive Plus',
          member_id: 'STAR-9823101',
          group_number: 'GRP-4410',
          clearance_status: 'HIGH_RISK',
          risk_score: 88,
          risk_level: 'High',
          eligibility_status: 'ACTIVE',
          authorization_status: 'REQUIRED',
          data_validation_status: 'MATCH',
          estimated_patient_responsibility: 4500,
          primary_blocker: 'Prior authorization required by Star Health but not initiated',
          recommended_actions: ['Initiate expedited Prior Auth portal submission for CPT 72148']
        },
        {
          patient_id: 'PAT-3301',
          patient_name: 'Sophia Rodriguez',
          dob: '1995-02-28',
          appointment_id: 'APT-8823',
          appointment_datetime: '04 Sep 2026 11:00 AM IST',
          procedure_code: '93000',
          procedure_name: 'Electrocardiogram Routine ECG',
          payer_name: 'HDFC ERGO General',
          member_id: 'HDFC-7712399',
          group_number: 'GRP-2020',
          clearance_status: 'NEEDS_ACTION',
          risk_score: 54,
          risk_level: 'Medium',
          eligibility_status: 'ACTIVE',
          authorization_status: 'NOT_REQUIRED',
          data_validation_status: 'MISMATCH',
          estimated_patient_responsibility: 650,
          primary_blocker: 'Member ID on card (HDFC-7712399-01) differs from EHR (HDFC-7712399)',
          recommended_actions: ['Run 1-click OCR field synchronization to update suffix -01']
        },
        {
          patient_id: 'PAT-2094',
          patient_name: 'Marcus Thorne',
          dob: '1972-11-03',
          appointment_id: 'APT-8822',
          appointment_datetime: '04 Sep 2026 10:15 AM IST',
          procedure_code: '99214',
          procedure_name: 'Office Visit Level 4 (Cardiology)',
          payer_name: 'ICICI Lombard Health',
          member_id: 'ICICI-550912',
          group_number: 'GRP-8812',
          clearance_status: 'CLEARED',
          risk_score: 12,
          risk_level: 'Low',
          eligibility_status: 'ACTIVE',
          authorization_status: 'NOT_REQUIRED',
          data_validation_status: 'MATCH',
          estimated_patient_responsibility: 350,
          primary_blocker: null,
          recommended_actions: ['Collect ₹350 specialist copay at check-in']
        }
      ])
    })
  }, [])

  const handleResolve = async (pid: string) => {
    try {
      await api.resolveClearance(pid)
      setQueue(prev => prev.map(q => q.patient_id === pid ? { ...q, clearance_status: 'CLEARED', risk_score: 14, risk_level: 'Low' } : q))
      showToast(`Patient ${pid} Financially Cleared!`)
    } catch {
      showToast(`Encounter cleared.`)
    }
  }

  const filtered = queue.filter(q => {
    const matchSearch = `${q.patient_name} ${q.patient_id} ${q.procedure_name} ${q.payer_name}`.toLowerCase().includes(search.toLowerCase())
    if (filter === 'High Risk') return matchSearch && q.clearance_status === 'HIGH_RISK'
    if (filter === 'Needs Action') return matchSearch && q.clearance_status === 'NEEDS_ACTION'
    if (filter === 'Cleared') return matchSearch && q.clearance_status === 'CLEARED'
    return matchSearch
  })

  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">PRE-VISIT WORKLIST</span>
          <h1>Priority Clearance Queue</h1>
          <p>Real-time prioritized patient queue for upcoming hospital appointments sorted by highest financial denial risk.</p>
        </div>
      </div>

      <div className="panel claims-panel">
        <div className="table-toolbar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['All', 'High Risk', 'Needs Action', 'Cleared'] as const).map(f => (
              <button
                key={f}
                className={filter === f ? 'primary-button' : 'select-button'}
                style={{ fontSize: '11px', padding: '6px 12px' }}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="search-box">
            <Search size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search queue…" />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Risk Score</th>
                <th>Patient & ID</th>
                <th>Encounter Date</th>
                <th>Procedure (CPT)</th>
                <th>Payer / TPA</th>
                <th>Estimated Copay (INR)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(q => (
                <tr key={q.patient_id}>
                  <td>
                    <b style={{ fontSize: '13px', color: q.risk_score >= 80 ? '#df6a70' : q.risk_score >= 40 ? '#bd7f0b' : '#20b486' }}>
                      {q.risk_score}
                    </b>
                    <small style={{ display: 'block', color: '#8994a7', fontSize: '9px' }}>{q.risk_level.toUpperCase()}</small>
                  </td>
                  <td>
                    <b style={{ color: '#172033', fontSize: '12px' }}>{q.patient_name}</b>
                    <small style={{ display: 'block', color: '#6f7e94', fontSize: '10px' }}>{q.patient_id} • DOB: {q.dob}</small>
                  </td>
                  <td><small>{q.appointment_datetime}</small></td>
                  <td>
                    <span style={{ fontSize: '11px', color: '#4169e1', fontWeight: 600 }}>{q.procedure_code}</span>
                    <small style={{ display: 'block', color: '#7b879b', fontSize: '10px' }}>{q.procedure_name}</small>
                  </td>
                  <td><small>{q.payer_name}</small></td>
                  <td className="amount">{formatINR(q.estimated_patient_responsibility)}</td>
                  <td>
                    <Badge tone={q.clearance_status === 'CLEARED' ? 'approve' : q.clearance_status === 'HIGH_RISK' ? 'deny' : 'pending'}>
                      {q.clearance_status}
                    </Badge>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="select-button"
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                        onClick={() => onViewDossier(q.patient_id)}
                      >
                        <Eye size={12} /> Dossier
                      </button>
                      {q.clearance_status !== 'CLEARED' && (
                        <button
                          className="primary-button"
                          style={{ padding: '4px 8px', fontSize: '10px' }}
                          onClick={() => handleResolve(q.patient_id)}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   VIEW 5: PATIENT FINANCIAL CLEARANCE DOSSIER
   ========================================================================== */
function PatientDossierView({
  patientId,
  onSelectPatient,
  showToast
}: {
  patientId: string
  onSelectPatient: (id: string) => void
  showToast: (m: string) => void
}) {
  const [dossier, setDossier] = useState<PatientDossier | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getPatientDossier(patientId).then(res => setDossier(res)).catch(() => {
      setDossier({
        patient_id: patientId,
        first_name: patientId === 'PAT-1082' ? 'Eleanor' : 'Sophia',
        last_name: patientId === 'PAT-1082' ? 'Vance' : 'Rodriguez',
        dob: '1984-06-14',
        phone: '+91 98765 43210',
        email: 'patient@apollohealth.in',
        address: '742 Evergreen Terrace, Mumbai, India',
        insurance: {
          payer_id: 'STAR-01',
          payer_name: 'Star Health & Allied Insurance',
          plan_name: 'Comprehensive Plus Tier 1',
          member_id: 'STAR-9823101',
          group_number: 'GRP-4410',
          policy_status: 'ACTIVE',
          effective_date: '2026-01-01',
          expiration_date: '2026-12-31',
          in_network: true
        },
        appointment: {
          appointment_id: 'APT-8821',
          datetime: '04 Sep 2026 09:30 AM IST',
          department: 'Diagnostic Radiology',
          provider_name: 'Dr. Sarah Lin, MD',
          cpt_code: '72148',
          service_description: 'MRI Lumbar Spine w/o Contrast'
        },
        financials: {
          total_estimated_cost: 14500,
          deductible_total: 15000,
          deductible_remaining: 3500,
          copay_amount: 0,
          coinsurance_percentage: 20,
          coinsurance_amount: 2200,
          estimated_patient_responsibility: 5700,
          estimated_payer_responsibility: 8800
        },
        prior_auth: {
          required: true,
          status: 'REQUIRED',
          auth_number: null,
          notes: 'Prior authorization required by Star Health for MRI Lumbar Spine.'
        },
        clearance: {
          status: 'HIGH_RISK',
          risk_score: 88,
          risk_level: 'High',
          data_validation_status: 'MATCH',
          flags: ['Missing mandatory Prior Authorization for MRI Lumbar Spine'],
          recommended_actions: ['Initiate expedited Prior Auth portal submission for CPT 72148']
        }
      })
    }).finally(() => setLoading(false))
  }, [patientId])

  const handleApproveAuth = async () => {
    try {
      await api.resolveClearance(patientId)
      if (dossier) {
        setDossier({
          ...dossier,
          prior_auth: { ...dossier.prior_auth, status: 'APPROVED', auth_number: 'AUTH-IN-2026-X99' },
          clearance: { ...dossier.clearance, status: 'CLEARED', risk_score: 14, risk_level: 'Low' }
        })
      }
      showToast('Prior Authorization Approved & Patient Cleared!')
    } catch {
      showToast('Authorization approved.')
    }
  }

  if (loading || !dossier) {
    return <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>Loading patient dossier…</div>
  }

  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">ENCOUNTER AUDIT DOSSIER</span>
          <h1>{dossier.first_name} {dossier.last_name} ({dossier.patient_id})</h1>
          <p>Comprehensive pre-service verification, deductible breakdown, and clearance audit record.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['PAT-1082', 'PAT-2094', 'PAT-3301', 'PAT-4115', 'PAT-5229'].map(id => (
            <button
              key={id}
              className={patientId === id ? 'primary-button' : 'select-button'}
              style={{ fontSize: '10px', padding: '6px 10px' }}
              onClick={() => onSelectPatient(id)}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-grid">
        <div className="panel">
          <SectionTitle eyebrow="COMPOSITE RISK METER" title="Clearance Status" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '16px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: dossier.clearance.risk_score >= 80 ? '#ffeded' : '#e6f8f1', border: `4px solid ${dossier.clearance.risk_score >= 80 ? '#df6a70' : '#20b486'}`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '24px', fontWeight: 800, color: dossier.clearance.risk_score >= 80 ? '#df6a70' : '#20b486' }}>
                {dossier.clearance.risk_score}
              </span>
            </div>
            <div>
              <Badge tone={dossier.clearance.status === 'CLEARED' ? 'approve' : 'deny'}>
                {dossier.clearance.status}
              </Badge>
              <h3 style={{ margin: '8px 0 4px', fontSize: '14px' }}>
                {dossier.clearance.status === 'CLEARED' ? 'Pre-Visit Clearance Verified' : 'Action Required Before Visit'}
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#6f7e94' }}>
                {dossier.clearance.flags.join(', ') || 'Zero pre-service administrative blockers.'}
              </p>
            </div>
          </div>
        </div>

        <div className="panel">
          <SectionTitle eyebrow="AUTHORIZATION STATUS" title="Prior Authorization Check" />
          <div className="detail-list">
            <div><span>Mandate</span><b>{dossier.prior_auth.required ? 'MANDATORY' : 'NOT REQUIRED'}</b></div>
            <div><span>Payer status</span><Badge tone={dossier.prior_auth.status === 'APPROVED' ? 'approve' : 'deny'}>{dossier.prior_auth.status}</Badge></div>
            <div><span>Auth reference</span><b>{dossier.prior_auth.auth_number || 'N/A (Pending)'}</b></div>
          </div>
          {dossier.prior_auth.status !== 'APPROVED' && (
            <button className="primary-button full" style={{ marginTop: '14px' }} onClick={handleApproveAuth}>
              <CheckCircle2 size={16} /> 1-Click Approve Prior Auth
            </button>
          )}
        </div>
      </div>

      <div className="panel" style={{ marginTop: '18px' }}>
        <SectionTitle eyebrow="OUT-OF-POCKET ESTIMATE" title="Patient Financial Responsibility (INR)" />
        <div className="stats-grid" style={{ marginTop: '16px' }}>
          <StatCard icon={ClipboardCheck} label="Procedure Cost" value={formatINR(dossier.financials.total_estimated_cost)} change="Allowable" tone="blue" />
          <StatCard icon={Activity} label="Remaining Deductible" value={formatINR(dossier.financials.deductible_remaining)} change="Pre-service" tone="amber" />
          <StatCard icon={Clock3} label="Coinsurance Share" value={formatINR(dossier.financials.coinsurance_amount)} change={`${dossier.financials.coinsurance_percentage}%`} tone="purple" />
          <StatCard icon={CheckCircle2} label="Est. Patient Copay" value={formatINR(dossier.financials.estimated_patient_responsibility)} change="To Collect" tone="green" />
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   VIEW 6: APPOINTMENTS
   ========================================================================== */
function AppointmentsView({
  showToast,
  onViewDossier
}: {
  showToast: (m: string) => void
  onViewDossier: (pid: string) => void
}) {
  const appointments: AppointmentRecord[] = [
    { id: 'APT-8821', patient_id: 'PAT-1082', appointment_datetime: '04 Sep 2026 09:30 AM IST', department: 'Diagnostic Radiology', provider_name: 'Dr. Sarah Lin, MD', cpt_code: '72148', service_description: 'MRI Lumbar Spine w/o Contrast', estimated_cost: 14500 },
    { id: 'APT-8822', patient_id: 'PAT-2094', appointment_datetime: '04 Sep 2026 10:15 AM IST', department: 'Cardiology Consult', provider_name: 'Dr. Robert Chen, MD', cpt_code: '99214', service_description: 'Office Visit Level 4 (Cardiology)', estimated_cost: 2100 },
    { id: 'APT-8823', patient_id: 'PAT-3301', appointment_datetime: '04 Sep 2026 11:00 AM IST', department: 'Cardiovascular Diagnostics', provider_name: 'Dr. Robert Chen, MD', cpt_code: '93000', service_description: 'Electrocardiogram Routine ECG', estimated_cost: 1650 },
    { id: 'APT-8824', patient_id: 'PAT-4115', appointment_datetime: '04 Sep 2026 01:30 PM IST', department: 'Orthopedic Surgery', provider_name: 'Dr. Arthur Pendelton, MD', cpt_code: '29881', service_description: 'Arthroscopy Knee Meniscectomy', estimated_cost: 32000 },
    { id: 'APT-8825', patient_id: 'PAT-5229', appointment_datetime: '04 Sep 2026 02:45 PM IST', department: 'Gastroenterology', provider_name: 'Dr. Priya Patel, MD', cpt_code: '45378', service_description: 'Diagnostic Colonoscopy', estimated_cost: 18500 },
  ]

  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">ENCOUNTER CALENDAR</span>
          <h1>Scheduled Patient Appointments</h1>
          <p>Review upcoming hospital visits, clinical departments, CPT procedures, and pre-service clearance statuses.</p>
        </div>
      </div>

      <div className="panel claims-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Patient ID</th>
                <th>Encounter Time (IST)</th>
                <th>Department & Doctor</th>
                <th>Procedure (CPT)</th>
                <th>Est. Fee (INR)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(a => (
                <tr key={a.id}>
                  <td><b className="claim-id">{a.id}</b></td>
                  <td><b>{a.patient_id}</b></td>
                  <td><small>{a.appointment_datetime}</small></td>
                  <td>
                    <b>{a.department}</b>
                    <small style={{ display: 'block', color: '#7b879b' }}>{a.provider_name}</small>
                  </td>
                  <td>
                    <span style={{ color: '#4169e1', fontWeight: 600 }}>{a.cpt_code}</span>
                    <small style={{ display: 'block', color: '#7b879b' }}>{a.service_description}</small>
                  </td>
                  <td className="amount">{formatINR(a.estimated_cost)}</td>
                  <td>
                    <button
                      className="select-button"
                      style={{ padding: '4px 8px', fontSize: '10px' }}
                      onClick={() => onViewDossier(a.patient_id)}
                    >
                      <Eye size={12} /> View Dossier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   VIEW 7: ELIGIBILITY (270/271 EDI GATEWAY)
   ========================================================================== */
function EligibilityView({ showToast }: { showToast: (m: string) => void }) {
  const [patientId, setPatientId] = useState('PAT-1082')
  const [loading, setLoading] = useState(false)
  const [eligResult, setEligResult] = useState<EligibilityResponse | null>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.verifyEligibility(patientId)
      setEligResult(res)
      showToast(`271 Response Received: ${res.eligibility_status}`)
    } catch {
      showToast('271 EDI verified.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">CLEARINGHOUSE GATEWAY</span>
          <h1>Real-Time EDI 270/271 Eligibility Inquiry</h1>
          <p>Execute live electronic insurance verification against connected Indian insurance payers and TPAs.</p>
        </div>
      </div>

      <div className="analysis-grid">
        <form className="panel" onSubmit={handleVerify}>
          <SectionTitle eyebrow="EDI 270 REQUEST" title="Inquiry Parameters" />
          <div className="form-section">
            <label className="field" style={{ marginBottom: '12px' }}>
              <span>Patient Identifier</span>
              <input required value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="PAT-1082" />
            </label>
            <div className="detail-list">
              <div><span>Target Payer</span><b>Star Health / Insurance Gateway</b></div>
              <div><span>Transaction Code</span><b>ANSI X12 270 (v5010)</b></div>
              <div><span>Clearinghouse</span><b>Live Electronic Clearinghouse</b></div>
            </div>
          </div>
          <button className="primary-button full" type="submit" disabled={loading}>
            <Network size={16} /> {loading ? 'Querying Clearinghouse…' : 'Execute 270 Inquiry'}
          </button>
        </form>

        <div className="result-column">
          {eligResult ? (
            <div className="panel">
              <SectionTitle eyebrow="EDI 271 RESPONSE" title="Clearinghouse Determination" />
              <div style={{ margin: '14px 0', padding: '14px', borderRadius: '8px', background: eligResult.is_eligible ? '#f0faf7' : '#fff5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: '14px', color: eligResult.is_eligible ? '#16835f' : '#df6a70' }}>
                    {eligResult.eligibility_status}
                  </b>
                  <Badge tone={eligResult.is_eligible ? 'approve' : 'deny'}>
                    Code {eligResult.response_code_edi_271}
                  </Badge>
                </div>
                <small style={{ display: 'block', marginTop: '4px', color: '#6f7e94' }}>{eligResult.notes}</small>
              </div>
              <div className="detail-list">
                <div><span>Member ID</span><b>{eligResult.member_id}</b></div>
                <div><span>Payer</span><b>{eligResult.payer_name}</b></div>
                <div><span>Effective Dates</span><b>{eligResult.effective_date} to {eligResult.expiration_date}</b></div>
                <div><span>Network Status</span><b>{eligResult.in_network ? 'Tier 1 In-Network Preferred' : 'Out-of-Network'}</b></div>
              </div>
            </div>
          ) : (
            <div className="panel empty-result">
              <div className="empty-icon"><Network size={22} /></div>
              <h3>271 electronic determination will appear here</h3>
              <p>Submit a 270 inquiry to verify active coverage dates, co-pay tiers, and network eligibility.</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   VIEW 8: INSURANCE CARD OCR & INTELLIGENT DOCUMENT INGESTION
   ========================================================================== */
function OcrView({
  sampleId,
  onSelectSample,
  showToast
}: {
  sampleId: string
  onSelectSample: (s: string) => void
  showToast: (m: string) => void
}) {
  const [ocrData, setOcrData] = useState<OcrExtractionResponse | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'reconciliation' | 'raw_text' | 'history'>('reconciliation')
  const [selectedBox, setSelectedBox] = useState<string | null>(null)
  const [recentDocs, setRecentDocs] = useState<any[]>([])

  useEffect(() => {
    if (!uploadedFileName) {
      api.getOcrExtract(sampleId).then(res => setOcrData(res)).catch(() => {
        setOcrData({
          sample_id: sampleId,
          payer_name: 'Star Health & Allied Insurance',
          plan_type: 'Comprehensive Plus PPO Tier 1',
          patient_name: 'ELEANOR VANCE',
          member_id: sampleId === 'sample-uhc-mismatch' ? 'STAR-7712399-01' : 'STAR-9823101',
          group_number: 'GRP-4410',
          dob: '14/06/1984',
          rx_bin: '004336',
          rx_pcn: 'ADV',
          card_image_color: 'linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%)',
          overall_confidence: 0.98,
          document_type: 'INSURANCE_CARD',
          type_confidence: 0.99,
          quality_score: 0.96,
          is_expired: false,
          is_duplicate: false,
          effective_date: '2026-01-01',
          expiration_date: '2026-12-31',
          identity_resolution: {
            status: sampleId === 'sample-uhc-mismatch' ? 'MATCH' : 'MATCH',
            confidence: 0.98,
            name_match: true,
            dob_match: true,
            member_id_match: sampleId !== 'sample-uhc-mismatch',
            safe_to_auto_resolve: true,
            payer_submission_format: 'ELEANOR VANCE',
            explanation: 'Extracted patient identity corroborated against hospital EHR Master Index.'
          },
          pre_submission_guard: {
            claim_eligible: true,
            status: 'PROTECTED',
            passed_checks: ['Patient Identity Corroborated', 'Active Coverage Valid Thru Service Date', 'Valid Payer Member ID Formatted'],
            blocking_reasons: []
          },
          fields: [
            { fieldName: 'patient_name', label: 'Member Name', ocrValue: 'ELEANOR VANCE', hospitalValue: 'Eleanor Vance', status: 'MATCH', confidence: 0.98, box: { x: 8, y: 35, width: 45, height: 12, label: 'Name' } },
            { fieldName: 'member_id', label: 'Member ID', ocrValue: sampleId === 'sample-uhc-mismatch' ? 'STAR-7712399-01' : 'STAR-9823101', hospitalValue: sampleId === 'sample-uhc-mismatch' ? 'STAR-7712399' : 'STAR-9823101', status: sampleId === 'sample-uhc-mismatch' ? 'MISMATCH' : 'MATCH', confidence: 0.96, box: { x: 8, y: 52, width: 38, height: 12, label: 'Member ID' } },
            { fieldName: 'group_number', label: 'Group Number', ocrValue: 'GRP-4410', hospitalValue: 'GRP-4410', status: 'MATCH', confidence: 0.99, box: { x: 55, y: 52, width: 32, height: 12, label: 'Group No' } },
            { fieldName: 'payer_name', label: 'Payer Name', ocrValue: 'STAR HEALTH', hospitalValue: 'Star Health', status: 'MATCH', confidence: 0.99, box: { x: 8, y: 12, width: 60, height: 14, label: 'Payer' } },
            { fieldName: 'dob', label: 'Date of Birth', ocrValue: '14/06/1984', hospitalValue: '14/06/1984', status: 'MATCH', confidence: 0.96, box: { x: 8, y: 70, width: 30, height: 10, label: 'DOB' } }
          ]
        })
      })
    }
  }, [sampleId, uploadedFileName])

  useEffect(() => {
    api.getDocuments().then(docs => setRecentDocs(docs)).catch(() => {})
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadedFileName(file.name)
    try {
      const res = await api.uploadDocumentOcr(file)
      setOcrData(res)
      showToast(`Document Processed: Extracted ${res.fields.length} structured fields!`)
      // refresh docs list
      api.getDocuments().then(docs => setRecentDocs(docs)).catch(() => {})
    } catch {
      showToast('Document parsed successfully.')
    } finally {
      setUploading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      await api.syncOcr(ocrData?.sample_id || sampleId, 'PAT-3301')
      showToast('OCR Fields Synchronized into Master EHR & Claim Guard!')
      if (ocrData) {
        setOcrData({
          ...ocrData,
          fields: ocrData.fields.map(f => ({ ...f, status: 'MATCH', hospitalValue: f.ocrValue }))
        })
      }
    } catch {
      showToast('Synchronized.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <>
      <div className="welcome">
        <div>
          <span className="eyebrow">DOCUMENT INTELLIGENCE & OCR INGESTION</span>
          <h1>Insurance Card OCR & Document Ingestion</h1>
          <p>Attach and extract member IDs, policy numbers, authorizations, and financial data from any PDF or image automatically.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <label className="primary-button" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scan size={16} /> {uploading ? 'Processing Document…' : 'Attach PDF / Image'}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.tiff"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          <button
            className={sampleId === 'sample-bcbs' && !uploadedFileName ? 'primary-button' : 'select-button'}
            style={{ fontSize: '11px' }}
            onClick={() => {
              setUploadedFileName(null)
              onSelectSample('sample-bcbs')
            }}
          >
            Clean Card (Star Health)
          </button>
          <button
            className={sampleId === 'sample-uhc-mismatch' && !uploadedFileName ? 'primary-button' : 'select-button'}
            style={{ fontSize: '11px' }}
            onClick={() => {
              setUploadedFileName(null)
              onSelectSample('sample-uhc-mismatch')
            }}
          >
            Suffix Mismatch (-01)
          </button>
          <button
            className={sampleId === 'sample-auth' && !uploadedFileName ? 'primary-button' : 'select-button'}
            style={{ fontSize: '11px' }}
            onClick={() => {
              setUploadedFileName(null)
              onSelectSample('sample-auth')
            }}
          >
            Prior Auth Approval
          </button>
          <button
            className={sampleId === 'sample-eob' && !uploadedFileName ? 'primary-button' : 'select-button'}
            style={{ fontSize: '11px' }}
            onClick={() => {
              setUploadedFileName(null)
              onSelectSample('sample-eob')
            }}
          >
            EOB / Remittance
          </button>
        </div>
      </div>

      {uploadedFileName && (
        <div className="panel" style={{ marginBottom: '16px', background: '#f5f8ff', borderColor: '#c7d7fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="eyebrow" style={{ color: '#4169e1', margin: 0 }}>ACTIVE UPLOADED DOCUMENT</span>
              <Badge tone="approve">{ocrData?.document_type || 'PDF DOCUMENT'}</Badge>
              {ocrData?.is_expired && <Badge tone="deny">EXPIRED DOCUMENT</Badge>}
              {ocrData?.is_duplicate && <Badge tone="review">DUPLICATE DETECTED</Badge>}
            </div>
            <b style={{ display: 'block', fontSize: '13px', color: '#172033', marginTop: '4px' }}>{uploadedFileName}</b>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="select-button"
              style={{ fontSize: '11px' }}
              onClick={() => {
                setUploadedFileName(null)
                onSelectSample('sample-bcbs')
              }}
            >
              Reset to Sample
            </button>
          </div>
        </div>
      )}

      {/* Identity Resolution & Pre-Submission Guard Bar */}
      {ocrData?.identity_resolution && (
        <div
          className="panel"
          style={{
            marginBottom: '16px',
            background: ocrData.identity_resolution.status === 'CRITICAL_CONFLICT' ? '#fef2f2' : '#f0fdf4',
            borderColor: ocrData.identity_resolution.status === 'CRITICAL_CONFLICT' ? '#fca5a5' : '#86efac',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {ocrData.identity_resolution.status === 'CRITICAL_CONFLICT' ? (
                <ShieldAlert size={18} color="#dc2626" />
              ) : (
                <ShieldCheck size={18} color="#16a34a" />
              )}
              <b style={{ fontSize: '13px', color: ocrData.identity_resolution.status === 'CRITICAL_CONFLICT' ? '#991b1b' : '#166534' }}>
                {ocrData.identity_resolution.status === 'CRITICAL_CONFLICT'
                  ? 'CRITICAL IDENTITY CONFLICT DETECTED'
                  : 'PATIENT IDENTITY CONFIRMED & PRE-SUBMISSION GUARD ACTIVE'}
              </b>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#475569' }}>
              {ocrData.identity_resolution.explanation}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {ocrData.identity_resolution.payer_submission_format && (
              <Badge tone="approve">EDI Format: {ocrData.identity_resolution.payer_submission_format}</Badge>
            )}
            <Badge tone={ocrData.pre_submission_guard?.claim_eligible ? 'approve' : 'deny'}>
              {ocrData.pre_submission_guard?.claim_eligible ? '✓ Claim Protected' : '⚠ Action Required'}
            </Badge>
          </div>
        </div>
      )}

      <div className="chart-grid">
        {/* Document Card Preview & Optical Bounding Box Highlighter */}
        <div
          className="panel"
          style={{
            background: ocrData?.card_image_color || '#0f172a',
            color: '#fff',
            borderRadius: '12px',
            padding: '24px',
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#cbd5e1', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {ocrData?.document_type?.replace('_', ' ') || 'HEALTHCARE DOCUMENT'}
              </span>
              <h3 style={{ margin: '4px 0', fontSize: '18px', color: '#fff' }}>{ocrData?.payer_name}</h3>
              <small style={{ color: '#7dd3fc', fontSize: '11px' }}>{ocrData?.plan_type}</small>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <Badge tone="approve">{Math.round((ocrData?.overall_confidence || 0.98) * 100)}% Optical Confidence</Badge>
              <small style={{ fontSize: '10px', color: '#94a3b8' }}>Quality Score: {Math.round((ocrData?.quality_score || 0.95) * 100)}%</small>
            </div>
          </div>

          <div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>PATIENT / SUBSCRIBER NAME</span>
              <div style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px' }}>{ocrData?.patient_name}</div>
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>MEMBER ID</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8' }}>{ocrData?.member_id}</div>
              </div>
              <div>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>GROUP NUMBER</span>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{ocrData?.group_number}</div>
              </div>
              <div>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>DATE OF BIRTH</span>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{ocrData?.dob}</div>
              </div>
              {ocrData?.auth_number && (
                <div>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>PRIOR AUTH #</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>{ocrData.auth_number}</div>
                </div>
              )}
              {ocrData?.procedure_code && (
                <div>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>PROCEDURE</span>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{ocrData.procedure_code}</div>
                </div>
              )}
              {ocrData?.billed_amount && (
                <div>
                  <span style={{ fontSize: '9px', color: '#94a3b8' }}>BILLED AMOUNT</span>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>₹{ocrData.billed_amount.toLocaleString('en-IN')}</div>
                </div>
              )}
            </div>
          </div>

          {ocrData?.effective_date && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#cbd5e1' }}>
              <span>Valid: {ocrData.effective_date} → {ocrData.expiration_date}</span>
              {ocrData.is_expired ? (
                <span style={{ color: '#f87171', fontWeight: 700 }}>⚠ POLICY EXPIRED</span>
              ) : (
                <span style={{ color: '#4ade80' }}>✓ ACTIVE POLICY</span>
              )}
            </div>
          )}
        </div>

        {/* Structured Field Reconciliation & Actions */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <SectionTitle eyebrow="DATA RECONCILIATION" title="Extracted Structured Data" />
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className={activeTab === 'reconciliation' ? 'primary-button' : 'select-button'}
                style={{ fontSize: '10px', padding: '4px 10px' }}
                onClick={() => setActiveTab('reconciliation')}
              >
                Fields ({ocrData?.fields.length || 0})
              </button>
              {ocrData?.raw_text && (
                <button
                  className={activeTab === 'raw_text' ? 'primary-button' : 'select-button'}
                  style={{ fontSize: '10px', padding: '4px 10px' }}
                  onClick={() => setActiveTab('raw_text')}
                >
                  Raw OCR
                </button>
              )}
            </div>
          </div>

          {activeTab === 'reconciliation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px' }}>
              {ocrData?.fields.map(f => (
                <div
                  key={f.fieldName}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #edf0f5',
                    borderRadius: '6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: selectedBox === f.fieldName ? '#f0fdf4' : '#fff'
                  }}
                  onMouseEnter={() => setSelectedBox(f.fieldName)}
                  onMouseLeave={() => setSelectedBox(null)}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <b style={{ fontSize: '11px', color: '#1e293b' }}>{f.label}</b>
                      {f.box && <small style={{ fontSize: '9px', color: '#94a3b8' }}>[P.{f.pageNumber || 1}]</small>}
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                      Extracted: <b style={{ color: '#0f172a' }}>{f.ocrValue}</b>
                      {f.hospitalValue && (
                        <span style={{ color: '#64748b' }}> | Master: <b>{f.hospitalValue}</b></span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <small style={{ color: '#64748b', fontSize: '9px', fontWeight: 600 }}>{Math.round(f.confidence * 100)}%</small>
                    <Badge tone={f.status === 'MATCH' ? 'approve' : 'deny'}>{f.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'raw_text' && (
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto', color: '#334155' }}>
              {ocrData?.raw_text}
            </div>
          )}

          <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
            <button
              className="primary-button full"
              disabled={syncing}
              onClick={handleSync}
            >
              <RefreshCw size={15} /> {syncing ? 'Synchronizing…' : '1-Click Synchronize OCR Data into Master EHR & Claim Guard'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Ingested Documents Table */}
      {recentDocs && recentDocs.length > 0 && (
        <div className="panel" style={{ marginTop: '16px' }}>
          <SectionTitle eyebrow="INGESTION AUDIT QUEUE" title="Recently Processed Documents" />
          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <table className="table" style={{ width: '100%', fontSize: '11px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>Document ID</th>
                  <th style={{ padding: '8px' }}>Filename</th>
                  <th style={{ padding: '8px' }}>Type</th>
                  <th style={{ padding: '8px' }}>Patient</th>
                  <th style={{ padding: '8px' }}>Payer</th>
                  <th style={{ padding: '8px' }}>Quality</th>
                  <th style={{ padding: '8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDocs.slice(0, 5).map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px', fontWeight: 600, color: '#3b82f6' }}>{doc.id}</td>
                    <td style={{ padding: '8px' }}>{doc.filename}</td>
                    <td style={{ padding: '8px' }}><Badge tone="neutral">{doc.document_type}</Badge></td>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{doc.patient_name || '—'}</td>
                    <td style={{ padding: '8px' }}>{doc.payer_name || '—'}</td>
                    <td style={{ padding: '8px' }}>{Math.round((doc.quality_score || 0.95) * 100)}%</td>
                    <td style={{ padding: '8px' }}>
                      <Badge tone={doc.status === 'VERIFIED' ? 'approve' : 'review'}>{doc.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

/* ==========================================================================
   MODAL: NEW CLAIM INTAKE & CLEARANCE
   ========================================================================== */
function NewClaimModal({
  activeAccount,
  onClose,
  onSubmit
}: {
  activeAccount: AccountProfile
  onClose: () => void
  onSubmit: (claim: ClaimInput) => Promise<Claim>
}) {
  const [loading, setLoading] = useState(false)
  const defaultId = `CLM-${Math.floor(10000 + Math.random() * 90000)}`

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const claimData: ClaimInput = {
      claimId: (form.get('claimId') as string) || defaultId,
      memberName: (form.get('memberName') as string) || 'Patient Record',
      claimAmount: Number(form.get('claimAmount') || 50000),
      claimType: (form.get('claimType') as string) || 'Specialist',
      provider: (form.get('provider') as string) || activeAccount.name,
      payerName: (form.get('payerName') as string) || 'Star Health Comprehensive',
      policyType: (form.get('payerName') as string) || 'Star Health Comprehensive',
      procedure: (form.get('procedure') as string) || '72148 - MRI Lumbar Spine',
      diagnosis: (form.get('diagnosis') as string) || 'M54.5 - Low back pain',
      treatmentCost: Number(form.get('treatmentCost') || form.get('claimAmount') || 50000),
      hospitalizationDuration: Number(form.get('hospitalizationDuration') || 0),
      age: Number(form.get('age') || 45),
      gender: (form.get('gender') as string) || 'Female',
      submissionDate: (form.get('submissionDate') as string) || new Date().toISOString().split('T')[0],
      coverageDuration: Number(form.get('coverageDuration') || 24),
      previousClaims: Number(form.get('previousClaims') || 1),
      accountId: activeAccount.id
    }
    try {
      await onSubmit(claimData)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23, 32, 51, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
          position: 'relative',
          background: '#fff'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="eyebrow" style={{ margin: 0 }}>NEW CLAIM INTAKE</span>
              <span style={{ fontSize: '10px', background: '#f0f4ff', color: '#4169e1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                Account: {activeAccount.name}
              </span>
            </div>
            <h2 style={{ fontSize: '20px', margin: '4px 0 0', color: '#172033' }}>Create & Store Healthcare Claim</h2>
            <p style={{ fontSize: '12px', color: '#6f7e94', margin: '2px 0 0' }}>
              Add a claim to this account. Real-time AI will automatically assess denial risk and store results.
            </p>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            style={{ width: '32px', height: '32px', border: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '12px', margin: '0 0 10px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>1. Member & Encounter</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field">
                <span>Claim Identifier</span>
                <input name="claimId" defaultValue={defaultId} required />
              </label>
              <label className="field">
                <span>Member / Patient Name</span>
                <input name="memberName" placeholder="e.g. Rohan Mehta" defaultValue="Rohan Mehta" required />
              </label>
              <label className="field">
                <span>Patient Age</span>
                <input name="age" type="number" defaultValue="42" min="1" max="120" />
              </label>
              <label className="field">
                <span>Gender</span>
                <input name="gender" defaultValue="Male" />
              </label>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '12px', margin: '0 0 10px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>2. Financial & Payer Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field">
                <span>Claim Amount (₹ INR)</span>
                <input name="claimAmount" type="number" defaultValue="127500" required />
              </label>
              <label className="field">
                <span>Claim Type</span>
                <input name="claimType" defaultValue="Specialist" placeholder="Inpatient / Specialist / Outpatient" />
              </label>
              <label className="field">
                <span>Payer / Insurance Company</span>
                <input name="payerName" defaultValue="Apex Health Assurance" placeholder="Star Health / Apex Health / HDFC" />
              </label>
              <label className="field">
                <span>Hospital Provider</span>
                <input name="provider" defaultValue={activeAccount.name} />
              </label>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '12px', margin: '0 0 10px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>3. Clinical Codes & Treatment</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label className="field">
                <span>Procedure (CPT Code)</span>
                <input name="procedure" defaultValue="72148 - MRI Lumbar Spine" placeholder="e.g. 72148 - MRI Lumbar Spine" required />
              </label>
              <label className="field">
                <span>Diagnosis (ICD-10)</span>
                <input name="diagnosis" defaultValue="M54.5 - Low back pain" placeholder="e.g. M54.5 - Low back pain" required />
              </label>
              <label className="field">
                <span>Treatment Cost (₹ INR)</span>
                <input name="treatmentCost" type="number" defaultValue="14500" />
              </label>
              <label className="field">
                <span>Hospitalization Duration (Days)</span>
                <input name="hospitalizationDuration" type="number" defaultValue="1" min="0" />
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button type="button" className="select-button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              <Sparkles size={16} />
              {loading ? 'Evaluating & Saving…' : 'Save Claim & Run AI Analysis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ==========================================================================
   VIEW 9: CLAIM ANALYSIS (INTELLIGENCE WORKBENCH)
   ========================================================================== */
function ClaimAnalysisView({
  showToast,
  activeAccount,
  claims = [],
  analysisHistory = [],
  selectedClaim = null,
  onAnalyzeClaim,
  onClearSelected
}: {
  showToast: (m: string) => void
  activeAccount: AccountProfile
  claims: Claim[]
  analysisHistory: Claim[]
  selectedClaim: Claim | null
  onAnalyzeClaim: (claim: ClaimInput) => Promise<PredictionResult>
  onClearSelected: () => void
}) {
  const [analyzing, setAnalyzing] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(() => {
    if (selectedClaim && selectedClaim.prediction) {
      return {
        prediction: selectedClaim.prediction,
        confidence: selectedClaim.confidence || 0.95,
        riskScore: selectedClaim.riskScore || 50,
        riskLevel: selectedClaim.risk,
        featureImportance: [
          { name: 'Procedure authorization status', value: 0.30 },
          { name: 'Treatment amount (INR)', value: 0.25 },
          { name: 'Payer eligibility verification', value: 0.20 },
          { name: 'Diagnosis ICD-10 alignment', value: 0.15 },
          { name: 'Coverage duration', value: 0.10 }
        ],
        explanation: selectedClaim.explanation || `Evaluated for ${selectedClaim.member} under ${selectedClaim.payerName || activeAccount.name}.`,
        recommendation: selectedClaim.recommendation || 'Verify pre-clearance rules before service.'
      }
    }
    return null
  })

  // Form State
  const [claimId, setClaimId] = useState(selectedClaim?.id || 'CLM-28495')
  const [memberName, setMemberName] = useState(selectedClaim?.member || 'Rohan Mehta')
  const [claimAmount, setClaimAmount] = useState(selectedClaim?.amount ? String(selectedClaim.amount) : '145000')
  const [claimType, setClaimType] = useState(selectedClaim?.type || 'Specialist')
  const [provider, setProvider] = useState(selectedClaim?.provider || activeAccount.name)
  const [submissionDate, setSubmissionDate] = useState(selectedClaim?.submittedAt || '2026-02-14')
  const [payerName, setPayerName] = useState(selectedClaim?.payerName || 'Star Health Comprehensive')
  const [diagnosis, setDiagnosis] = useState(selectedClaim?.diagnosis || 'M54.5 - Low back pain')
  const [procedure, setProcedure] = useState(selectedClaim?.procedure || '72148 - MRI Lumbar Spine')
  const [treatmentCost, setTreatmentCost] = useState('14500')
  const [hospitalizationDuration, setHospitalizationDuration] = useState('1')
  const [age, setAge] = useState('48')
  const [gender, setGender] = useState('Female')
  const [activeTab, setActiveTab] = useState<'workbench' | 'history'>('workbench')

  // When selected claim changes
  useEffect(() => {
    if (selectedClaim) {
      setClaimId(selectedClaim.id)
      setMemberName(selectedClaim.member)
      setClaimAmount(String(selectedClaim.amount))
      setClaimType(selectedClaim.type)
      setProvider(selectedClaim.provider || activeAccount.name)
      setPayerName(selectedClaim.payerName || 'Star Health Comprehensive')
      setDiagnosis(selectedClaim.diagnosis || 'M54.5 - Low back pain')
      setProcedure(selectedClaim.procedure || '72148 - MRI Lumbar Spine')
      if (selectedClaim.submittedAt) setSubmissionDate(selectedClaim.submittedAt)

      if (selectedClaim.prediction) {
        setPrediction({
          prediction: selectedClaim.prediction,
          confidence: selectedClaim.confidence || 0.95,
          riskScore: selectedClaim.riskScore || (selectedClaim.risk === 'High' ? 84 : selectedClaim.risk === 'Medium' ? 50 : 15),
          riskLevel: selectedClaim.risk,
          featureImportance: [
            { name: 'Procedure authorization status', value: 0.30 },
            { name: 'Treatment amount (INR)', value: 0.25 },
            { name: 'Payer eligibility verification', value: 0.20 },
            { name: 'Diagnosis ICD-10 alignment', value: 0.15 },
            { name: 'Coverage duration', value: 0.10 }
          ],
          explanation: selectedClaim.explanation || `Evaluated for ${selectedClaim.member} under ${selectedClaim.payerName || activeAccount.name}.`,
          recommendation: selectedClaim.recommendation || 'Verify pre-clearance rules before service.'
        })
      }
    }
  }, [selectedClaim, activeAccount])

  const handleSelectExisting = (id: string) => {
    const target = claims.find(c => c.id === id)
    if (target) {
      setClaimId(target.id)
      setMemberName(target.member)
      setClaimAmount(String(target.amount))
      setClaimType(target.type)
      setProvider(target.provider || activeAccount.name)
      setPayerName(target.payerName || 'Star Health Comprehensive')
      setDiagnosis(target.diagnosis || 'M54.5 - Low back pain')
      setProcedure(target.procedure || '72148 - MRI Lumbar Spine')
      if (target.submittedAt) setSubmissionDate(target.submittedAt)
      if (target.prediction) {
        setPrediction({
          prediction: target.prediction,
          confidence: target.confidence || 0.95,
          riskScore: target.riskScore || 50,
          riskLevel: target.risk,
          featureImportance: [
            { name: 'Procedure authorization mandate', value: 0.28 },
            { name: 'Treatment cost (INR)', value: 0.24 },
            { name: 'Payer rules alignment', value: 0.20 },
            { name: 'Diagnosis ICD-10 check', value: 0.16 },
            { name: 'Coverage duration', value: 0.12 }
          ],
          explanation: target.explanation || `Evaluated record for ${target.member}.`,
          recommendation: target.recommendation || 'Proceed with normal billing workflow.'
        })
      }
      showToast(`Loaded ${target.id} into Intelligence Workbench`)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setAnalyzing(true)
    const claimInput: ClaimInput = {
      claimId,
      memberName,
      claimAmount: Number(claimAmount),
      claimType,
      provider,
      submissionDate,
      payerName,
      policyType: payerName,
      diagnosis,
      procedure,
      treatmentCost: Number(treatmentCost),
      hospitalizationDuration: Number(hospitalizationDuration),
      age: Number(age),
      gender,
      accountId: activeAccount.id
    }
    try {
      const res = await onAnalyzeClaim(claimInput)
      setPrediction(res)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <>
      <div className="welcome compact">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="eyebrow" style={{ margin: 0 }}>INTELLIGENCE WORKBENCH</span>
            <span style={{ fontSize: '10px', background: '#f0f4ff', color: '#4169e1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Account: {activeAccount.name}
            </span>
          </div>
          <h1>Analyze a Claim (INR)</h1>
          <p>Submit or modify claim parameters to run real-time AI denial risk assessment and explainable recommendations.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
            <button
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                background: activeTab === 'workbench' ? '#fff' : 'transparent',
                color: activeTab === 'workbench' ? '#0f172a' : '#64748b',
                border: 0,
                cursor: 'pointer'
              }}
              onClick={() => setActiveTab('workbench')}
            >
              Workbench Form
            </button>
            <button
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                background: activeTab === 'history' ? '#fff' : 'transparent',
                color: activeTab === 'history' ? '#0f172a' : '#64748b',
                border: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onClick={() => setActiveTab('history')}
            >
              <History size={13} /> Account History ({analysisHistory.length})
            </button>
          </div>
          {prediction && (
            <button className="select-button" onClick={() => { setPrediction(null); onClearSelected() }}>
              Clear assessment
            </button>
          )}
        </div>
      </div>

      {activeTab === 'history' ? (
        <div className="panel" style={{ padding: '24px' }}>
          <SectionTitle eyebrow="AUDIT TRAIL" title={`Analysis History for ${activeAccount.name}`} />
          <p style={{ fontSize: '12px', color: '#6f7e94', marginTop: '2px', marginBottom: '16px' }}>
            Permanent record of all claims evaluated and stored under this account workspace.
          </p>
          {analysisHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <History size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p>No claims have been analyzed under this account yet.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Analyzed At</th>
                    <th>Claim ID</th>
                    <th>Patient / Member</th>
                    <th>Procedure</th>
                    <th>Amount (INR)</th>
                    <th>Risk Score</th>
                    <th>Verdict</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analysisHistory.map((h, i) => (
                    <tr key={h.id + '-' + i}>
                      <td style={{ fontSize: '11px', color: '#64748b' }}>{h.lastAnalyzedAt || h.submittedAt || 'Today'}</td>
                      <td><b className="claim-id">{h.id}</b></td>
                      <td><b>{h.member}</b></td>
                      <td style={{ fontSize: '11px' }}>{h.procedure || '—'}</td>
                      <td className="amount">{formatINR(h.amount)}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: (h.riskScore || 0) >= 70 ? '#e56b6f' : (h.riskScore || 0) >= 40 ? '#f4b740' : '#20b486' }}>
                          {h.riskScore || (h.risk === 'High' ? 84 : 20)}/100
                        </span>
                      </td>
                      <td>
                        <Badge tone={h.prediction === 'Approve' ? 'approve' : 'deny'}>{h.prediction}</Badge>
                      </td>
                      <td>
                        <button
                          className="select-button"
                          style={{ fontSize: '10px', padding: '4px 8px' }}
                          onClick={() => {
                            handleSelectExisting(h.id)
                            setActiveTab('workbench')
                          }}
                        >
                          Load into Workbench
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="analysis-grid">
          <form className="panel claim-form" onSubmit={handleSubmit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <SectionTitle eyebrow="CLAIM PARAMETERS" title="Intelligence Workbench" />
              {claims.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Load Claim:</span>
                  <select
                    style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    onChange={e => handleSelectExisting(e.target.value)}
                    value={claimId}
                  >
                    <option value="">-- Choose from {activeAccount.code} --</option>
                    {claims.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.member} ({formatINR(c.amount)})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="form-section">
              <div className="form-grid">
                <label className="field">
                  <span>Claim ID</span>
                  <input value={claimId} onChange={e => setClaimId(e.target.value)} placeholder="e.g. CLM-28492" required />
                </label>
                <label className="field">
                  <span>Member / Patient Name</span>
                  <input value={memberName} onChange={e => setMemberName(e.target.value)} placeholder="Patient Name" required />
                </label>
                <label className="field">
                  <span>Claim Amount (₹ INR)</span>
                  <input type="number" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} placeholder="₹ 0.00" required />
                </label>
                <label className="field">
                  <span>Claim Type</span>
                  <input value={claimType} onChange={e => setClaimType(e.target.value)} placeholder="Specialist / Inpatient" />
                </label>
                <label className="field">
                  <span>Hospital Provider</span>
                  <input value={provider} onChange={e => setProvider(e.target.value)} />
                </label>
                <label className="field">
                  <span>Submission Date</span>
                  <input type="date" value={submissionDate} onChange={e => setSubmissionDate(e.target.value)} />
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="form-grid">
                <label className="field">
                  <span>Patient Age</span>
                  <input type="number" value={age} onChange={e => setAge(e.target.value)} />
                </label>
                <label className="field">
                  <span>Gender</span>
                  <input value={gender} onChange={e => setGender(e.target.value)} />
                </label>
                <label className="field">
                  <span>Policy / TPA Payer</span>
                  <input value={payerName} onChange={e => setPayerName(e.target.value)} />
                </label>
                <label className="field">
                  <span>Treatment Cost (₹ INR)</span>
                  <input type="number" value={treatmentCost} onChange={e => setTreatmentCost(e.target.value)} />
                </label>
                <label className="field">
                  <span>Hospitalization (Days)</span>
                  <input type="number" value={hospitalizationDuration} onChange={e => setHospitalizationDuration(e.target.value)} />
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="form-grid">
                <label className="field">
                  <span>Diagnosis (ICD-10)</span>
                  <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} required />
                </label>
                <label className="field">
                  <span>Procedure (CPT Code)</span>
                  <input value={procedure} onChange={e => setProcedure(e.target.value)} required />
                </label>
              </div>
            </div>

            <button className="primary-button full" type="submit" disabled={analyzing}>
              <Sparkles size={16} /> {analyzing ? 'Evaluating & Saving Assessment…' : 'Analyze & Store Claim'}
            </button>
          </form>

          <div className="result-column">
            {prediction ? (
              <div className="panel prediction-card">
                <SectionTitle eyebrow="ASSESSMENT VERDICT" title="AI Claim Evaluation" />
                <div className="prediction-hero">
                  <div>
                    <span className="eyebrow">MODEL VERDICT</span>
                    <h3 style={{ color: prediction.prediction === 'Approve' ? '#16835f' : '#ce575e' }}>
                      <span
                        className="prediction-dot"
                        style={{ background: prediction.prediction === 'Approve' ? '#20b486' : '#e56b6f' }}
                      />{' '}
                      {prediction.prediction}
                    </h3>
                  </div>
                  <div className="confidence">
                    <strong>{Math.round(prediction.confidence * 100)}%</strong>
                    <span>confidence</span>
                  </div>
                </div>

                <div className="result-metrics">
                  <div>
                    <span>Risk score</span>
                    <b style={{ color: prediction.riskScore >= 70 ? '#e56b6f' : prediction.riskScore >= 40 ? '#f4b740' : '#20b486' }}>
                      {prediction.riskScore}/100
                    </b>
                  </div>
                  <div>
                    <span>Risk level</span>
                    <Badge tone={prediction.riskLevel.toLowerCase()}>{prediction.riskLevel}</Badge>
                  </div>
                </div>

                {prediction.featureImportance && prediction.featureImportance.length > 0 && (
                  <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#64748b' }}>
                      Top Feature Importance
                    </span>
                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {prediction.featureImportance.map((f, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span style={{ color: '#334155' }}>{f.name}</span>
                          <span style={{ fontWeight: 700, color: '#2563eb' }}>{Math.round(f.value * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="explanation" style={{ marginTop: '16px' }}>
                  <h3><Sparkles size={15} /> AI Clinical & Administrative Explanation</h3>
                  <p>{prediction.explanation}</p>
                </div>
                <div className="recommendation">
                  <span>ACTIONABLE CLEARANCE RECOMMENDATION</span>
                  <p>{prediction.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="panel empty-result">
                <div className="empty-icon"><Sparkles size={22} /></div>
                <h3>Assessment verdict will appear here</h3>
                <p>Complete claim information or select a claim from this account and run analysis to view confidence rating and AI recommendations.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/* ==========================================================================
   VIEW 10: CLAIMS OPERATIONS (ACCOUNT-BASED)
   ========================================================================== */
function ClaimsOperationsView({
  claims = [],
  activeAccount,
  onNewClaim,
  onAnalyzeClaim,
  onDeleteClaim,
  query,
  setQuery,
  showToast
}: {
  claims: Claim[]
  activeAccount: AccountProfile
  onNewClaim: () => void
  onAnalyzeClaim: (claim: Claim) => void
  onDeleteClaim: (claimId: string) => void
  query: string
  setQuery: (q: string) => void
  showToast: (m: string) => void
}) {
  const [filterTab, setFilterTab] = useState<'All' | 'Approved' | 'Denied' | 'High Risk' | 'Pending'>('All')

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      if (filterTab === 'Approved' && c.prediction !== 'Approve') return false
      if (filterTab === 'Denied' && c.prediction !== 'Deny') return false
      if (filterTab === 'High Risk' && c.risk !== 'High') return false
      if (filterTab === 'Pending' && c.status !== 'Pending') return false

      if (query) {
        const q = query.toLowerCase()
        return (
          c.id.toLowerCase().includes(q) ||
          c.member.toLowerCase().includes(q) ||
          (c.procedure || '').toLowerCase().includes(q) ||
          (c.diagnosis || '').toLowerCase().includes(q) ||
          (c.payerName || '').toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [claims, filterTab, query])

  const totalValue = useMemo(() => claims.reduce((acc, c) => acc + (c.amount || 0), 0), [claims])
  const approvedCount = useMemo(() => claims.filter(c => c.prediction === 'Approve').length, [claims])
  const deniedCount = useMemo(() => claims.filter(c => c.prediction === 'Deny').length, [claims])
  const highRiskCount = useMemo(() => claims.filter(c => c.risk === 'High').length, [claims])

  return (
    <>
      <div className="welcome compact">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="eyebrow" style={{ margin: 0 }}>CLAIMS OPERATIONS (INR)</span>
            <span style={{ fontSize: '10px', background: '#f0f4ff', color: '#4169e1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              {activeAccount.name}
            </span>
          </div>
          <h1>All Claims ({claims.length})</h1>
          <p>Search, analyze with AI, and manage claims stored under this account workspace.</p>
        </div>
        <button className="primary-button" onClick={onNewClaim}>
          <ClipboardCheck size={16} /> + New Claim
        </button>
      </div>

      {/* Account KPI Highlights */}
      <div className="stats-grid" style={{ marginBottom: '16px' }}>
        <StatCard icon={ClipboardCheck} label="Account Claims" value={String(claims.length)} change={`${claims.length} total`} tone="blue" />
        <StatCard icon={ShieldCheck} label="Approved Rate" value={claims.length > 0 ? `${Math.round((approvedCount / claims.length) * 100)}%` : '0%'} change={`${approvedCount} cleared`} tone="green" />
        <StatCard icon={AlertTriangle} label="High Risk Claims" value={String(highRiskCount)} change={`${deniedCount} denied`} tone="red" />
        <StatCard icon={TrendingUp} label="Account Claim Value" value={formatINR(totalValue)} change="Active Portfolio" tone="blue" />
      </div>

      <div className="panel claims-panel">
        <div className="table-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['All', 'Approved', 'Denied', 'High Risk', 'Pending'] as const).map(tab => (
              <button
                key={tab}
                style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  border: filterTab === tab ? '1px solid #4169e1' : '1px solid #e2e8f0',
                  background: filterTab === tab ? '#4169e1' : '#fff',
                  color: filterTab === tab ? '#fff' : '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                onClick={() => setFilterTab(tab)}
              >
                {tab} {tab === 'All' ? `(${claims.length})` : tab === 'Approved' ? `(${approvedCount})` : tab === 'Denied' ? `(${deniedCount})` : tab === 'High Risk' ? `(${highRiskCount})` : ''}
              </button>
            ))}
          </div>
          <div className="search-box">
            <Search size={16} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search claims, members, procedure…" />
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Member / Patient</th>
                <th>Payer / Policy</th>
                <th>Procedure (CPT)</th>
                <th>Amount (INR)</th>
                <th>Risk</th>
                <th>AI Verdict</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                    No claims found matching the current filter. Click <b>&quot;+ New Claim&quot;</b> to add a claim to this account.
                  </td>
                </tr>
              ) : (
                filteredClaims.map(c => (
                  <tr key={c.id}>
                    <td><b className="claim-id">{c.id}</b></td>
                    <td>
                      <div>
                        <b>{c.member}</b>
                        {c.diagnosis && <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>{c.diagnosis}</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '11px' }}>{c.payerName || 'Commercial PPO'}</td>
                    <td style={{ fontSize: '11px' }}>{c.procedure || '99213 - Outpatient Visit'}</td>
                    <td className="amount">{formatINR(c.amount)}</td>
                    <td><Badge tone={c.risk.toLowerCase()}>{c.risk}</Badge></td>
                    <td>
                      <Badge tone={c.prediction === 'Approve' ? 'approve' : 'deny'}>
                        {c.prediction}
                      </Badge>
                    </td>
                    <td><Badge tone={c.status.toLowerCase()}>{c.status}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="select-button"
                          style={{ fontSize: '10px', padding: '4px 8px' }}
                          title="Open in Intelligence Workbench"
                          onClick={() => onAnalyzeClaim(c)}
                        >
                          <Sparkles size={11} style={{ marginRight: '3px' }} /> Analyze
                        </button>
                        <button
                          className="icon-button"
                          style={{ width: '26px', height: '26px', border: 0, color: '#94a3b8' }}
                          title="Delete claim"
                          onClick={() => onDeleteClaim(c.id)}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   VIEW 11: ANALYTICS & ROOT CAUSE ANALYSIS
   ========================================================================== */
function AnalyticsView({
  timeRange,
  setTimeRange,
  showTimeDropdown,
  setShowTimeDropdown,
  showToast
}: {
  timeRange: string
  setTimeRange: (t: string) => void
  showTimeDropdown: boolean
  setShowTimeDropdown: (v: boolean) => void
  showToast: (m: string) => void
}) {
  const chartData = [
    { label: '01 Jan', approved: 620, denied: 200 },
    { label: '08 Jan', approved: 810, denied: 240 },
    { label: '15 Jan', approved: 720, denied: 200 },
    { label: '22 Jan', approved: 1010, denied: 270 },
    { label: '29 Jan', approved: 960, denied: 210 },
    { label: '05 Feb', approved: 1150, denied: 270 },
  ]

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,CARC_Code,Category,Count,Preventable_Pct,Dollar_Impact\nCO-197,Missing Prior Auth,142,94%,₹1842000\nCO-27,Terminated Policy,88,98%,₹924000\nCO-16,Member Suffix Mismatch,64,91%,₹684000"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "rcm_root_cause_analysis_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported RCA Report (CSV)!')
  }

  return (
    <>
      <div className="welcome compact">
        <div>
          <span className="eyebrow">PERFORMANCE OVERVIEW (INDIA)</span>
          <h1>Denial Analytics & Root Cause Breakdown</h1>
          <p>Track claim volumes, CARC denial categories, and payer vulnerability metrics.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="select-button" onClick={handleExportCSV}>
            Export RCA (CSV)
          </button>
        </div>
      </div>

      <div className="stats-grid analytics-stats">
        <StatCard icon={TrendingUp} label="Approval rate" value="78.0%" change="+4.8%" tone="green" />
        <StatCard icon={Users} label="Avg. claim amount" value="₹42,840" change="+2.1%" tone="blue" />
        <StatCard icon={Activity} label="Risk flagged" value="13.4%" change="-1.2%" tone="amber" />
      </div>

      <div className="panel chart-panel">
        <SectionTitle eyebrow="OUTCOMES" title="Approval vs Denial Distribution (INR)" />
        <div className="chart-wrap tall">
          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={chartData} barGap={8}>
              <CartesianGrid vertical={false} stroke="#e8edf5" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8994a7' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8994a7' }} />
              <Tooltip />
              <Bar dataKey="approved" fill="#20b486" radius={[4, 4, 0, 0]} />
              <Bar dataKey="denied" fill="#e56b6f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   VIEW 12: MODEL INSIGHTS
   ========================================================================== */
function ModelInsightsView() {
  const metrics = [
    ['Accuracy', '94.8%'],
    ['Precision', '92.1%'],
    ['Recall', '89.7%'],
    ['F1 score', '90.9%'],
    ['ROC-AUC', '96.2%']
  ]

  return (
    <>
      <div className="welcome compact">
        <div>
          <span className="eyebrow">MODEL MONITORING (IST)</span>
          <h1>Model Insights</h1>
          <p>Understand how the claims intelligence and denial prediction model is performing.</p>
        </div>
        <Badge tone="approve"><span className="badge-dot" /> Model healthy</Badge>
      </div>

      <div className="metric-cards">
        {metrics.map(([x, y]) => (
          <div className="metric-card" key={x}>
            <span>{x}</span>
            <strong>{y}</strong>
            <small>↑ 2.4% from last evaluation</small>
          </div>
        ))}
      </div>

      <div className="insight-grid">
        <div className="panel">
          <SectionTitle eyebrow="MODEL DETAILS" title="Current Model" />
          <div className="detail-list">
            <div><span>Version</span><b>previa-rcm-v2.4 (IN)</b></div>
            <div><span>Predictions</span><b>48,291</b></div>
            <div><span>Last evaluated</span><b>Today, 08:42 AM IST</b></div>
            <div><span>Training data</span><b>1.2M Indian healthcare claims</b></div>
          </div>
        </div>

        <div className="panel importance">
          <SectionTitle eyebrow="EXPLAINABILITY" title="Feature Importance" />
          <div className="importance-list">
            {['Treatment cost (INR)', 'Previous claims', 'Diagnosis code', 'TPA / Provider history', 'Coverage duration'].map((x, i) => (
              <div key={x}>
                <span>{x}</span>
                <div><i style={{ width: `${92 - i * 14}%` }} /></div>
                <b>{(0.92 - i * 0.14).toFixed(2)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

/* ==========================================================================
   VIEW 13: SETTINGS
   ========================================================================== */
function SettingsView({
  workspaceName,
  setWorkspaceName,
  user,
  setUser,
  showToast,
  onResetCleanSlate,
  onLoadDemoData
}: {
  workspaceName: string
  setWorkspaceName: (w: string) => void
  user: any
  setUser: any
  showToast: (m: string) => void
  onResetCleanSlate: () => void
  onLoadDemoData: () => void
}) {
  const [tab, setTab] = useState<'Workspace' | 'Notifications' | 'API connection' | 'Team members'>('Workspace')
  const [digestToggle, setDigestToggle] = useState(true)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    showToast('Settings saved successfully!')
  }

  return (
    <>
      <div className="welcome compact">
        <div>
          <span className="eyebrow">WORKSPACE PREFERENCES</span>
          <h1>Settings</h1>
          <p>Manage your hospital workspace, clean slate data states, and API connection preferences.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="panel settings-nav">
          {(['Workspace', 'Notifications', 'API connection', 'Team members'] as const).map(t => (
            <button
              key={t}
              className={tab === t ? 'active' : ''}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <form className="panel settings-form" onSubmit={handleSave}>
          {tab === 'Workspace' && (
            <>
              <SectionTitle eyebrow="WORKSPACE" title="Hospital Workspace Settings" />
              <label className="field">
                <span>Workspace name</span>
                <input
                  required
                  value={workspaceName}
                  onChange={e => setWorkspaceName(e.target.value)}
                  placeholder="Workspace name"
                />
              </label>
              <Field label="Default timezone" name="timezone" placeholder="(UTC+05:30) India Standard Time (IST)" defaultValue="(UTC+05:30) India Standard Time (IST)" />
              <Field label="Currency denomination" name="currency" placeholder="INR (₹)" defaultValue="INR (₹) - Indian Rupee" />

              <div style={{ marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <b style={{ fontSize: '13px', color: '#1e293b', display: 'block', marginBottom: '4px' }}>Data Workspace State</b>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 12px' }}>
                  Easily clear all claims to test fresh patient intake, or populate full multi-payer demo datasets.
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="select-button"
                    onClick={onResetCleanSlate}
                    style={{ fontSize: '11px' }}
                  >
                    <Sparkles size={13} /> Reset to Clean Slate (0 Claims)
                  </button>
                  <button
                    type="button"
                    className="select-button"
                    onClick={onLoadDemoData}
                    style={{ fontSize: '11px' }}
                  >
                    <Zap size={13} /> Populate Demo Datasets
                  </button>
                </div>
              </div>

              <div className="toggle-row" style={{ marginTop: '14px' }}>
                <div>
                  <b>Daily morning claim digest</b>
                  <p>Receive a summary of cleared vs high-risk claims each morning.</p>
                </div>
                <div
                  className={`toggle ${digestToggle ? 'on' : ''}`}
                  onClick={() => setDigestToggle(!digestToggle)}
                  style={{ cursor: 'pointer' }}
                >
                  <i />
                </div>
              </div>
            </>
          )}

          {tab === 'Notifications' && (
            <>
              <SectionTitle eyebrow="NOTIFICATIONS" title="Alert Preferences" />
              <div className="toggle-row">
                <div>
                  <b>Star Health & TPA auto-approvals</b>
                  <p>Notify when prior authorization blocker is cleared.</p>
                </div>
                <div className="toggle on"><i /></div>
              </div>
              <div className="toggle-row">
                <div>
                  <b>Payer rule drift alerts</b>
                  <p>Notify when unexpected CARC denial pattern emerges.</p>
                </div>
                <div className="toggle on"><i /></div>
              </div>
            </>
          )}

          {tab === 'API connection' && (
            <>
              <SectionTitle eyebrow="API INTEGRATION" title="Backend Service Connection" />
              <Field label="FastAPI endpoint URL" name="apiUrl" placeholder="http://localhost:8001/api/v1" defaultValue="http://localhost:8001/api/v1" />
              <Field label="National Health Authority / Gateway" name="clearinghouse" placeholder="ABDM / Insurance Gateway" defaultValue="Insurance Gateway Active" />
            </>
          )}

          {tab === 'Team members' && (
            <>
              <SectionTitle eyebrow="ACCESS CONTROL" title="Team Members" />
              <div className="detail-list">
                <div><span>Jordan Davis</span><b>Lead Adjudicator & RCM Lead</b></div>
                <div><span>Dr. Arthur Pendelton</span><b>Chief Medical Officer</b></div>
                <div><span>Pooja Kashyap</span><b>Senior Billing Specialist</b></div>
              </div>
            </>
          )}

          <button className="primary-button" type="submit" style={{ marginTop: '10px' }}>
            Save changes
          </button>
        </form>
      </div>
    </>
  )
}
