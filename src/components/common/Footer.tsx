import React from 'react';
import {
  Shield,
  Zap,
  Globe,
  Award,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0A0A0A] border-t border-white/10 text-neutral-400 text-xs mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 font-display font-extrabold text-lg text-white">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs font-black">
                Æ
              </div>
              <span>AETHER MOTORS</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Bespoke luxury performance grand tourers and track hypercars engineered with 900V electric architecture and active aerodynamics.
            </p>
            <div className="text-[11px] font-mono text-neutral-500">
              Global Headquarters: Beverly Hills, CA
            </div>
          </div>

          {/* Models */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Fleet Models
            </div>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Aether Hyper GT (Tri-Motor 1,200 HP)
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Aether Apex Coupe (Hybrid V8 950 HP)
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Aether Nomad SUV (Quad-Motor 800 HP)
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Track Dynamics & Corsa Packages
              </li>
            </ul>
          </div>

          {/* Ownership & Finance */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Ownership & Finance
            </div>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Aether Financial Services
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Bespoke Lease Programs
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Instant Pre-Approval Soft Inquiry
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                Trade-In Valuation Guarantee
              </li>
              <li className="hover:text-blue-400 transition-colors cursor-pointer">
                8-Year / 150,000-Mile Battery Warranty
              </li>
            </ul>
          </div>

          {/* Concierge */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              VIP Concierge
            </div>
            <ul className="space-y-2 text-xs">
              <li>Direct Hotline: +1 (800) 555-AETH</li>
              <li>Concierge: concierge@aethermotors.com</li>
              <li>Showroom Hours: Mon - Sat 9am - 8pm</li>
              <li>White Glove Home Delivery Available</li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 font-mono">
          <div>
            © {new Date().getFullYear()} Aether Motors Inc. All Rights Reserved. Designed for high-performance mobility.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-neutral-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-neutral-400 cursor-pointer">Security Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
