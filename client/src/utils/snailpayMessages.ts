import type { ChargeOutcome } from "../services/snailpayService";

const REJECTION_MESSAGES: Record<string, string> = {
   invalid_card_number: 'El número de tarjeta no es válido.',
   invalid_expiration_date: 'La fecha de vencimiento no es válida.',
   invalid_cvv: 'El CVV no es válido.',
   invalid_cardholder_name: 'El nombre del titular no es válido.',
   invalid_amount: 'El monto no es válido.',
   invalid_payer: 'No pudimos validar los datos de tu cuenta.',
   invalid_request: 'La solicitud no es válida. Revisa los datos e inténtalo de nuevo.',
   insufficient_funds: 'La tarjeta no tiene fondos suficientes.',
   invalid_security_code: 'El CVV es incorrecto.',
   expired_card: 'La tarjeta está vencida.',
   card_declined: 'La tarjeta fue rechazada. Prueba con otra tarjeta.',
};

export function failureMessage(outcome: Exclude<ChargeOutcome, { type: 'approved' }>): string {
   switch (outcome.type) {
      case 'rejected': {
         const reason =
            REJECTION_MESSAGES[outcome.detail] ?? 'La operación fue rechazada.';
         return `${reason}`;
      }
      case 'unavailable':
         return 'SnailPay no está disponible en este momento; inténtalo más tarde.';
      case 'timeout':
         return 'SnailPay tardó demasiado en responder.';
      case 'network':
         return 'No pudimos conectar con SnailPay. Revisa tu conexión.';
      case 'invalid_response':
         return 'Recibimos una respuesta inesperada de SnailPay.';
   }
}