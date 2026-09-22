import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Smartphone, 
  Building, 
  QrCode, 
  Plus, 
  Download,
  ShieldCheck,
  Printer
} from 'lucide-react';
import { PaymentRecord, PaymentChannel } from '../types';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  onAddPayment: (payment: PaymentRecord) => void;
  onNotify: (msg: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  onAddPayment,
  onNotify,
}) => {
  const [amount, setAmount] = useState<number>(50000);
  const [description, setDescription] = useState('Laboratory & Fieldwork Guild Fee');
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('M-Pesa');
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);

  const channels: { id: PaymentChannel; label: string; desc: string }[] = [
    { id: 'M-Pesa', label: 'Vodacom M-Pesa', desc: 'USSD *150*00# Pay Bill' },
    { id: 'Mixx by Yas', label: 'Mixx by Yas (Tigo)', desc: 'USSD *150*01# Government' },
    { id: 'Airtel Money', label: 'Airtel Money', desc: 'USSD *150*60# Payments' },
    { id: 'HaloPesa', label: 'Halotel HaloPesa', desc: 'USSD *150*88#' },
    { id: 'AzamPesa', label: 'AzamPesa Mobile', desc: 'Direct App & QR checkout' },
    { id: 'Bank', label: 'Bank / CRDB / NMB', desc: 'Internet Banking & Branch' },
    { id: 'Card', label: 'Visa / Mastercard', desc: 'International debit/credit' },
    { id: 'QR', label: 'Tanzania Instant QR (TIPS)', desc: 'Interoperable National QR' },
  ];

  const handleGenerateControlNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const controlNum = '99' + Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const newRecord: PaymentRecord = {
      id: 'pay_' + Date.now(),
      controlNumber: controlNum,
      amount,
      currency: 'TZS',
      channel: selectedChannel,
      status: 'verified',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      description,
      studentId: '2024-04-01923',
      receiptNumber: 'TZ-UDSM-' + Math.floor(100000 + Math.random() * 900000),
    };

    onAddPayment(newRecord);
    setActiveReceipt(newRecord);
    onNotify(`Payment verified for ${newRecord.description} (TZS ${amount.toLocaleString()}) via ${selectedChannel}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#d9e3ea] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
            Government GePG & University Billing
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#102d4f] mt-1">
            Tuition, Hostel & Guild Payments
          </h1>
          <p className="text-xs text-slate-500">
            Real-time settlement verification with automated receipts and control numbers
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> GePG & TIPS Gateway Active
        </div>
      </div>

      {/* Main Grid: Payment Request Form + Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#d9e3ea] shadow-xs">
          <h2 className="text-base font-bold text-[#102d4f] mb-3">
            Generate Electronic Payment Request
          </h2>

          <form onSubmit={handleGenerateControlNumber} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fee Description</label>
                <select
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
                >
                  <option value="Tuition Fee - Semester 1 (2026/27)">Tuition Fee - Semester 1 (2026/27)</option>
                  <option value="Hostel Accommodation Fee - Hall 5">Hostel Accommodation Fee - Hall 5</option>
                  <option value="Laboratory & Fieldwork Guild Fee">Laboratory & Fieldwork Guild Fee</option>
                  <option value="Examination & Graduation Registration">Examination & Graduation Registration</option>
                  <option value="Student Union Annual Membership (DARUSO)">Student Union Membership (DARUSO)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Amount (TZS)</label>
                <input
                  type="number"
                  step="1000"
                  min="5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e6fa8]"
                />
              </div>
            </div>

            {/* Channels selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose Settlement Channel
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {channels.map((ch) => {
                  const isSelected = selectedChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedChannel(ch.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-[#1e6fa8] bg-sky-50/60 ring-2 ring-sky-200'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="block text-xs font-bold text-[#102d4f] truncate">{ch.label}</span>
                      <span className="block text-[10px] text-slate-500 mt-0.5 truncate">{ch.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
              <div className="text-xs text-slate-500">
                Authorized for <strong className="text-slate-800">University of Dar es Salaam</strong>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#e6ad3d] hover:bg-[#f3b844] text-[#102d4f] text-xs sm:text-sm font-extrabold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" /> Generate Control Number & Verify
              </button>
            </div>
          </form>
        </div>

        {/* Live Active Receipt Card */}
        <div className="bg-[#f8fafc] rounded-2xl p-4 sm:p-5 border border-[#d9e3ea] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <span className="text-xs font-extrabold text-[#102d4f] uppercase tracking-wider">
                GePG Official Receipt
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Verified
              </span>
            </div>

            {activeReceipt || payments[0] ? (
              (() => {
                const rec = activeReceipt || payments[0];
                return (
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Control Number</span>
                      <span className="text-sm sm:text-base font-black text-[#102d4f] font-mono tracking-wider break-all">
                        {rec.controlNumber}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/60 gap-2">
                      <span className="text-slate-500 shrink-0">Item:</span>
                      <span className="font-semibold text-slate-800 text-right text-xs truncate">{rec.description}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Paid Amount:</span>
                      <span className="font-extrabold text-[#16845d]">TZS {rec.amount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Channel:</span>
                      <span className="font-semibold text-slate-800">{rec.channel}</span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Receipt Ref:</span>
                      <span className="font-mono text-slate-800">{rec.receiptNumber}</span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Timestamp:</span>
                      <span className="text-[11px] text-slate-600">{rec.timestamp}</span>
                    </div>
                  </div>
                );
              })()
            ) : null}
          </div>

          <button
            onClick={() => onNotify('Digital receipt printed and downloaded as PDF.')}
            className="mt-4 w-full py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors touch-target"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF Receipt
          </button>
        </div>
      </div>

      {/* Historical Payment Ledger */}
      <div className="bg-white rounded-2xl border border-[#d9e3ea] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-[#102d4f]">Verified Payment History</h2>
          <span className="text-xs text-slate-500 font-medium">{payments.length} transactions recorded</span>
        </div>

        {/* Mobile View: Compact Payment Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {payments.map((p) => (
            <div key={p.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-[#102d4f]">{p.controlNumber}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                </span>
              </div>
              <div className="text-xs font-medium text-slate-800">{p.description}</div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-extrabold text-[#16845d]">TZS {p.amount.toLocaleString()}</span>
                <span className="text-[11px] text-slate-500">{p.channel} • {p.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Full Data Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#eef6fb] text-[#102d4f] border-b border-slate-200">
                <th className="py-3 px-4 font-bold">Control Number</th>
                <th className="py-3 px-4 font-bold">Description</th>
                <th className="py-3 px-4 font-bold">Channel</th>
                <th className="py-3 px-4 font-bold">Amount (TZS)</th>
                <th className="py-3 px-4 font-bold">Date & Time</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#102d4f] whitespace-nowrap">
                    {p.controlNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {p.description}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap font-semibold text-slate-600">
                    {p.channel}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-[#16845d] whitespace-nowrap">
                    TZS {p.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-xs">
                    {p.timestamp}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
