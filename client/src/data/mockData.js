export const user = { name: 'Arjun Mehta', role: 'Event Lead', email: 'arjun@org.com' }

export const folders = [
  { id: 1, name: 'Event Proposals', icon: '📋', count: 12, color: '#7c5cfc' },
  { id: 2, name: 'Budgets', icon: '💰', count: 8, color: '#34d399' },
  { id: 3, name: 'Vendor Contracts', icon: '📝', count: 5, color: '#fb923c' },
  { id: 4, name: 'Attendee Lists', icon: '👥', count: 3, color: '#60a5fa' },
  { id: 5, name: 'Marketing', icon: '📢', count: 7, color: '#fbbf24' },
]

export const recentFiles = [
  { id: 1, name: 'Annual Gala Proposal.pdf', type: 'PDF', modified: '2h ago', size: '2.4 MB' },
  { id: 2, name: 'Q4 Budget Review.xlsx', type: 'XLSX', modified: '5h ago', size: '1.1 MB' },
  { id: 3, name: 'Vendor Agreement.docx', type: 'DOCX', modified: '1d ago', size: '890 KB' },
  { id: 4, name: 'Speaker Bios.pdf', type: 'PDF', modified: '2d ago', size: '3.2 MB' },
  { id: 5, name: 'Marketing Plan.xlsx', type: 'XLSX', modified: '3d ago', size: '750 KB' },
  { id: 6, name: 'Venue Contract.pdf', type: 'PDF', modified: '4d ago', size: '1.8 MB' },
]

export const risks = [
  { id: 1, title: 'Venue cancellation risk', severity: 'high', category: 'Timeline', mitigation: 'Secure backup venue by Nov 15', status: 'active' },
  { id: 2, title: 'Budget overrun on catering', severity: 'medium', category: 'Financial', mitigation: 'Negotiate fixed-price contract', status: 'active' },
  { id: 3, title: 'Key speaker unavailable', severity: 'high', category: 'Resource', mitigation: 'Identify alternate speakers', status: 'active' },
  { id: 4, title: 'Low volunteer signup', severity: 'low', category: 'Resource', mitigation: 'Extend registration deadline', status: 'active' },
  { id: 5, title: 'Permit approval delay', severity: 'medium', category: 'Compliance', mitigation: 'Submit early documentation', status: 'acknowledged' },
  { id: 6, title: 'AV equipment failure', severity: 'low', category: 'Technical', mitigation: 'Pre-event testing schedule', status: 'active' },
  { id: 7, title: 'Weather dependency outdoor', severity: 'medium', category: 'Timeline', mitigation: 'Plan indoor backup', status: 'active' },
]

export const tasks = [
  { id: 1, title: 'Finalize venue contract', status: 'todo', priority: 'high', assignee: 'Arjun Mehta', tags: ['venue', 'legal'], dueDate: 'Nov 20' },
  { id: 2, title: 'Send speaker invitations', status: 'todo', priority: 'high', assignee: 'Sarah Chen', tags: ['speakers'], dueDate: 'Nov 18' },
  { id: 3, title: 'Set up registration page', status: 'todo', priority: 'medium', assignee: 'Mike Ross', tags: ['web'], dueDate: 'Nov 22' },
  { id: 4, title: 'Order catering', status: 'in-progress', priority: 'high', assignee: 'Alex Kim', tags: ['catering'], dueDate: 'Nov 15' },
  { id: 5, title: 'Design event brochure', status: 'in-progress', priority: 'medium', assignee: 'Kim Lee', tags: ['design'], dueDate: 'Nov 20' },
  { id: 6, title: 'Confirm AV setup', status: 'in-progress', priority: 'low', assignee: 'Arjun Mehta', tags: ['tech'], dueDate: 'Nov 25' },
  { id: 7, title: 'Print name badges', status: 'completed', priority: 'low', assignee: 'Sarah Chen', tags: ['printing'], dueDate: 'Nov 10' },
  { id: 8, title: 'Hire security staff', status: 'completed', priority: 'high', assignee: 'Mike Ross', tags: ['security'], dueDate: 'Nov 12' },
]

export const volunteers = [
  { id: 1, name: 'Sarah Chen', skills: ['Registration', 'Customer Service', 'QA'], capacity: 80, maxCapacity: 100, status: 'active' },
  { id: 2, name: 'Mike Ross', skills: ['Setup', 'Security', 'Logistics'], capacity: 60, maxCapacity: 100, status: 'active' },
  { id: 3, name: 'Alex Kim', skills: ['Catering', 'Logistics', 'Vendor'], capacity: 95, maxCapacity: 100, status: 'busy' },
  { id: 4, name: 'Kim Lee', skills: ['Design', 'Marketing', 'Social'], capacity: 40, maxCapacity: 100, status: 'active' },
  { id: 5, name: 'James Wilson', skills: ['Photo', 'Video', 'Live'], capacity: 0, maxCapacity: 100, status: 'idle' },
]

export const meetings = [
  { id: 1, title: 'Weekly Planning Call', date: '2026-09-17', duration: 60, participants: ['Arjun', 'Sarah', 'Mike'], status: 'completed' },
  { id: 2, title: 'Vendor Discussion', date: '2026-09-15', duration: 45, participants: ['Arjun', 'Alex'], status: 'completed' },
]

export const sampleTranscript = 'Arjun: Welcome everyone. The gala is in 3 weeks.\nSarah: Registration at 70%. Open early bird soon.\nMike: AV setup confirmed.\nAlex: Catering on track. 200 meals confirmed.\nKim: Marketing needs approval by Friday.\nArjun: Venue permit still pending.\nMike: I will follow up with city.\nSarah: I will send invitations by Thursday.'

export const extractedActions = [
  { id: 1, text: 'Send speaker invitations by Thursday', owner: 'Sarah Chen', priority: 'high' },
  { id: 2, text: 'Follow up with city office about permit', owner: 'Mike Ross', priority: 'high' },
  { id: 3, text: 'Send early bird pricing email', owner: 'Sarah Chen', priority: 'medium' },
  { id: 4, text: 'Get marketing approval by Friday', owner: 'Kim Lee', priority: 'medium' },
]

export const announcements = [
  { id: 1, title: 'Event Date Change', channels: ['WhatsApp', 'Discord'], status: 'draft', content: 'Event date moved to December 15th.' },
  { id: 2, title: 'Volunteer Appreciation', channels: ['Email', 'Discord'], status: 'scheduled', content: 'Thank you to all volunteers!' },
  { id: 3, title: 'Early Bird Ends Soon', channels: ['WhatsApp'], status: 'draft', content: 'Early bird registration ends Nov 1st.' },
]