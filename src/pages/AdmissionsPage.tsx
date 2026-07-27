import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  User,
  Search,
  Upload,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
  Phone,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Course, AdmissionApplication } from '../types';

interface AdmissionsPageProps {
  courses: Course[];
  preSelectedCourse?: Course | null;
  onSubmissionSuccess: () => void;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({
  courses,
  preSelectedCourse,
  onSubmissionSuccess
}) => {
  // Application Form State
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    email: '',
    phone: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    courseId: preSelectedCourse ? preSelectedCourse.id : courses[0]?.id || '',
    courseName: preSelectedCourse ? preSelectedCourse.title : courses[0]?.title || '',
    previousEducation: '',
    cnicBForm: '',
    guardianPhone: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<AdmissionApplication | null>(null);
  const [submitError, setSubmitError] = useState('');

  // Status Checker State
  const [statusQuery, setStatusQuery] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<AdmissionApplication | null>(null);
  const [statusError, setStatusError] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'courseId') {
      const selected = courses.find((c) => c.id === value);
      setFormData((prev) => ({
        ...prev,
        courseId: value,
        courseName: selected ? selected.title : prev.courseName
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!formData.studentName || !formData.phone || !formData.courseName) {
      setSubmitError('Please fill in required fields: Student Name, Phone, and Course.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit admission application.');
      }
      const newApp = await res.json();
      setSubmittedApp(newApp);
      onSubmissionSuccess();
    } catch (err: any) {
      setSubmitError(err.message || 'Error submitting application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = statusQuery.trim();
    if (!query) return;

    setCheckingStatus(true);
    setStatusError('');
    setStatusResult(null);

    try {
      const res = await fetch(`/api/admissions/status/${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error('No application found with this Application ID or Phone number.');
      }
      const data = await res.json();
      setStatusResult(data);
    } catch (err: any) {
      setStatusError(err.message || 'Application not found.');
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-[#B8860B] uppercase tracking-widest">
          Royal Academy Admissions
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#002349]">
          Online Admission Portal
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Secure your seat for the 2026-2027 academic session. Fill out the application form below or check your existing application status.
        </p>
      </div>

      {/* 3-STEP ADMISSION PROCESS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm relative">
          <div className="text-3xl font-extrabold font-serif text-[#002349] mb-2">01</div>
          <h3 className="font-serif font-bold text-[#002349] text-base mb-2">Submit Online Form</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Fill in student personal details, previous education marks, guardian phone, and select your target course.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm relative">
          <div className="text-3xl font-extrabold font-serif text-[#B8860B] mb-2">02</div>
          <h3 className="font-serif font-bold text-[#002349] text-base mb-2">Document Verification</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Visit our Mansoorabad campus with 2 photos, B-Form copy, and Matric/F.Sc result card for interview & verification.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-sm relative">
          <div className="text-3xl font-extrabold font-serif text-[#002349] mb-2">03</div>
          <h3 className="font-serif font-bold text-[#002349] text-base mb-2">Class Roll Number</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            Receive your student ID card, timetable schedule, book pack, and commence your journey to board top positions!
          </p>
        </div>
      </div>

      {/* ONLINE APPLICATION FORM & STATUS CHECKER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* FORM CONTAINER (2 COLS) */}
        <div className="lg:col-span-2 p-8 rounded-lg bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#002349] flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#B8860B]" /> Admission Registration
              </h2>
              <p className="text-xs text-slate-500">All fields marked with (*) are required.</p>
            </div>
            <span className="px-3 py-1 rounded-sm bg-[#002349] text-white text-xs font-bold uppercase tracking-wider">
              Session 2026-27
            </span>
          </div>

          {submittedApp ? (
            <div className="p-8 rounded-lg bg-emerald-50 border border-emerald-200 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#002349]">Application Submitted Successfully!</h3>
              <p className="text-slate-700 text-sm max-w-md mx-auto">
                Thank you, <span className="text-[#002349] font-bold">{submittedApp.studentName}</span>. Your application ID is:
              </p>
              <div className="inline-block px-6 py-2.5 rounded-sm bg-[#002349] font-mono font-extrabold text-xl text-[#B8860B] border border-slate-200">
                {submittedApp.id}
              </div>
              <p className="text-xs text-slate-500">
                Please save this Application ID or your phone number ({submittedApp.phone}) to track your admission status.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setSubmittedApp(null)}
                  className="px-6 py-2.5 rounded-sm bg-[#B8860B] text-white font-bold text-xs uppercase tracking-wider"
                >
                  Submit Another Form
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {submitError && (
                <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#002349] mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="e.g. Hamza Bilal"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349] placeholder-slate-400 focus:outline-none focus:border-[#B8860B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#002349] mb-1">Father / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    placeholder="e.g. Bilal Mustafa"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349] placeholder-slate-400 focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#002349] mb-1">Student Phone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0329-0247580"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349] placeholder-slate-400 focus:outline-none focus:border-[#B8860B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#002349] mb-1">Guardian Phone Number *</label>
                  <input
                    type="text"
                    required
                    name="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={handleInputChange}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349] placeholder-slate-400 focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#002349] mb-1">Select Target Course *</label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349] focus:outline-none focus:border-[#B8860B]"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (PKR {c.fee})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#002349] mb-1">Student B-Form / CNIC *</label>
                  <input
                    type="text"
                    required
                    name="cnicBForm"
                    value={formData.cnicBForm}
                    onChange={handleInputChange}
                    placeholder="33100-1234567-1"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349] placeholder-slate-400 focus:outline-none focus:border-[#B8860B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#002349] mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349] placeholder-slate-400 focus:outline-none focus:border-[#B8860B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#002349] mb-1">Gender & Date of Birth</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#002349] mb-1">Previous Qualification / Marks</label>
                <input
                  type="text"
                  name="previousEducation"
                  value={formData.previousEducation}
                  onChange={handleInputChange}
                  placeholder="e.g. Matric Science (1020/1100 marks BISE Faisalabad)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349] placeholder-slate-400 focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#002349] mb-1">Residential Address *</label>
                <textarea
                  rows={2}
                  required
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address, Mansoorabad / Farooqabad, Faisalabad"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-[#002349] placeholder-slate-400 focus:outline-none focus:border-[#B8860B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-sm bg-[#B8860B] hover:bg-[#966D09] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Complete & Submit Online Form
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* SIDEBAR: STATUS CHECKER & REQUIREMENTS */}
        <div className="space-y-6">
          {/* Status Checker Widget */}
          <div className="p-6 rounded-lg bg-white border border-slate-200 space-y-4 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#002349] flex items-center gap-2">
              <Search className="w-5 h-5 text-[#B8860B]" /> Check Application Status
            </h3>
            <p className="text-xs text-slate-500">
              Enter your Application ID (e.g. APP-2026-101) or Phone Number to view your real-time status.
            </p>

            <form onSubmit={handleCheckStatus} className="space-y-2">
              <input
                type="text"
                value={statusQuery}
                onChange={(e) => setStatusQuery(e.target.value)}
                placeholder="APP-2026-101 or 0329-0247580"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-sm text-xs text-[#002349] placeholder-slate-400 focus:outline-none focus:border-[#B8860B]"
              />
              <button
                type="submit"
                disabled={checkingStatus}
                className="w-full py-2.5 rounded-sm bg-[#002349] hover:bg-[#001A38] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {checkingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Track Status"}
              </button>
            </form>

            {statusError && (
              <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {statusError}
              </div>
            )}

            {statusResult && (
              <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#002349]">{statusResult.studentName}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold ${
                      statusResult.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : statusResult.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {statusResult.status}
                  </span>
                </div>
                <div className="text-slate-600">Course: {statusResult.courseName}</div>
                <div className="text-slate-400 text-[11px]">Submitted: {new Date(statusResult.createdAt).toLocaleDateString()}</div>
                {statusResult.adminNotes && (
                  <div className="p-2 rounded-sm bg-amber-50 text-amber-800 text-[11px] border border-amber-200">
                    Note: {statusResult.adminNotes}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fee & Requirements Checklist */}
          <div className="p-6 rounded-lg bg-white border border-slate-200 space-y-3 shadow-sm">
            <h4 className="font-serif font-bold text-[#002349] text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B8860B]" /> Documents Checklist
            </h4>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0 mt-0.5" />
                <span>2 Passport-size photographs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0 mt-0.5" />
                <span>Student B-Form / CNIC copy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0 mt-0.5" />
                <span>Father / Guardian CNIC copy</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B8860B] shrink-0 mt-0.5" />
                <span>Matric / Result Card copy</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
