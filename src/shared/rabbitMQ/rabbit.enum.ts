export enum RabbitMQMessages {
  TRANSACTION_REQUEST = 'transaction_request',
  TRANSACTION_RESPONSE = 'transaction_response',
}

export enum RabbitQueues {
  REQ = 'transactions.request',
  RES = 'transactions.response',
}

export enum RabbitClientNames {
  TRANSACTION_CLIENT = 'TRANSACTION_CLIENT',
}
