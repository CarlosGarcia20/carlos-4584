export type PaymentStatus = 'approved' | 'rejected' | 'error'

export type StatusDetail = 
| 'accredited'
| 'invalid_card_number'
| 'invalid_expiration_date'
| 'invalid_cvv'
| 'invalid_cardholder_name'
| 'invalid_amount'
| 'invalid_payer'
| 'invalid_request'
| 'insufficient_funds'
| 'invalid_security_code'
| 'expired_card'
| 'card_declined'
| 'service_unavailable'
| 'internal_error'


export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  status_detail: StatusDetail;
  transaction_amount: number | null;
  date_created: string;
  authorization_code: string | null;
  reference: string;
  payer_id: string | null;
  payer_email: string | null;
  card_number: string | null;
  cvv: string | null;
}

export interface PaymentResult {
  httpStatus: number;
  body: PaymentResponse;
}

export interface PaymentEcho {
  transaction_amount: number | null;
  payer_id: string | null;
  payer_email: string | null;
  card_number: string | null;
  cvv: string | null;
}