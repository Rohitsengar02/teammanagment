export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  value: number
  lastContact: string
  source: string
  notes: string
  assignedEmployeeId?: string
}

export interface Company {
  id: string
  name: string
  industry: string
  employees: number
  website: string
  location: string
  phone: string
  revenue: number
}

export interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assignee: string
  leadId: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'call' | 'meeting' | 'email' | 'task'
  participant: string
  notes: string
}

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@techcorp.com',
    phone: '+91-98765-43210',
    company: 'TechCorp India',
    status: 'qualified',
    value: 500000,
    lastContact: '2024-06-10',
    source: 'LinkedIn',
    notes: 'Interested in enterprise solution',
    assignedEmployeeId: 'emp1-1',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@innovate.com',
    phone: '+91-97654-32109',
    company: 'Innovate Solutions',
    status: 'proposal',
    value: 750000,
    lastContact: '2024-06-08',
    source: 'Referral',
    notes: 'Strong fit for premium tier',
    assignedEmployeeId: 'emp1-1',
  },
  {
    id: '3',
    name: 'Amit Patel',
    email: 'amit@business.com',
    phone: '+91-96543-21098',
    company: 'Business Dynamics',
    status: 'negotiation',
    value: 1200000,
    lastContact: '2024-06-12',
    source: 'Inbound',
    notes: 'Negotiating contract terms',
    assignedEmployeeId: 'emp1-1',
  },
  {
    id: '4',
    name: 'Anjali Singh',
    email: 'anjali@future.com',
    phone: '+91-95432-10987',
    company: 'Future Ventures',
    status: 'new',
    value: 300000,
    lastContact: '2024-06-14',
    source: 'Cold Call',
    notes: 'Initial outreach completed',
    assignedEmployeeId: 'emp1-2',
  },
  {
    id: '5',
    name: 'Vikram Desai',
    email: 'vikram@digital.com',
    phone: '+91-94321-09876',
    company: 'Digital Enterprises',
    status: 'contacted',
    value: 450000,
    lastContact: '2024-06-13',
    source: 'Email Campaign',
    notes: 'Awaiting their response',
    assignedEmployeeId: 'emp1-2',
  },
  {
    id: '6',
    name: 'Neha Gupta',
    email: 'neha@commerce.com',
    phone: '+91-93210-98765',
    company: 'Commerce Plus',
    status: 'won',
    value: 2000000,
    lastContact: '2024-06-11',
    source: 'Referral',
    notes: 'Contract signed, onboarding started',
    assignedEmployeeId: 'emp1-3',
  },
  {
    id: '7',
    name: 'Suresh Nair',
    email: 'suresh@startups.com',
    phone: '+91-92109-87654',
    company: 'Startup Hub',
    status: 'lost',
    value: 200000,
    lastContact: '2024-06-05',
    source: 'Cold Call',
    notes: 'Chose competitor solution',
    assignedEmployeeId: 'emp1-3',
  },
  {
    id: '8',
    name: 'Divya Malhotra',
    email: 'divya@enterprise.com',
    phone: '+91-91098-76543',
    company: 'Enterprise Global',
    status: 'qualified',
    value: 1500000,
    lastContact: '2024-06-09',
    source: 'LinkedIn',
    notes: 'Ready for demo',
    assignedEmployeeId: 'emp1-3',
  },
]

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp India',
    industry: 'Technology',
    employees: 500,
    website: 'techcorp.com',
    location: 'Bangalore',
    phone: '+91-80-1234-5678',
    revenue: 50000000,
  },
  {
    id: '2',
    name: 'Innovate Solutions',
    industry: 'Software',
    employees: 250,
    website: 'innovate.com',
    location: 'Hyderabad',
    phone: '+91-40-9876-5432',
    revenue: 25000000,
  },
  {
    id: '3',
    name: 'Business Dynamics',
    industry: 'Consulting',
    employees: 1000,
    website: 'business-dynamics.com',
    location: 'Mumbai',
    phone: '+91-22-5555-5555',
    revenue: 100000000,
  },
]

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up with Rajesh Kumar',
    description: 'Send proposal and schedule demo',
    dueDate: '2024-06-15',
    status: 'pending',
    priority: 'high',
    assignee: 'You',
    leadId: '1',
  },
  {
    id: '2',
    title: 'Review Priya Sharma\'s requirements',
    description: 'Analyze requirements document and prepare customization plan',
    dueDate: '2024-06-16',
    status: 'in-progress',
    priority: 'high',
    assignee: 'You',
    leadId: '2',
  },
  {
    id: '3',
    title: 'Contract review with legal',
    description: 'Send contract to legal team for review',
    dueDate: '2024-06-17',
    status: 'pending',
    priority: 'medium',
    assignee: 'Legal Team',
    leadId: '3',
  },
  {
    id: '4',
    title: 'Schedule call with Divya',
    description: 'Arrange meeting for product walkthrough',
    dueDate: '2024-06-18',
    status: 'pending',
    priority: 'medium',
    assignee: 'You',
    leadId: '8',
  },
  {
    id: '5',
    title: 'Prepare quarterly report',
    description: 'Compile sales metrics and pipeline analysis',
    dueDate: '2024-06-20',
    status: 'pending',
    priority: 'low',
    assignee: 'You',
    leadId: '',
  },
]

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Call with TechCorp',
    date: '2024-06-15',
    time: '10:00 AM',
    type: 'call',
    participant: 'Rajesh Kumar',
    notes: 'Discuss pricing and timeline',
  },
  {
    id: '2',
    title: 'Demo for Innovate Solutions',
    date: '2024-06-16',
    time: '2:00 PM',
    type: 'meeting',
    participant: 'Priya Sharma',
    notes: 'Product demonstration',
  },
  {
    id: '3',
    title: 'Contract signing',
    date: '2024-06-17',
    time: '11:00 AM',
    type: 'meeting',
    participant: 'Amit Patel',
    notes: 'Final document signing',
  },
  {
    id: '4',
    title: 'Team sync',
    date: '2024-06-15',
    time: '3:00 PM',
    type: 'meeting',
    participant: 'Sales Team',
    notes: 'Weekly pipeline review',
  },
]

