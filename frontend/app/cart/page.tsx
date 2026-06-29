import { redirect } from 'next/navigation';

// Cart is now a drawer — navigating directly to /cart redirects home.
export default function CartPage() {
  redirect('/');
}
