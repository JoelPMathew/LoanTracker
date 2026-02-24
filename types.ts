
export enum UserRole {
  ADMIN = 'ADMIN',
  BORROWER = 'BORROWER'
}

export enum LoanStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  OVERDUE = 'OVERDUE',
  PAID = 'PAID'
}

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
}

export interface Loan {
  id?: string;
  _id?: string;
  borrowerName: string;
  borrowerId: string;
  amount: number;
  remainingBalance: number;
  interestRate: number;
  tenure: number; // in months
  startDate: string;
  status: LoanStatus;
  type: string;
  repaidPercentage: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
}

export interface Activity {
  id?: string;
  _id?: string;
  type: 'PAYMENT_RECEIVED' | 'AUTOPAY_SCHEDULED' | 'LOAN_APPROVED' | 'LOAN_APPLIED' | 'LOAN_REJECTED';
  title: string;
  subtitle?: string;
  amount?: number | string;
  date?: string;
  createdAt?: string;
  status?: string;
}