export const mockStats = {
  totalLeads: mockLeads.length,
  qualifiedLeads: mockLeads.filter((l) => l.status === 'qualified').length,
  pipelineValue: mockLeads.reduce((sum, lead) => sum + lead.value, 0),
  closeRate: 25,
  avgDealSize: mockLeads.reduce((sum, lead) => sum + lead.value, 0) / mockLeads.length,
  monthlyTarget: 5000000,
  monthlyAchieved: 3200000,
}

// Multi-role authentication data
export interface Employee {
  id: string
  name: string
  email: string
  role: 'employee' | 'manager'
  department: 'sales' | 'tech'
  status: 'active' | 'inactive'
  joinDate: string
}

export interface AssignedTask {
  id: string
  title: string
  description: string
  assignedBy: string
  assignedTo: string
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  completionNotes?: string
}

export interface Employer {
  id: string
  name: string
  email: string
  company: string
  employees: Employee[]
}

// Mock employers
export const mockEmployers: Employer[] = [
  {
    id: 'emp1',
    name: 'Priya Singh',
    email: 'priya@company.com',
    company: 'TechFlow Solutions',
    employees: [
      {
        id: 'emp1-1',
        name: 'Amit Kumar',
        email: 'amit@techflow.com',
        role: 'employee',
        department: 'sales',
        status: 'active',
        joinDate: '2025-01-15',
      },
      {
        id: 'emp1-2',
        name: 'Neha Sharma',
        email: 'neha@techflow.com',
        role: 'employee',
        department: 'tech',
        status: 'active',
        joinDate: '2025-02-20',
      },
      {
        id: 'emp1-3',
        name: 'Vikram Patel',
        email: 'vikram@techflow.com',
        role: 'manager',
        department: 'sales',
        status: 'active',
        joinDate: '2024-12-01',
      },
    ],
  },
]

// Mock assigned tasks
export const mockAssignedTasks: AssignedTask[] = [
  {
    id: 'task1',
    title: 'Follow up with TechCorp',
    description: 'Call TechCorp to discuss Q3 requirements and budget approval',
    assignedBy: 'Priya Singh',
    assignedTo: 'Amit Kumar',
    dueDate: '2026-06-15',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'task2',
    title: 'Review codebase architecture',
    description: 'Analyze the new microservices architecture and provide recommendations',
    assignedBy: 'Priya Singh',
    assignedTo: 'Neha Sharma',
    dueDate: '2026-06-20',
    status: 'in-progress',
    priority: 'high',
  },
  {
    id: 'task3',
    title: 'Prepare Q2 sales report',
    description: 'Compile Q2 sales metrics, close rates, and revenue data',
    assignedBy: 'Priya Singh',
    assignedTo: 'Vikram Patel',
    dueDate: '2026-06-14',
    status: 'completed',
    priority: 'medium',
    completionNotes: 'Report completed. Total revenue: ₹46.5L. Close rate improved by 15%.',
  },
]

