export interface Member {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  userId?: string;
  company?: string;
  companyName?: string;
  position?: string;
  industry?: string;
  notes?: string;
  marketingConsent?: boolean;
  lastActivity?: Date;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isPrimary: boolean;
  };
  membershipType: string;
  status: "active" | "inactive" | "suspended";
  joinDate: Date;
  lastVisit?: Date;
  avatar?: string;
}

export interface Space {
  id: string;
  name: string;
  type: string;
  capacity: number;
  pricePerHour: number;
  hourlyRate?: number;
  pricePerDay: number;
  dailyRate?: number;
  monthlyRate?: number;
  amenities: string[];
  status: "available" | "occupied" | "maintenance";
  available: boolean;
  floor: number;
  location?: string;
  area?: number;
  description?: string;
  maintenanceStatus?: "good" | "needs_attention" | "under_maintenance";
  image?: string;
  images?: string[];
}

export interface ERPReservation {
  id: string;
  memberId: string;
  userId?: string;
  spaceId: string;
  startDate: Date;
  endDate: Date;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  totalAmount: number;
  discount?: number;
  paymentStatus?: "paid" | "pending" | "refunded" | "unpaid" | "partial";
  promoCode?: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  createdAt: Date;
}

export type Reservation = ERPReservation;

export interface Invoice {
  id: string;
  invoiceNumber: string;
  number: string;
  memberId: string;
  amount: number;
  total: number;
  subtotal: number;
  taxAmount: number;
  discount: number;
  dueDate: Date;
  issueDate: Date;
  paidDate?: Date;
  status: "paid" | "pending" | "overdue" | "cancelled" | "sent" | "draft";
  items: InvoiceItem[];
  billingAddress?: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  paidAt?: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
  discount?: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: Date;
  description: string;
  receipt?: string;
  paymentMethod: string;
  status: "pending" | "approved" | "rejected" | "paid";
  approvedBy?: string;
  vendorName: string;
  recurring: boolean;
  recurringFrequency?: "weekly" | "monthly" | "quarterly" | "annually";
  createdAt: Date;
  updatedAt: Date;
}

export interface Inventory {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  lastRestocked?: Date;
  lastRestockDate?: Date;
  supplier?: string;
  cost?: number;
  purchasePrice?: number;
  status?: "in_stock" | "low_stock" | "out_of_stock";
  location?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  spaceId?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  assignedTo?: string;
  requestedBy?: string;
  dueDate: Date;
  requestDate?: Date;
  scheduledDate?: Date;
  completionDate?: Date;
  completedAt?: Date;
  estimatedCost?: number;
  actualCost?: number;
  cost?: number;
  notes?: string;
  createdAt: Date;
}

export interface MaintenanceRequest extends MaintenanceTask {}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface MemberSubscription {
  id: string;
  memberId: string;
  planId: string;
  planName: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "cancelled";
  price: number;
  renewalDate?: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  memberId: string;
  amount: number;
  date: Date;
  method: "cash" | "card" | "transfer" | "check";
  paymentMethod?: string;
  status: "completed" | "pending" | "failed" | "refunded";
  transactionId?: string;
  notes?: string;
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  endDate: Date;
  location: string;
  capacity: number;
  registeredAttendees: number;
  organizer: string;
  category: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  image?: string;
  createdAt: Date;
}

export interface Analytics {
  occupancyRate: number;
  revenueBySpace: Record<string, number>;
  memberGrowth: Array<{ period: string; count: number; growth: number }>;
  membershipGrowth: Array<{ period: string; count: number; growth: number }>;
  topSpaces: Array<{
    id: string;
    name: string;
    bookings: number;
    revenue: number;
  }>;
  monthlyRevenue: number[];
  averageBookingValue: number;
  financialSummary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    pendingInvoices: number;
    outstandingInvoices: number;
    revenue: number;
    expenses: number;
    profit: number;
  };
  revenueByMembership: Record<string, number>;
}
