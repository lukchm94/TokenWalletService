export interface CreateWalletInput {
  tokenId: string;
  balance: number;
  currency: string;
}

export interface UpdateBalanceInput {
  tokenId: string;
  balance: number;
}
