'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { ClearanceBadge } from '../../components/common/ClearanceBadge';
import { PreviaAPI } from '../../services/api';
import { Appointment, Patient } from '../../types';
import { Calendar, Clock, MapPin, ArrowRight, User } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Record<string, Patient>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const apptList = await PreviaAPI.getAppointments();
        setAppointments(apptList);

        const patientList = await PreviaAPI.getPatients();
        const pMap: Record<string, Patient> = {};
        patientList.forEach(p => { pMap[p.patient_id] = p; });
        setPatients(pMap);
      } catch (err) {
        console.error('Failed to load appointments', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <Header
        title="Upcoming Scheduled Appointments"
        subtitle="Pre-visit appointment roster with procedural clearance readiness"
      />

      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">Encounters Schedule</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              {appointments.length} Total Appointments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Procedure & Code</th>
                  <th className="px-6 py-4">Department & Provider</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 text-center">Clearance Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      Loading scheduled encounters...
                    </td>
                  </tr>
                ) : (
                  appointments.map(appt => {
                    const patient = patients[appt.patient_id];
                    return (
                      <tr key={appt.appointment_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {patient ? (
                            <Link href={`/patients/${patient.patient_id}`} className="hover:underline text-brand-700 font-extrabold block">
                              {patient.first_name} {patient.last_name}
                            </Link>
                          ) : (
                            <span>{appt.patient_id}</span>
                          )}
                          <span className="text-[11px] text-slate-400 font-normal font-mono block">{patient?.mrn}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">{appt.procedure_description}</span>
                          <span className="text-[11px] text-brand-700 font-mono font-bold block">CPT {appt.procedure_code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800 block">{appt.provider_name}</span>
                          <span className="text-[11px] text-slate-400 block">{appt.department}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          <span className="flex items-center gap-1 font-semibold text-slate-900">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(appt.appointment_time).toLocaleDateString()}
                          </span>
                          <span className="text-[11px] text-slate-400 block">{new Date(appt.appointment_time).toLocaleTimeString()}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {appt.location}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <ClearanceBadge status={appt.clearance_status} size="sm" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/patients/${appt.patient_id}`}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors inline-flex items-center gap-1"
                          >
                            Dossier <ArrowRight className="w-3.5 h-3.5" />
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