// Extended Employer Features

export interface AttendanceRecord {
  id: string
  employeeId: string
  employeeName: string
  date: string
  status: 'present' | 'absent' | 'half-day' | 'leave'
  checkIn?: string
  checkOut?: string
}

export interface PayrollRecord {
  id: string
  employeeId: string
  employeeName: string
  month: string
  baseSalary: number
  allowances: number
  deductions: number
  netSalary: number
  status: 'pending' | 'processed' | 'paid'
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  type: 'sick' | 'casual' | 'annual' | 'special'
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  rating: number
  date: string
  feedback: string
  reviewer: string
  category: 'communication' | 'productivity' | 'teamwork' | 'initiative'
}

export interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  daysPerWeek: number
  employees: string[]
}

export const mockAttendance: AttendanceRecord[] = [
  {
    id: 'att1',
    employeeId: 'emp1-1',
    employeeName: 'Amit Kumar',
    date: '2026-06-12',
    status: 'present',
    checkIn: '09:00',
    checkOut: '18:00',
  },
  {
    id: 'att2',
    employeeId: 'emp1-2',
    employeeName: 'Neha Sharma',
    date: '2026-06-12',
    status: 'present',
    checkIn: '09:15',
    checkOut: '18:30',
  },
  {
    id: 'att3',
    employeeId: 'emp1-3',
    employeeName: 'Vikram Patel',
    date: '2026-06-12',
    status: 'half-day',
    checkIn: '09:00',
    checkOut: '14:00',
  },
]

export const mockPayroll: PayrollRecord[] = [
  {
    id: 'pay1',
    employeeId: 'emp1-1',
    employeeName: 'Amit Kumar',
    month: 'May 2026',
    baseSalary: 500000,
    allowances: 50000,
    deductions: 25000,
    netSalary: 525000,
    status: 'paid',
  },
  {
    id: 'pay2',
    employeeId: 'emp1-2',
    employeeName: 'Neha Sharma',
    month: 'May 2026',
    baseSalary: 550000,
    allowances: 60000,
    deductions: 30000,
    netSalary: 580000,
    status: 'paid',
  },
  {
    id: 'pay3',
    employeeId: 'emp1-3',
    employeeName: 'Vikram Patel',
    month: 'May 2026',
    baseSalary: 700000,
    allowances: 80000,
    deductions: 40000,
    netSalary: 740000,
    status: 'processed',
  },
]

export const mockLeaves: LeaveRequest[] = [
  {
    id: 'leave1',
    employeeId: 'emp1-1',
    employeeName: 'Amit Kumar',
    type: 'annual',
    startDate: '2026-07-01',
    endDate: '2026-07-05',
    days: 5,
    reason: 'Vacation',
    status: 'approved',
  },
  {
    id: 'leave2',
    employeeId: 'emp1-2',
    employeeName: 'Neha Sharma',
    type: 'sick',
    startDate: '2026-06-15',
    endDate: '2026-06-15',
    days: 1,
    reason: 'Medical check-up',
    status: 'pending',
  },
]

export const mockPerformance: PerformanceReview[] = [
  {
    id: 'perf1',
    employeeId: 'emp1-1',
    employeeName: 'Amit Kumar',
    rating: 4.5,
    date: '2026-06-01',
    feedback: 'Excellent sales performance, great team collaboration.',
    reviewer: 'Priya Singh',
    category: 'productivity',
  },
  {
    id: 'perf2',
    employeeId: 'emp1-2',
    employeeName: 'Neha Sharma',
    rating: 4.8,
    date: '2026-06-01',
    feedback: 'Outstanding technical skills and problem-solving ability.',
    reviewer: 'Priya Singh',
    category: 'initiative',
  },
]

export const mockShifts: Shift[] = [
  {
    id: 'shift1',
    name: 'Morning Shift',
    startTime: '09:00',
    endTime: '17:00',
    daysPerWeek: 5,
    employees: ['emp1-1', 'emp1-2'],
  },
  {
    id: 'shift2',
    name: 'Evening Shift',
    startTime: '17:00',
    endTime: '01:00',
    daysPerWeek: 5,
    employees: ['emp1-3'],
  },
]
