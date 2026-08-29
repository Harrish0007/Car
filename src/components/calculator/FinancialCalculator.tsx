import React, { useState, useMemo } from 'react';
import { VehicleModel, VehicleConfiguration, PaymentMethod } from '../../types/vehicle';
import { vehicleAudio } from '../../utils/audioSynth';
import confetti from 'canvas-confetti';
import {
  DollarSign,
  Percent,
  Calendar,
  ShieldCheck,
  TrendingDown,
  FileText,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Calculator,
  Layers,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface FinancialCalculatorProps {
  model: VehicleModel;
  config: VehicleConfiguration;
  totalPrice: number;
  onClose?: () => void;
  onBookTestDrive?: () => void;
}

export const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({
  model,
  config,
  totalPrice,
  onClose,
  onBookTestDrive,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('finance');
  const [downPayment, setDownPayment] = useState<number>(Math.round(totalPrice * 0.15));
  const [tradeInValue, setTradeInValue] = useState<number>(0);
  const [loanTerm, setLoanTerm] = useState<number>(60);
  const [creditTier, setCreditTier] = useState<'tier1' | 'tier2' | 'tier3' | 'custom'>('tier1');
  const [customApr, setCustomApr] = useState<number>(4.49);
  const [salesTaxRate, setSalesTaxRate] = useState<number>(7.25);
  const [leaseTerm, setLeaseTerm] = useState<number>(36);
  const [leaseMileage, setLeaseMileage] = useState<number>(10000);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [showPreApprovalModal, setShowPreApprovalModal] = useState<boolean>(false);
  const [preApprovalStatus, setPreApprovalStatus] = useState<boolean>(false);

  // Pre-approval form state
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantIncome, setApplicantIncome] = useState('180000');

  // APR determination based on Tier
  const effectiveApr = useMemo(() => {
    switch (creditTier) {
      case 'tier1':
        return 3.99;
      case 'tier2':
        return 5.25;
      case 'tier3':
        return 6.99;
      case 'custom':
      default:
        return customApr;
    }
  }, [creditTier, customApr]);

  const destinationFee = 1495;
  const docFee = 495;

  // ----------------------------------------------------
  // FINANCE COMPUTATION
  // ----------------------------------------------------
  const financeOutputs = useMemo(() => {
    const taxableAmount = Math.max(0, totalPrice - tradeInValue);
    const taxAmount = (taxableAmount * salesTaxRate) / 100;
    const totalOutTheDoor = totalPrice + taxAmount + destinationFee + docFee;
    const netFinanced = Math.max(0, totalOutTheDoor - downPayment - tradeInValue);

    const monthlyInterestRate = effectiveApr / 100 / 12;
    let monthlyPayment = 0;
    let totalInterest = 0;

    if (monthlyInterestRate > 0 && loanTerm > 0) {
      monthlyPayment =
        (netFinanced *
          (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTerm))) /
        (Math.pow(1 + monthlyInterestRate, loanTerm) - 1);
      totalInterest = monthlyPayment * loanTerm - netFinanced;
    } else {
      monthlyPayment = netFinanced / loanTerm;
      totalInterest = 0;
    }

    return {
      taxAmount,
      totalOutTheDoor,
      netFinanced,
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(totalOutTheDoor + totalInterest),
    };
  }, [totalPrice, tradeInValue, salesTaxRate, destinationFee, docFee, downPayment, effectiveApr, loanTerm]);

  // ----------------------------------------------------
  // LEASE COMPUTATION
  // ----------------------------------------------------
  const leaseOutputs = useMemo(() => {
    // Residual percent varies by model, term, and mileage
    let baseResidual = 0.58; // 36 mo 10k
    if (leaseTerm === 24) baseResidual = 0.65;
    if (leaseTerm === 48) baseResidual = 0.51;
    if (leaseMileage === 7500) baseResidual += 0.02;
    if (leaseMileage === 12000) baseResidual -= 0.02;
    if (leaseMileage === 15000) baseResidual -= 0.04;

    const residualValue = totalPrice * baseResidual;
    const grossCapCost = totalPrice + destinationFee + docFee;
    const capCostReduction = downPayment + tradeInValue;
    const adjustedCapCost = Math.max(0, grossCapCost - capCostReduction);

    const monthlyDepreciation = (adjustedCapCost - residualValue) / leaseTerm;
    const moneyFactor = effectiveApr / 2400; // standard approximation
    const monthlyRentCharge = (adjustedCapCost + residualValue) * moneyFactor;
    const baseMonthlyPayment = Math.max(0, monthlyDepreciation + monthlyRentCharge);
    const monthlyTax = (baseMonthlyPayment * salesTaxRate) / 100;
    const totalMonthlyLease = baseMonthlyPayment + monthlyTax;

    const dueAtSigning = downPayment + totalMonthlyLease + docFee;

    return {
      residualValue: Math.round(residualValue),
      residualPercent: Math.round(baseResidual * 100),
      adjustedCapCost: Math.round(adjustedCapCost),
      monthlyDepreciation: Math.round(monthlyDepreciation),
      monthlyRentCharge: Math.round(monthlyRentCharge),
      totalMonthlyLease: Math.round(totalMonthlyLease),
      dueAtSigning: Math.round(dueAtSigning),
      totalLeaseCost: Math.round(totalMonthlyLease * leaseTerm + dueAtSigning),
    };
  }, [totalPrice, destinationFee, docFee, downPayment, tradeInValue, leaseTerm, leaseMileage, effectiveApr, salesTaxRate]);

  // ----------------------------------------------------
  // AMORTIZATION SCHEDULE
  // ----------------------------------------------------
  const amortizationSchedule = useMemo(() => {
    const schedule = [];
    let balance = financeOutputs.netFinanced;
    const monthlyInterestRate = effectiveApr / 100 / 12;

    for (let month = 1; month <= loanTerm; month++) {
      const interestForMonth = balance * monthlyInterestRate;
      const principalForMonth = financeOutputs.monthlyPayment - interestForMonth;
      balance = Math.max(0, balance - principalForMonth);

      if (month <= 12 || month % 12 === 0 || month === loanTerm) {
        schedule.push({
          month,
          payment: financeOutputs.monthlyPayment,
          principal: Math.round(principalForMonth),
          interest: Math.round(interestForMonth),
          balance: Math.round(balance),
        });
      }
    }
    return schedule;
  }, [financeOutputs, effectiveApr, loanTerm]);

  // Pre-approval handler
  const handlePreApprovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    vehicleAudio.playSelectBeep();
    setPreApprovalStatus(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div
      id="financial-calculator-container"
      className="bg-[#0F0F0F] border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-neutral-100"
    >
      {/* 1. Header Banner */}
      <div className="p-5 bg-[#0A0A0A] border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-400">
            <Calculator className="w-4 h-4" />
            <span>Aether Financial Services</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <span>Payment & Lease Estimator</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-300 font-mono font-normal">
              {model.name}
            </span>
          </h2>
        </div>

        {/* Payment Method Switcher */}
        <div className="flex items-center bg-[#121212] p-1 rounded-xl border border-white/10">
          {(
            [
              { id: 'finance', label: 'Finance (Loan)' },
              { id: 'lease', label: 'Bespoke Lease' },
              { id: 'cash', label: 'Cash Outright' },
            ] as const
          ).map(pm => (
            <button
              key={pm.id}
              id={`tab-payment-${pm.id}`}
              onClick={() => {
                vehicleAudio.playSelectBeep();
                setPaymentMethod(pm.id);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                paymentMethod === pm.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {pm.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* 2. Left Column: Input Sliders & Options */}
        <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-white/10 space-y-6">
          {/* Vehicle Price Summary */}
          <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-400 font-mono uppercase">Configured Vehicle MSRP</div>
              <div className="text-xl font-bold font-mono text-white">${totalPrice.toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-neutral-400 font-mono uppercase">Dest. & Prep Fee</div>
              <div className="text-sm font-mono text-neutral-300">${(destinationFee + docFee).toLocaleString()}</div>
            </div>
          </div>

          {/* Down Payment Slider */}
          {paymentMethod !== 'cash' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Down Payment / Capital Reduction
                </label>
                <div className="text-sm font-mono font-bold text-blue-400">
                  ${downPayment.toLocaleString()} ({Math.round((downPayment / totalPrice) * 100)}%)
                </div>
              </div>
              <input
                id="slider-down-payment"
                type="range"
                min="0"
                max={Math.round(totalPrice * 0.5)}
                step="1000"
                value={downPayment}
                onChange={e => setDownPayment(Number(e.target.value))}
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[11px] font-mono text-neutral-500 mt-1">
                <span>$0</span>
                <span>$25,000</span>
                <span>${Math.round(totalPrice * 0.5).toLocaleString()} (50%)</span>
              </div>
            </div>
          )}

          {/* Trade-in Value Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                Estimated Trade-in Allowance
              </label>
              <div className="text-sm font-mono font-bold text-emerald-400">
                ${tradeInValue.toLocaleString()}
              </div>
            </div>
            <input
              id="slider-trade-in"
              type="range"
              min="0"
              max="60000"
              step="1000"
              value={tradeInValue}
              onChange={e => setTradeInValue(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-neutral-500 mt-1">
              <span>$0</span>
              <span>$30,000</span>
              <span>$60,000</span>
            </div>
          </div>

          {/* FINANCE SPECIFIC: Loan Term & Credit Tier */}
          {paymentMethod === 'finance' && (
            <>
              {/* Term Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                  Financing Term Length
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[36, 48, 60, 72, 84].map(months => (
                    <button
                      key={months}
                      id={`term-${months}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        setLoanTerm(months);
                      }}
                      className={`py-2.5 text-center rounded-xl text-xs font-bold border transition-all ${
                        loanTerm === months
                          ? 'border-blue-500 bg-blue-500/15 text-blue-300 ring-1 ring-blue-500'
                          : 'border-white/10 bg-[#0A0A0A] text-neutral-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div>{months} Mo</div>
                      <div className="text-[10px] font-normal opacity-70 font-mono">
                        {(months / 12).toFixed(0)} yrs
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Credit Tier & APR */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                    Credit Rating & APR Rate
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-400">{effectiveApr}% APR</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'tier1', label: 'Tier 1 (750+)', rate: '3.99%' },
                    { id: 'tier2', label: 'Tier 2 (700-749)', rate: '5.25%' },
                    { id: 'tier3', label: 'Tier 3 (640-699)', rate: '6.99%' },
                    { id: 'custom', label: 'Custom', rate: `${customApr}%` },
                  ].map(tier => (
                    <button
                      key={tier.id}
                      id={`credit-${tier.id}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        setCreditTier(tier.id as any);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        creditTier === tier.id
                          ? 'border-blue-500 bg-blue-500/15 text-blue-300 ring-1 ring-blue-500'
                          : 'border-white/10 bg-[#0A0A0A] text-neutral-400 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <div className="text-[11px] font-bold truncate">{tier.label}</div>
                      <div className="text-[10px] font-mono text-neutral-400">{tier.rate}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* LEASE SPECIFIC: Lease Term & Annual Mileage */}
          {paymentMethod === 'lease' && (
            <>
              {/* Lease Term */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                  Lease Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[24, 36, 48].map(term => (
                    <button
                      key={term}
                      id={`lease-term-${term}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        setLeaseTerm(term);
                      }}
                      className={`py-2.5 text-center rounded-xl text-xs font-bold border transition-all ${
                        leaseTerm === term
                          ? 'border-blue-500 bg-blue-500/15 text-blue-300 ring-1 ring-blue-500'
                          : 'border-white/10 bg-[#0A0A0A] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div>{term} Months</div>
                      <div className="text-[10px] font-normal opacity-70 font-mono">
                        {(term / 12).toFixed(0)} Years
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Mileage */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                  Annual Mileage Allowance
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[7500, 10000, 12000, 15000].map(miles => (
                    <button
                      key={miles}
                      id={`mileage-${miles}`}
                      onClick={() => {
                        vehicleAudio.playSelectBeep();
                        setLeaseMileage(miles);
                      }}
                      className={`py-2 text-center rounded-xl text-xs font-bold border transition-all ${
                        leaseMileage === miles
                          ? 'border-blue-500 bg-blue-500/15 text-blue-300 ring-1 ring-blue-500'
                          : 'border-white/10 bg-[#0A0A0A] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <div>{(miles / 1000).toFixed(1)}k</div>
                      <div className="text-[10px] font-normal opacity-70">mi / yr</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Sales Tax Rate Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                Estimated State & Local Sales Tax
              </label>
              <span className="text-xs font-mono font-bold text-neutral-200">{salesTaxRate}%</span>
            </div>
            <input
              id="slider-sales-tax"
              type="range"
              min="0"
              max="12"
              step="0.25"
              value={salesTaxRate}
              onChange={e => setSalesTaxRate(Number(e.target.value))}
              className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[11px] font-mono text-neutral-500 mt-1">
              <span>0% (Tax-Free State)</span>
              <span>7.25% (CA avg)</span>
              <span>12.0%</span>
            </div>
          </div>
        </div>

        {/* 3. Right Column: Payment Display & Financial Breakdown */}
        <div className="lg:col-span-5 p-6 bg-[#0A0A0A]/40 flex flex-col justify-between space-y-6">
          {/* Main Payment Card */}
          <div className="p-5 bg-[#121212] rounded-2xl border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
                {paymentMethod === 'finance'
                  ? 'Estimated Monthly Financing'
                  : paymentMethod === 'lease'
                  ? 'Estimated Monthly Lease'
                  : 'Total Cash Outlay'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                Real-Time
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                $
                {paymentMethod === 'finance'
                  ? financeOutputs.monthlyPayment.toLocaleString()
                  : paymentMethod === 'lease'
                  ? leaseOutputs.totalMonthlyLease.toLocaleString()
                  : financeOutputs.totalOutTheDoor.toLocaleString()}
              </span>
              {paymentMethod !== 'cash' && (
                <span className="text-base font-medium text-neutral-400">/mo</span>
              )}
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {paymentMethod === 'finance'
                ? `Based on ${loanTerm} months at ${effectiveApr}% APR with $${downPayment.toLocaleString()} down payment.`
                : paymentMethod === 'lease'
                ? `Based on ${leaseTerm} months, ${leaseMileage.toLocaleString()} mi/yr with $${leaseOutputs.dueAtSigning.toLocaleString()} due at signing.`
                : 'Includes vehicle purchase price, destination fee, doc fee, and estimated sales tax.'}
            </p>

            {/* Visual Payment Split Bar for Financing */}
            {paymentMethod === 'finance' && (
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="text-[11px] font-mono text-neutral-400 flex justify-between">
                  <span>Financed Principal: ${financeOutputs.netFinanced.toLocaleString()}</span>
                  <span>Interest: ${financeOutputs.totalInterest.toLocaleString()}</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-500 h-full"
                    style={{
                      width: `${(financeOutputs.netFinanced / financeOutputs.totalCost) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-red-500 h-full"
                    style={{
                      width: `${(financeOutputs.totalInterest / financeOutputs.totalCost) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Itemized Financial Breakdown Table */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
              <span>Vehicle Base + Bespoke Options</span>
              <span className="text-white">${totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
              <span>Destination & Documentation</span>
              <span className="text-white">${(destinationFee + docFee).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
              <span>Estimated Sales Tax ({salesTaxRate}%)</span>
              <span className="text-white">${financeOutputs.taxAmount.toLocaleString()}</span>
            </div>
            {paymentMethod !== 'cash' && downPayment > 0 && (
              <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
                <span>Down Payment Credit</span>
                <span className="text-emerald-400">-${downPayment.toLocaleString()}</span>
              </div>
            )}
            {tradeInValue > 0 && (
              <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
                <span>Trade-in Credit</span>
                <span className="text-emerald-400">-${tradeInValue.toLocaleString()}</span>
              </div>
            )}

            {paymentMethod === 'lease' && (
              <div className="flex justify-between py-1 border-b border-white/5 text-neutral-400">
                <span>Guaranteed End-of-Lease Residual</span>
                <span className="text-blue-300">
                  ${leaseOutputs.residualValue.toLocaleString()} ({leaseOutputs.residualPercent}%)
                </span>
              </div>
            )}

            <div className="flex justify-between py-2 text-sm font-bold text-white pt-2 border-t border-white/10">
              <span>
                {paymentMethod === 'finance'
                  ? 'Net Financed Balance'
                  : paymentMethod === 'lease'
                  ? 'Total Due at Signing'
                  : 'Total Drive-Away Cost'}
              </span>
              <span className="text-blue-400">
                $
                {paymentMethod === 'finance'
                  ? financeOutputs.netFinanced.toLocaleString()
                  : paymentMethod === 'lease'
                  ? leaseOutputs.dueAtSigning.toLocaleString()
                  : financeOutputs.totalOutTheDoor.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5">
            <button
              id="btn-apply-preapproval"
              onClick={() => {
                vehicleAudio.playSelectBeep();
                setShowPreApprovalModal(true);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Apply for Instant Pre-Approval</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-toggle-amortization"
                onClick={() => setShowAmortization(!showAmortization)}
                className="py-2.5 px-3 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{showAmortization ? 'Hide Table' : 'Amortization'}</span>
              </button>

              {onBookTestDrive && (
                <button
                  id="btn-calc-book-drive"
                  onClick={onBookTestDrive}
                  className="py-2.5 px-3 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-neutral-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Book Drive</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Amortization Schedule Drawer */}
      {showAmortization && (
        <div className="p-6 bg-[#0A0A0A] border-t border-white/10 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Amortization Schedule Breakdown ({loanTerm} Months)</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              Total Interest: ${financeOutputs.totalInterest.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 pb-2">
                  <th className="py-2 px-3">Period</th>
                  <th className="py-2 px-3">Monthly Payment</th>
                  <th className="py-2 px-3">Principal Applied</th>
                  <th className="py-2 px-3">Interest Paid</th>
                  <th className="py-2 px-3">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {amortizationSchedule.map(row => (
                  <tr key={row.month} className="hover:bg-white/5">
                    <td className="py-2 px-3 text-neutral-300">Month {row.month}</td>
                    <td className="py-2 px-3 font-bold text-white">${row.payment.toLocaleString()}</td>
                    <td className="py-2 px-3 text-emerald-400">${row.principal.toLocaleString()}</td>
                    <td className="py-2 px-3 text-red-400">${row.interest.toLocaleString()}</td>
                    <td className="py-2 px-3 text-blue-300 font-bold">${row.balance.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Pre-Approval Modal */}
      {showPreApprovalModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowPreApprovalModal(false)}
        >
          <div
            className="bg-[#0F0F0F] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5"
            onClick={e => e.stopPropagation()}
          >
            {!preApprovalStatus ? (
              <form onSubmit={handlePreApprovalSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-blue-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Instant Pre-Approval</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreApprovalModal(false)}
                    className="text-neutral-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white">
                  Lock in {effectiveApr}% APR for {model.name}
                </h3>
                <p className="text-xs text-neutral-400">
                  No hard credit pull required. Soft inquiry provides instantaneous decision valid for 30 days.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">Full Legal Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Jordan Sterling"
                      value={applicantName}
                      onChange={e => setApplicantName(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="jordan.sterling@example.com"
                      value={applicantEmail}
                      onChange={e => setApplicantEmail(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-neutral-300 mb-1">
                      Estimated Annual Household Income ($)
                    </label>
                    <input
                      required
                      type="number"
                      value={applicantIncome}
                      onChange={e => setApplicantIncome(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all"
                >
                  Submit Pre-Approval Request
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Pre-Approval Approved!</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Congratulations {applicantName || 'Valued Client'}, your pre-approval certificate for up to{' '}
                  <span className="text-blue-400 font-bold font-mono">
                    ${(totalPrice * 1.1).toLocaleString()}
                  </span>{' '}
                  at <span className="text-white font-bold">{effectiveApr}% APR</span> has been registered.
                </p>
                <div className="p-3 bg-[#0A0A0A] rounded-xl border border-white/10 font-mono text-xs text-left space-y-1">
                  <div className="text-neutral-500 text-[10px]">PRE-APPROVAL CERTIFICATE ID</div>
                  <div className="text-blue-400 font-bold">AETH-PRE-{Math.floor(100000 + Math.random() * 900000)}</div>
                  <div className="text-neutral-400 text-[11px]">Valid through: October 30, 2026</div>
                </div>
                <button
                  onClick={() => setShowPreApprovalModal(false)}
                  className="w-full py-3 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-white/10 text-white font-bold text-xs"
                >
                  Return to Configurator
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
