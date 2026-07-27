import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2
} from 'lucide-react';
import { AnimatedSection } from '../components/AnimatedSection';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.name || !formData.message) {
      setErrorMsg('Please fill in your name and message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        throw new Error('Failed to send contact message.');
      }
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-12">
      {/* Header Banner */}
      <AnimatedSection animation="fade-up" className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#4ffbe6] uppercase tracking-widest">Connect With Us</span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Contact Royal Academy</h1>
        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
          We welcome parents and prospective students to visit our campus or send us an inquiry. Our admissions office is ready to help!
        </p>
      </AnimatedSection>

      {/* CONTACT INFORMATION & FORM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* COL 1: DETAILS & WHATSAPP */}
        <AnimatedSection animation="fade-left" className="space-y-6">
          <div className="p-8 rounded-3xl bg-[#1b2025] border border-white/10 space-y-6 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-white border-l-2 border-[#4ffbe6] pl-3">
              Campus Details
            </h3>

            <div className="space-y-4 text-xs text-gray-300">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#6200ee]/20 text-[#4ffbe6] shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Campus Address</div>
                  <p className="text-gray-400 mt-0.5">
                    Mansoorabad, Farooqabad, Street 14, Faisalabad, Punjab, Pakistan
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Official Helpline</div>
                  <a href="tel:03290247580" className="text-emerald-400 font-bold hover:underline">
                    0329-0247580
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#6200ee]/20 text-[#cfbdff] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Email Address</div>
                  <a href="mailto:info@royalacademy.edu.pk" className="text-gray-300 hover:underline">
                    info@royalacademy.edu.pk
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-white/10">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Office Hours</div>
                  <p className="text-gray-400 mt-0.5">Monday - Saturday: 8:00 AM - 7:00 PM</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/923290247580"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Instant Chat on WhatsApp (0329-0247580)
              </a>
            </div>
          </div>
        </AnimatedSection>

        {/* COL 2 & 3: CONTACT FORM */}
        <div className="lg:col-span-2 p-8 rounded-3xl bg-[#1b2025] border border-white/10 shadow-2xl space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
              <Send className="w-6 h-6 text-[#4ffbe6]" /> Send Us a Direct Message
            </h2>
            <p className="text-xs text-gray-400">Our administrative team responds within 24 hours.</p>
          </div>

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="font-serif text-xl font-bold text-white">Thank You for Reaching Out!</h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto">
                Your message has been stored in our backend database. We will contact you at your phone number shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 rounded-xl bg-[#6200ee] text-white font-semibold text-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Muhammad Ali"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#6200ee]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0329-0247580"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#6200ee]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#6200ee]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Matric Class Fee Inquiry"
                    className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#6200ee]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Your Inquiry / Message *</label>
                <textarea
                  rows={4}
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your question regarding courses, timing, or admissions..."
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#6200ee]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-[#6200ee] hover:bg-[#7c3aed] text-white font-bold text-xs shadow-xl flex items-center justify-center gap-2 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* FULL WIDTH MAP EMBED */}
      <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-80 relative">
        <iframe
          title="Royal Academy Location Map"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.992819875887!2d73.0880!3d31.4200!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDI1JzEyLjAiTiA3M8KwMDUnMTYuOCJF!5e0!3m2!1sen!2spk!4v1680000000000!5m2!1sen!2spk"
          className="w-full h-full border-0 filter grayscale invert opacity-80 hover:opacity-100 transition-opacity"
          loading="lazy"
        />
      </div>
    </div>
  );
};
