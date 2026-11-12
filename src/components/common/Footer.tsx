import React from 'react'
import { Link } from 'react-router-dom'
import { Code2, Mail, Phone, MapPin, ShieldCheck, Zap, Headphones, RefreshCw } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-brand-darkBg text-slate-400 text-xs mt-auto">
      {/* Value Proposition Highlights */}
      <div className="border-b border-slate-800/60 py-8 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Giao hàng tự động</h4>
                <p className="text-[11px] text-slate-500">Nhận source code & key tức thì</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Mã nguồn kiểm duyệt</h4>
                <p className="text-[11px] text-slate-500">100% sạch, an toàn, chuẩn clean code</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Bảo hành 1 đổi 1</h4>
                <p className="text-[11px] text-slate-500">Hỗ trợ trọn vẹn suốt chu kỳ bản quyền</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Hỗ trợ kỹ thuật 24/7</h4>
                <p className="text-[11px] text-slate-500">Đội ngũ Senior Dev trực tiếp tư vấn</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-brand-darkBg rounded-[6px] flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-accent" />
                </div>
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                ECOT<span className="text-accent">DEV</span> STORE
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Sàn giao dịch sản phẩm số & mã nguồn chuẩn chuyên nghiệp hàng đầu Việt Nam. Cung cấp giải pháp phần mềm, giao diện cao cấp và mã bản quyền chính hãng cho lập trình viên và doanh nghiệp.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>Tòa nhà Công Nghệ Cao, Cầu Giấy, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span>Hotline: 0988.888.999 (08:00 - 22:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@ecotdev.com</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
              Danh Mục Sản Phẩm
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=source-code" className="hover:text-white transition">
                  Source Code Toàn Diện
                </Link>
              </li>
              <li>
                <Link to="/products?category=website-templates" className="hover:text-white transition">
                  Website Templates
                </Link>
              </li>
              <li>
                <Link to="/products?category=ui-ux-assets" className="hover:text-white transition">
                  UI/UX Assets & Kit
                </Link>
              </li>
              <li>
                <Link to="/products?category=developer-tools" className="hover:text-white transition">
                  Developer Tools & CLI
                </Link>
              </li>
              <li>
                <Link to="/products?category=licenses-digital-services" className="hover:text-white transition">
                  Bản Quyền & License Keys
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
              Chăm Sóc Khách Hàng
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/support" className="hover:text-white transition">
                  Trung tâm trợ giúp & FAQ
                </Link>
              </li>
              <li>
                <Link to="/account/downloads" className="hover:text-white transition">
                  Kho sản phẩm đã mua
                </Link>
              </li>
              <li>
                <Link to="/support#payment-guide" className="hover:text-white transition">
                  Hướng dẫn thanh toán QR
                </Link>
              </li>
              <li>
                <Link to="/support#license-guide" className="hover:text-white transition">
                  Quy định sử dụng license
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition">
                  Gửi yêu cầu hỗ trợ (Ticket)
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Policies */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">
              Chính Sách & Điều Khoản
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/support#refund-policy" className="hover:text-white transition">
                  Chính sách hoàn tiền số
                </Link>
              </li>
              <li>
                <Link to="/support#warranty-policy" className="hover:text-white transition">
                  Chính sách bảo hành bản quyền
                </Link>
              </li>
              <li>
                <Link to="/support#terms" className="hover:text-white transition">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link to="/support#privacy" className="hover:text-white transition">
                  Bảo mật thông tin khách hàng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Payment Logos */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500 text-center sm:text-left">
            © 2026 ECOTDEV DIGITAL STORE. All rights reserved. Nền tảng thương mại điện tử sản phẩm kỹ thuật số.
          </p>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>Hỗ trợ thanh toán:</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">VietQR</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">VNPay</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">MoMo</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Bank Transfer</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
