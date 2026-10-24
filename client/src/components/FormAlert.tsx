export function FormAlert({ message }: { message: string }) {
   return (
      <div
         role="alert"
         className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
      >
         {message}
      </div>
   );
}