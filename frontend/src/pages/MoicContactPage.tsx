import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../hooks/useAuth';
import { contactService } from '../services/api';
import type { IContactForm, IContactResponseData, ITicketStatusInfo } from '../types';
import { getErrorMessage } from '../utils/helpers';

const DEPARTMENTS = [
  { id: 'international-cooperation', name: 'International Cooperation & Partnerships', icon: '🌐' },
  { id: 'hafiz-private-sector', name: 'HAFIZ Private Sector Portal & Funding', icon: '🤝' },
  { id: 'industry-commerce', name: 'Industry, Commerce & Trade Relations', icon: '🏢' },
  { id: 'technical-support', name: 'TaskFlow Platform & Technical Desk', icon: '⚙️' },
  { id: 'media-press', name: 'Media, Communications & Press Office', icon: '📰' },
  { id: 'general-inquiry', name: 'General Inquiries & Public Service', icon: '📩' },
];

const OFFICES = [
  {
    city: 'New Administrative Capital (HQ)',
    country: 'Egypt',
    address: 'Governmental District, Ministry of International Cooperation Building, Complex 3',
    phone: '+20 220530638',
    email: 'contact@moic.gov.eg',
    hours: 'Sun - Thu: 8:00 AM - 4:00 PM (EET)',
    tag: 'Main Headquarters',
  },
  {
    city: 'Manama Financial Harbour',
    country: 'Bahrain',
    address: 'Ministry of Industry & Commerce Tower, Building 104, Block 346, Diplomatic Area',
    phone: '+973 1757 4777',
    email: 'info@moic.gov.bh',
    hours: 'Sun - Thu: 7:30 AM - 2:15 PM (AST)',
    tag: 'GCC Regional Office',
  },
  {
    city: 'Alexandria Maritime Hub',
    country: 'Egypt',
    address: '26 July Avenue, Raml Station, Trade & Enterprise Sector',
    phone: '+20 34872910',
    email: 'alex.sector@moic.gov.eg',
    hours: 'Sun - Thu: 8:30 AM - 3:30 PM (EET)',
    tag: 'Regional Sector',
  },
];

const FAQS = [
  {
    question: 'What is the expected response timeframe for submitted MOIC inquiries?',
    answer: 'General inquiries and technical support tickets receive an initial response within 24 business hours. Priority and urgent submissions related to active enterprise projects are addressed within 4 to 8 hours.',
  },
  {
    question: 'How can private sector companies access the HAFIZ Support Platform?',
    answer: 'Private enterprise representatives can submit an inquiry selecting the "HAFIZ Private Sector Portal & Funding" department or directly contact privatesector@moic.gov.eg with their commercial registration number.',
  },
  {
    question: 'How do I check the status of an existing contact ticket?',
    answer: 'Use the "Track Ticket Status" widget on this page! Enter your unique reference code (e.g. MOIC-2026-X892) generated upon form submission to view real-time status updates.',
  },
  {
    question: 'Can I request technical assistance for the TaskFlow Management App?',
    answer: 'Yes! Select "TaskFlow Platform & Technical Desk" in the inquiry form. Our dedicated system engineers will assist with account permissions, API integration, and task workflow queries.',
  },
  {
    question: 'What file formats can be attached to the inquiry form?',
    answer: 'We support PDF, DOCX, XLSX, PNG, and JPG files up to 10MB in total size. Ensure sensitive documents are password-protected if necessary.',
  },
];

