import { TransactionStatusEnum } from '../../../shared/validations/transaction/status';

export interface TransactionGatewayOutput {
  transactionId: number;
  transactionStatus: TransactionStatusEnum;
}

export interface GatewayOutput {
  status: number;
  statusText: string;
  data: TransactionGatewayOutput;
}

export interface GatewayResult {
  result: GatewayOutput;
}
