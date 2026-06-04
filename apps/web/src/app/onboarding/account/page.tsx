import { Suspense } from 'react';
import AccountForm from './AccountForm';

export const dynamic = 'force-dynamic';

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountForm />
    </Suspense>
  );
}
