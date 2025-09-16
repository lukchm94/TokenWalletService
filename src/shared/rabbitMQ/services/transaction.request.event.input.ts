export interface TransactionEvent {
  id: number;
  amount: number;
  currency: string;
  status: string;
  originCreatedAt: Date;
}
