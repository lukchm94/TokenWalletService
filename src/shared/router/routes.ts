export enum ApiRoutes {
  API = 'api',
  HEALTH = `${ApiRoutes.API}/health`,
  WALLET = `${ApiRoutes.API}/wallet`,
  TRANSACTION = `${ApiRoutes.API}/transaction`,
}

export enum WalletRoutes {
  UPDATE = 'update',
  DELETE = ':tokenId',
  EXCHANGE = 'exchange',
}

export enum TransactionRoutes {
  COMPLETE = 'complete/:walletId',
  CANCEL = 'cancel/:transactionId',
  WEBHOOK = 'webhook',
}