export const MoicContactPage: React.FC = () => {
  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState<IContactForm>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    organization: '',
    department: 'international-cooperation',
    subject: '',
    priority: 'Normal',
    message: '',
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicket, setSubmittedTicket] = useState<IContactResponseData | null>(null);

  // Ticket Lookup State
  const [searchTicketId, setSearchTicketId] = useState<string>('');
  const [isSearchingTicket, setIsSearchingTicket] = useState<boolean>(false);
  const [ticketResult, setTicketResult] = useState<ITicketStatusInfo | null>(null);
  const [ticketSearchError, setTicketSearchError] = useState<string | null>(null);

  // FAQ Filter & Accordion State
  const [faqQuery, setFaqQuery] = useState<string>('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Selected Office Tab
  const [selectedOfficeIndex, setSelectedOfficeIndex] = useState<number>(0);

  // Auto fill user details if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter((file) => file.size <= 10 * 1024 * 1024);
      if (validFiles.length < selectedFiles.length) {
        toast.warning('Some files were ignored because they exceed the 10MB limit.');
      }
      setAttachments((prev) => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('Please provide a subject for your inquiry.');
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      toast.error('Please provide a detailed message (minimum 10 characters).');
      return;
    }
    if (!isVerified) {
      toast.error('Please check the verification box confirming your inquiry details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await contactService.submitContactForm(formData);
      if (response.success && response.data) {
        setSubmittedTicket(response.data);
        toast.success(`Inquiry submitted successfully! Reference: ${response.data.ticketId}`);
        // Reset form
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
          organization: '',
          department: 'international-cooperation',
          subject: '',
          priority: 'Normal',
          message: '',
        });
        setAttachments([]);
        setIsVerified(false);
      } else {
        toast.error(response.message || 'Failed to submit inquiry.');
      }
    } catch (err: any) {
      const msg = getErrorMessage(err);
      toast.error(`Submission failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTicketLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTicketId.trim()) {
      toast.info('Enter a ticket reference code (e.g. MOIC-2026-X892)');
      return;
    }

    setIsSearchingTicket(true);
    setTicketSearchError(null);
    setTicketResult(null);

    try {
      const response = await contactService.getTicketStatus(searchTicketId.trim());
      if (response.success && response.data) {
        setTicketResult(response.data);
      } else {
        setTicketSearchError(response.message || 'Ticket not found.');
      }
    } catch (err: any) {
      const msg = getErrorMessage(err);
      setTicketSearchError(msg);
    } finally {
      setIsSearchingTicket(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Ticket Reference copied to clipboard!');
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(faqQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header & Navigation */}
      <Navbar />

      {/* Main Content Wrap */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {/* Back Button & Breadcrumb */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-slate-400">
            <Link to="/dashboard" className="hover:text-indigo-400 transition-colors flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-medium">MOIC Contact Us</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              MOIC Support Portal Active
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-10 border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/40 to-indigo-950/30">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -top-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <span>🏛️ Official Ministry & Support Center</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Get in Touch with <span className="bg-gradient-to-r from-indigo-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">MOIC Support</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              Welcome to the Ministry of International Cooperation & Commerce (MOIC) Help Desk. Whether you have questions regarding international partnerships, HAFIZ private sector programs, or TaskFlow enterprise support, our team is here to assist you.
            </p>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              🌐
            </div>
            <h3 className="text-base font-semibold text-white">General Ministry Desk</h3>
            <p className="text-xs text-slate-400 mt-1 mb-3">Official correspondence & international affairs.</p>
            <div className="space-y-1 text-xs">
              <p className="text-slate-200 font-mono">contact@moic.gov.eg</p>
              <p className="text-slate-400">+20 220530638</p>
              <p className="text-slate-500">Sun - Thu, 8 AM - 4 PM</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-teal-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              🤝
            </div>
            <h3 className="text-base font-semibold text-white">HAFIZ Private Sector</h3>
            <p className="text-xs text-slate-400 mt-1 mb-3">Enterprise funding, guidance & commercial assistance.</p>
            <div className="space-y-1 text-xs">
              <p className="text-slate-200 font-mono">privatesector@moic.gov.eg</p>
              <p className="text-slate-400">+20 220530639</p>
              <p className="text-slate-500">Direct Private Desk</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              ⚙️
            </div>
            <h3 className="text-base font-semibold text-white">TaskFlow Tech Support</h3>
            <p className="text-xs text-slate-400 mt-1 mb-3">Application help, APIs, and account permissions.</p>
            <div className="space-y-1 text-xs">
              <p className="text-slate-200 font-mono">support@moic-taskflow.com</p>
              <p className="text-slate-400">Hotline: 19000</p>
              <p className="text-slate-500">24/7 Digital Ticket Desk</p>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform">
              📍
            </div>
            <h3 className="text-base font-semibold text-white">Main HQ Complex</h3>
            <p className="text-xs text-slate-400 mt-1 mb-3">Governmental District, Cairo, Egypt.</p>
            <div className="space-y-1 text-xs">
              <p className="text-slate-200">New Administrative Capital</p>
              <p className="text-slate-400">Complex 3, Building A</p>
              <p className="text-slate-500">Walk-in by appointment</p>
            </div>
          </div>
        </div>

        {/* Form & Ticket Lookup Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Contact Form (8 cols) */}
          <div className="lg:col-span-8 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
                <span>📝 Submit an Official Inquiry</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Fill out the form below. Your request will be dispatched to the designated MOIC department and assigned a reference ticket.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Department Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Select Department <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, department: dept.id }))}
                      className={`flex items-center space-x-3 p-3 rounded-xl border text-left transition-all ${
                        formData.department === dept.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="text-xl">{dept.icon}</span>
                      <span className="text-xs font-medium leading-tight">{dept.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal & Enterprise Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Sarah Mansour"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@company.com"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+20 100 123 4567"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                    placeholder="e.g. Apex Global Ltd."
                    className="input-field text-sm"
                  />
                </div>
              </div>

              {/* Subject & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Subject / Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Brief summary of your request"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Urgency Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="input-field text-sm bg-slate-900"
                  >
                    <option value="Low">Low (General)</option>
                    <option value="Normal">Normal (Standard)</option>
                    <option value="High">High (Important)</option>
                    <option value="Urgent">Urgent (Critical)</option>
                  </select>
                </div>
              </div>

              {/* Detailed Message */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Detailed Message <span className="text-red-400">*</span>
                  </label>
                  <span className={`text-xs ${formData.message.length > 2800 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {formData.message.length} / 3000 chars
                  </span>
                </div>
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please describe your inquiry, project scope, or technical question in detail..."
                  className="input-field text-sm resize-y"
                  maxLength={3000}
                  required
                ></textarea>
              </div>

              {/* Attachments Section */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Attach Supporting Documents (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto btn-secondary text-xs flex items-center justify-center space-x-2 cursor-pointer py-2.5 px-4 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/50">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Upload File (PDF, DOCX, PNG)</span>
                    <input type="file" multiple onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.doc,.xlsx,.png,.jpg,.jpeg" />
                  </label>
                  <span className="text-xs text-slate-500">Max file size: 10MB per file</span>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                        <span className="truncate max-w-[150px] text-slate-300">{file.name}</span>
                        <span className="text-slate-500">({(file.size / 1024).toFixed(0)} KB)</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                          className="text-red-400 hover:text-red-300 text-sm font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Verification & Terms Checkbox */}
              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="verification-check"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                />
                <label htmlFor="verification-check" className="text-xs text-slate-400 cursor-pointer leading-relaxed">
                  I certify that the information provided is accurate and represents an official inquiry to the Ministry of International Cooperation & Commerce.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/25"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spinner text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Transmitting Inquiry to MOIC...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      <span>Submit Official Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Tools: Ticket Status Tracker & Contact Directives (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Ticket Lookup Card */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-lg">
                  🔍
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Track Ticket Status</h3>
                  <p className="text-xs text-slate-400">Lookup an existing inquiry</p>
                </div>
              </div>

              <form onSubmit={handleTicketLookup} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Ticket Reference Code
                  </label>
                  <input
                    type="text"
                    value={searchTicketId}
                    onChange={(e) => setSearchTicketId(e.target.value)}
                    placeholder="e.g. MOIC-2026-X892"
                    className="input-field text-sm uppercase font-mono tracking-wider"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSearchingTicket}
                  className="btn-secondary w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2"
                >
                  {isSearchingTicket ? (
                    <span>Searching System...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Lookup Ticket</span>
                    </>
                  )}
                </button>
              </form>

              {/* Ticket Search Result Display */}
              {ticketResult && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-400 font-bold">{ticketResult.ticketId}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        ticketResult.status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : ticketResult.status === 'In Progress'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {ticketResult.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-300 font-semibold truncate">{ticketResult.subject}</p>
                    <p className="text-slate-400 text-[11px]">Dept: {ticketResult.department}</p>
                    <p className="text-slate-500 text-[10px] mt-1">
                      Submitted: {new Date(ticketResult.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {ticketSearchError && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs animate-fade-in">
                  {ticketSearchError}
                </div>
              )}
            </div>

            {/* Quick Directive Notice Card */}
            <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>ℹ️ Submission Guidelines</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-2.5 leading-relaxed list-disc list-inside">
                <li>Official requests must include accurate contact information for verification.</li>
                <li>Commercial funding inquiries should specify commercial registration details.</li>
                <li>Emergency system outages should select the "Urgent" priority level.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Regional Offices Directory */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>🏢 MOIC Regional Offices & Hubs</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Physical administrative headquarters and trade centers.</p>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              {OFFICES.map((office, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOfficeIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedOfficeIndex === idx
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {office.city}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {OFFICES.map((office, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  selectedOfficeIndex === idx
                    ? 'bg-slate-900/90 border-indigo-500/50 shadow-lg shadow-indigo-500/5'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                    {office.tag}
                  </span>
                  <span className="text-xs text-slate-400">{office.country}</span>
                </div>
                <h3 className="text-base font-bold text-white">{office.city}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{office.address}</p>

                <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5 text-xs">
                  <p className="text-slate-400 flex items-center justify-between">
                    <span>Phone:</span>
                    <span className="text-slate-200 font-mono">{office.phone}</span>
                  </p>
                  <p className="text-slate-400 flex items-center justify-between">
                    <span>Email:</span>
                    <span className="text-indigo-300 font-mono">{office.email}</span>
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1">{office.hours}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>❓ Frequently Asked Questions</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">Quick answers to common inquiries regarding MOIC services.</p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={faqQuery}
                onChange={(e) => setFaqQuery(e.target.value)}
                className="input-field text-xs py-2"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => {
                const isOpen = expandedFaqIndex === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-800 rounded-2xl bg-slate-900/50 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedFaqIndex(isOpen ? null : index)}
                      className="w-full p-4 text-left font-semibold text-sm text-slate-100 flex items-center justify-between hover:text-indigo-300 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-indigo-400' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No matching questions found.</p>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {submittedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-indigo-500/40 shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4">
              ✓
            </div>

            <h3 className="text-xl font-bold text-white text-center">Inquiry Submitted Successfully</h3>
            <p className="text-xs text-slate-300 text-center mt-1">
              Your message has been assigned an official MOIC ticket reference.
            </p>

            {/* Ticket Card Details */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Ticket Reference:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-indigo-400">{submittedTicket.ticketId}</span>
                  <button
                    onClick={() => copyToClipboard(submittedTicket.ticketId)}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Copy Ticket Code"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Department:</span>
                  <span className="text-slate-200 font-medium truncate block">{submittedTicket.department}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Priority:</span>
                  <span className="text-slate-200 font-medium">{submittedTicket.priority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Submitted By:</span>
                  <span className="text-slate-200 font-medium truncate block">{submittedTicket.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Est. Response:</span>
                  <span className="text-emerald-400 font-medium">&lt; 24 Hours</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setSubmittedTicket(null)}
                className="btn-primary w-full text-xs py-3 rounded-xl font-semibold"
              >
                Close & Return to Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-12 py-8 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} MOIC - Ministry of International Cooperation & Commerce. All rights reserved.</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); toast.info('MOIC Privacy & Legal Terms active.'); }} className="hover:text-white">Privacy Policy</a>
            <a href="#terms" onClick={(e) => { e.preventDefault(); toast.info('Official MOIC Regulations apply.'); }} className="hover:text-white">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MoicContactPage;
