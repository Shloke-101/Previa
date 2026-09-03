'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { ClearanceBadge } from '../../components/common/ClearanceBadge';
import { PreviaAPI } from '../../services/api';
import { Patient, ClearanceStatus } from '../../types';
import { Search, Filter, ArrowRight, User } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClearanceStatus>('ALL');
  const [loading, setLoading] = useState(true);

  // Helper mapping patient -> appointment/insurance/clearance mock lookup
  const [dossierMap, setDossierMap] = useState<Record<string, any>>({});

  useEffect(() => {
    async function loadPatients() {
      setLoading(true);
      try {
        const list = await PreviaAPI.getPatients(search);
        setPatients(list);

        // Load details for each patient
        const detailsMap: Record<string, any> = {};
        for (const p of list) {
          const detail = await PreviaAPI.getPatientById(p.patient_id);
          const clearance = await PreviaAPI.getClearanceEvaluation(p.patient_id, detail?.appointment?.appointment_id || 'apt-001');
          detailsMap[p.patient_id] = { ...detail, clearance };
        }
        setDossierMap(detailsMap);
      } catch (err) {
        console.error('Failed to load patients', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, [search]);

  const filteredPatients = patients.filter(p => {
    if (statusFilter === 'ALL') return true;
    const status = dossierMap[p.patient_id]?.clearance?.clearance_status;
    return status === statusFilter;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Patient Intake & Clearance Registry"
        subtitle="Searchable directory of patients scheduled for upcoming financial verification"
        onSearch={setSearch}
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase">Clearance Filter:</span>
            <div className="flex gap-1.5">
              {(['ALL', 'CLEARED', 'NEEDS_ACTION', 'HIGH_RISK'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st === 'ALL' ? 'All Patients' : st}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID, or insurance..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        {/* Patient Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">DOB</th>
                  <th className="px-6 py-4">Patient ID / MRN</th>
                  <th className="px-6 py-4">Insurance Provider</th>
                  <th className="px-6 py-4">Upcoming Appointment</th>
                  <th className="px-6 py-4 text-center">Risk Level</th>
                  <th className="px-6 py-4 text-center">Clearance Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      Loading patient records...
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      No matching patient records found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map(p => {
                    const dossier = dossierMap[p.patient_id];
                    const clearance = dossier?.clearance;
                    const appointment = dossier?.appointment;
                    const insurance = dossier?.insurance;

                    return (
                      <tr key={p.patient_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <Link href={`/patients/${p.patient_id}`} className="hover:underline text-brand-700 font-extrabold flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                            {p.first_name} {p.last_name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono">
                          {p.date_of_birth}
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-500 font-semibold">
                          {p.mrn}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800 block">{insurance?.payer_name || 'Unassigned'}</span>
                          <span className="text-[11px] text-slate-400 font-mono block">{insurance?.member_id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800 block">{appointment?.procedure_description || 'Routine Checkup'}</span>
                          <span className="text-[11px] text-slate-400 block">{appointment?.appointment_time ? new Date(appointment.appointment_time).toLocaleDateString() : 'Pending'}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold">
                          <span className={`px-2 py-1 rounded-md text-xs ${
                            clearance?.risk_level === 'HIGH' ? 'bg-rose-100 text-rose-800' : clearance?.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {clearance?.risk_level || 'LOW'} ({clearance?.risk_score || 0})
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <ClearanceBadge status={clearance?.clearance_status} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/patients/${p.patient_id}`}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-1"
                          >
                            Details <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
