import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Scan, ShieldCheck } from 'lucide-react';
import { PreviaAPI } from '../../services/api';
import { OcrExtractionResult, ValidationResult } from '../../types';

interface InsuranceCardOcrProps {
  patientId: string;
  onComplete?: (result: ValidationResult) => void;
}

export const InsuranceCardOcr: React.FC<InsuranceCardOcrProps> = ({ patientId, onComplete }) => {
  const [step, setStep] = useState<'IDLE' | 'UPLOADING' | 'OCR_PROCESSING' | 'EXTRACTED' | 'VERIFIED'>('IDLE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrExtractionResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const processCard = async () => {
    setStep('OCR_PROCESSING');
    try {
      // Step 1: OCR Extraction
      const ocr = await PreviaAPI.uploadInsuranceCardOcr(patientId, selectedFile || new Blob());
      setOcrResult(ocr);
      setStep('EXTRACTED');

      // Step 2: EHR Validation
      const val = await PreviaAPI.validateInsuranceCard(patientId, ocr.extracted_data);
      setValidationResult(val);
      setStep('VERIFIED');
      if (onComplete) onComplete(val);
    } catch {
      setStep('IDLE');
    }
  };

  const reset = () => {
    setStep('IDLE');
    setSelectedFile(null);
    setPreviewUrl(null);
    setOcrResult(null);
    setValidationResult(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-brand-600" />
          <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">
            Insurance Card OCR & Intake Scanner
          </h3>
        </div>
        <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-100">
          Automated Extraction
        </span>
      </div>

      {/* Visual Workflow Steps */}
      <div className="grid grid-cols-5 gap-2 mb-6 text-center text-xs font-semibold">
        <div className={`p-2 rounded-lg border ${step === 'IDLE' ? 'bg-brand-50 text-brand-700 border-brand-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
          1. UPLOAD
        </div>
        <div className={`p-2 rounded-lg border ${step === 'OCR_PROCESSING' ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
          2. OCR PROCESSING
        </div>
        <div className={`p-2 rounded-lg border ${step === 'EXTRACTED' ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
          3. DATA EXTRACTED
        </div>
        <div className={`p-2 rounded-lg border ${step === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
          4. VALIDATION
        </div>
        <div className={`p-2 rounded-lg border ${step === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-extrabold' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
          5. VERIFIED
        </div>
      </div>

      {/* Main Upload / Preview Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Drop Zone / Image View */}
        <div className="flex flex-col items-center justify-center">
          {!previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="w-full h-60 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer"
            >
              <Upload className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-sm font-semibold text-slate-700">Drag & drop insurance card image here</p>
              <p className="text-xs text-slate-400 mt-1">Supports PNG, JPG, JPEG or PDF (Front/Back)</p>
              <label className="mt-4 px-4 py-2 bg-brand-600 text-white font-medium text-xs rounded-xl hover:bg-brand-700 cursor-pointer transition-colors shadow-sm">
                Browse File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </label>
            </div>
          ) : (
            <div className="relative w-full h-60 border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center group">
              <img src={previewUrl} alt="Insurance Card Preview" className="max-h-full max-w-full object-contain" />
              {step === 'OCR_PROCESSING' && (
                <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mb-2" />
                  <span className="text-xs font-bold tracking-wider">RUNNING OPTICAL CHARACTER RECOGNITION...</span>
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={reset}
                  className="p-1.5 bg-slate-800/80 text-white rounded-lg hover:bg-slate-800 text-xs font-medium backdrop-blur-sm"
                >
                  Change Card
                </button>
              </div>
            </div>
          )}

          {previewUrl && step === 'IDLE' && (
            <button
              onClick={processCard}
              className="mt-4 w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Scan className="w-4 h-4" />
              Start OCR Extraction & Validation
            </button>
          )}
        </div>

        {/* Extracted Fields & Validation Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase">Extracted Card Fields</span>
              {ocrResult && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  OCR Confidence: {(ocrResult.ocr_confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {!ocrResult ? (
              <div className="h-44 flex flex-col items-center justify-center text-slate-400 text-xs text-center">
                <FileText className="w-8 h-8 mb-2 opacity-50" />
                Upload a card scan to inspect extracted member ID, payer, and policy number.
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {validationResult?.field_validations.map((field, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-800 block">{field.field_name}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{field.ocr_value}</span>
                    </div>
                    {field.status === 'MATCH' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> MATCH
                      </span>
                    ) : field.status === 'PARTIAL_MATCH' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        PARTIAL MATCH
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        <AlertCircle className="w-3 h-3 text-rose-600" /> MISMATCH
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {step === 'VERIFIED' && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Demographic & Insurance Card Fields Validated against Hospital EHR System</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
