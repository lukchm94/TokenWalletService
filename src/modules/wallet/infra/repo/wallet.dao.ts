export interface WalletDao {
  id: number;
  tokenId: string;
  balance: bigint;
  currency: string;
}
