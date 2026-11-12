import React, { useState } from 'react'
import {
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  RefreshCw,
  FileText,
  CreditCard,
  Download,
  KeyRound,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'

export const SupportPage: React.FC = () => {
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setContactName('')
      setContactEmail('')
      setContactMessage('')
      toast.success('Tin nhắn của bạn đã được gửi tới đội ngũ hỗ trợ ECOTDEV!')
    }, 600)
  }

  const faqs = [
    {
      q: 'Làm thế nào để tải source code sau khi thanh toán?',
      a: 'Sau khi đơn hàng chuyển sang trạng thái PAID (thanh toán thành công qua VietQR hoặc cổng trực tuyến), bạn vào mục "Kho sản phẩm đã mua" trong tài khoản để tải file ZIP. Hệ thống sinh Signed URL có thời hạn bảo mật để tải an toàn.',
    },
    {
      q: 'Mã License Key kích hoạt như thế nào?',
      a: 'License Key cho JetBrains, Windows hoặc các phần mềm khác sẽ hiển thị ngay trong Kho sản phẩm đã mua và gửi tới Email của bạn. Bạn chỉ cần sao chép mã và dán vào mục kích hoạt của phần mềm theo hướng dẫn đi kèm.',
    },
    {
      q: 'Tôi có thể triển khai mã nguồn cho nhiều website khách hàng không?',
      a: 'Có. Mỗi giấy phép mã nguồn thương mại tại ECOTDEV cho phép bạn triển khai ứng dụng cho cá nhân hoặc khách hàng của bạn mà không phải trả thêm phí bản quyền. Tuy nhiên, nghiêm cấm hành vi bán lại hoặc chia sẻ công khai toàn bộ mã nguồn nguyên bản.',
    },
    {
      q: 'Chính sách hoàn tiền cho sản phẩm kỹ thuật số được áp dụng thế nào?',
      a: 'Vì tính chất của sản phẩm số (source code sau khi tải không thể thu hồi), chúng tôi hoàn tiền 100% trong trường hợp mã nguồn gặp lỗi nghiêm trọng không thể khắc phục hoặc license key không thể kích hoạt và chúng tôi không thể cấp key thay thế trong vòng 24 giờ.',
    },
    {
      q: 'Tôi có được hỗ trợ cài đặt mã nguồn lên máy chủ không?',
      a: 'Có. Mỗi bộ mã nguồn đều đi kèm tài liệu hướng dẫn từng bước (README, Docker Compose). Nếu bạn cần hỗ trợ cài đặt trực tiếp, đội ngũ kỹ thuật viên của ECOTDEV luôn sẵn sàng hỗ trợ qua Telegram hoặc Google Meet.',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase font-mono tracking-widest text-accent font-bold">
          Trung Tâm Trợ Giúp & Chăm Sóc Khách Hàng
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Chúng Tôi Có Thể Giúp Gì Cho Bạn?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Tìm kiếm giải đáp câu hỏi thường gặp hoặc gửi tin nhắn trực tiếp tới đội ngũ kỹ sư hỗ trợ của ECOTDEV STORE.
        </p>
      </div>

      {/* 3 Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-card border border-slate-800 p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Hướng Dẫn Tải File</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cách giải nén file ZIP mã nguồn, cài đặt Node.js/Python, cấu hình biến môi trường .env và chạy máy chủ localhost.
          </p>
        </div>

        <div className="rounded-3xl bg-card border border-slate-800 p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <KeyRound className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Kích Hoạt Bản Quyền</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Quy trình nhập License Key cho IDE JetBrains, bản quyền Windows 11 Pro và chính sách đổi key mới khi gặp sự cố.
          </p>
        </div>

        <div className="rounded-3xl bg-card border border-slate-800 p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-base">Bảo Hành & Đổi Trả</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Chính sách bảo hành 1 đổi 1 trong 365 ngày cho license key và hoàn tiền khi sản phẩm không đúng cam kết.
          </p>
        </div>
      </div>

      {/* FAQ & Contact Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FAQs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-accent" />
            <span>Câu Hỏi Thường Gặp (FAQ)</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl bg-card border border-slate-800 p-5 space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-slate-100 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-slate-400 pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form (5 cols) */}
        <form onSubmit={handleContactSubmit} className="lg:col-span-5 rounded-3xl bg-card border border-slate-800 p-6 sm:p-8 space-y-4 shadow-2xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <span>Gửi Yêu Cầu Tư Vấn Kỹ Thuật</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Họ tên của bạn</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Email liên hệ</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="developer@gmail.com"
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Nội dung thắc mắc</label>
              <textarea
                rows={4}
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ về sản phẩm hoặc dịch vụ nào..."
                className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3.5 text-slate-100"
              />
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={isSending} className="w-full font-bold">
              Gửi tin nhắn ngay
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent shrink-0" />
              <span>Hotline kỹ thuật: 0988.888.999</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>support@ecotdev.com</span>
            </div>
          </div>
        </form>
      </div>

      {/* Policies Reference Anchor */}
      <div id="refund-policy" className="pt-12 border-t border-slate-800 space-y-6 text-xs text-slate-400">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <span>Chính Sách Hoàn Tiền & Bảo Hành Bản Quyền Kỹ Thuật Số</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 text-sm">Chính Sách Hoàn Tiền</h3>
            <p className="leading-relaxed">
              Khách hàng có quyền yêu cầu hoàn tiền trong vòng 48 giờ kể từ lúc thanh toán nếu phát hiện mã nguồn bị lỗi biên dịch không thể sửa hoặc license key đã bị kích hoạt trước đó và ECOTDEV không thể thay thế sản phẩm tương đương.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-slate-200 text-sm">Chính Sách Bảo Hành Bản Quyền</h3>
            <p className="leading-relaxed">
              Bảo hành 1 đổi 1 đối với toàn bộ License Key phần mềm (JetBrains, Windows, Server) trong suốt chu kỳ sử dụng. Đội ngũ kỹ thuật hỗ trợ kích hoạt và kiểm tra tính hợp lệ trực tiếp từ server nhà cung cấp.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
