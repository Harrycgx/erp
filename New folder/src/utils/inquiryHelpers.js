export const INQUIRY_STATUSES = [
  'New',
  'Awaiting Specs',
  'Costing',
  'Quote Sent',
  'Negotiation',
  'Confirmed',
  'Lost',
];

export const PRIORITY_LEVELS = ['Low', 'Normal', 'High', 'Urgent'];

export const statusClasses = (status) => {
  switch (status) {
    case 'New':
      return 'bg-slate-900/90 text-slate-100 border border-slate-700';
    case 'Awaiting Specs':
      return 'bg-amber-950/80 text-amber-200 border border-amber-700';
    case 'Costing':
      return 'bg-blue-950/80 text-blue-200 border border-blue-700';
    case 'Quote Sent':
      return 'bg-violet-950/80 text-violet-200 border border-violet-700';
    case 'Negotiation':
      return 'bg-orange-950/80 text-orange-200 border border-orange-700';
    case 'Confirmed':
      return 'bg-emerald-950/80 text-emerald-200 border border-emerald-700';
    case 'Lost':
      return 'bg-rose-950/80 text-rose-200 border border-rose-700';
    default:
      return 'bg-slate-900/90 text-slate-100 border border-slate-700';
  }
};

export const priorityClasses = (priority) => {
  switch (priority) {
    case 'Low':
      return 'bg-slate-800 text-slate-100';
    case 'Normal':
      return 'bg-slate-700 text-slate-100';
    case 'High':
      return 'bg-orange-500 text-slate-950';
    case 'Urgent':
      return 'bg-rose-500 text-slate-950';
    default:
      return 'bg-slate-700 text-slate-100';
  }
};

export const formatTimestamp = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const buildInquirySummary = (inquiries = []) => {
  const summary = {
    total: inquiries.length,
    followUps: inquiries.filter((item) => item.follow_up_date && new Date(item.follow_up_date) > new Date()).length,
    costing: inquiries.filter((item) => item.status === 'Costing').length,
    quoteSent: inquiries.filter((item) => item.status === 'Quote Sent').length,
    confirmed: inquiries.filter((item) => item.status === 'Confirmed').length,
    lost: inquiries.filter((item) => item.status === 'Lost').length,
  };
  return summary;
};

export const countRepeatCustomers = (customers = [], inquiries = []) => {
  const counts = inquiries.reduce((acc, inquiry) => {
    if (!inquiry.customer_id) return acc;
    acc[inquiry.customer_id] = (acc[inquiry.customer_id] ?? 0) + 1;
    return acc;
  }, {});

  return customers.filter((customer) => counts[customer.id] > 1).length;
};
