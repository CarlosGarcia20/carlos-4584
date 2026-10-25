import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../hooks/UseAuth';
import { getFieldErrors, type FieldErrors } from '../schemas/auth.schema';
import { rechargeSchema } from '../schemas/recharge.schema';
import { chargeCard } from '../services/snailpayService';
import { savePaymentCard } from '../services/storage';
import { formatCurrency } from '../utils/formatCurrency';
import { failureMessage } from '../utils/snailpayMessages';
import { Button } from './Button';
import { FormAlert } from './FormAlert';
import { TextField } from './TextField';

const EMPTY_FORM = {
   cardNumber: '',
   expirationDate: '',
   cvv: '',
   cardholderName: '',
   amount: '',
};

type RechargeForm = typeof EMPTY_FORM;

interface Notice {
   variant: 'success' | 'error';
   message: string;
}

export function RechargeCard() {
   const { user, addFunds } = useAuth();
   const [form, setForm] = useState<RechargeForm>(EMPTY_FORM);
   const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
   const [notice, setNotice] = useState<Notice | null>(null);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const handleChange =
      (field: keyof RechargeForm) => (event: ChangeEvent<HTMLInputElement>) => {
         setForm((previous) => ({ ...previous, [field]: event.target.value }));
      };

   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      if (!user) return;
      setNotice(null);

      const parsed = rechargeSchema.safeParse(form);
      if (!parsed.success) {
         setFieldErrors(getFieldErrors(parsed.error));
         return;
      }
      setFieldErrors({});

      const { cardNumber, expirationDate, cvv, cardholderName, amount } = parsed.data;
      setIsSubmitting(true);

      try {
         const outcome = await chargeCard({
            cardNumber,
            expirationDate,
            cvv,
            cardholderName,
            amount,
            payerId: user.id,
            payerEmail: user.email,
         });

         if (outcome.type !== 'approved') {
            setNotice({ variant: 'error', message: failureMessage(outcome) });
            return;
         }

         addFunds(amount);
         savePaymentCard(user.id, { cardNumber, cvv });
         setForm(EMPTY_FORM);
         setNotice({
            variant: 'success',
            message: `Recarga aprobada. Se acreditaron ${formatCurrency(amount)} a tu saldo. Código de autorización: ${outcome.payment.authorization_code}. Referencia: ${outcome.payment.reference}.`,
         });
      } catch {
         setNotice({
            variant: 'error',
            message: 'Ocurrió un error inesperado. No se aplicó ninguna recarga.',
         });
      } finally {
         setIsSubmitting(false);
      }
   }

   return (
      <section
         aria-labelledby="recharge-title"
         className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
      >
         <h2 id="recharge-title" className="text-lg font-semibold text-white">
            Recargar saldo
         </h2>
         <p className="mt-1 text-sm text-slate-400">
            Pago con SnailPay. Usa siempre datos ficticios.
         </p>

         <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
            {notice && <FormAlert variant={notice.variant} message={notice.message} />}

            <TextField
               label="Número de tarjeta"
               inputMode="numeric"
               autoComplete="off"
               placeholder="1234 1234 1234 1234"
               value={form.cardNumber}
               onChange={handleChange('cardNumber')}
               {...(fieldErrors.cardNumber && { error: fieldErrors.cardNumber })}
            />
            <div className="grid grid-cols-2 gap-4">
               <TextField
                  label="Vencimiento"
                  autoComplete="off"
                  placeholder="MM/AA"
                  value={form.expirationDate}
                  onChange={handleChange('expirationDate')}
                  {...(fieldErrors.expirationDate && { error: fieldErrors.expirationDate })}
               />
               <TextField
                  label="CVV"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="123"
                  value={form.cvv}
                  onChange={handleChange('cvv')}
                  {...(fieldErrors.cvv && { error: fieldErrors.cvv })}
               />
            </div>
            <TextField
               label="Nombre del titular"
               autoComplete="off"
               placeholder='Ejemplo'
               value={form.cardholderName}
               onChange={handleChange('cardholderName')}
               {...(fieldErrors.cardholderName && { error: fieldErrors.cardholderName })}
            />
            <TextField
               label="Monto a recargar (MXN)"
               inputMode="decimal"
               autoComplete="off"
               placeholder="0"
               value={form.amount}
               onChange={handleChange('amount')}
               {...(fieldErrors.amount && { error: fieldErrors.amount })}
            />

            <Button type="submit" isLoading={isSubmitting} className="w-full">
               {isSubmitting ? 'Procesando…' : 'Recargar saldo'}
            </Button>
         </form>
      </section>
   );
}