import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { syncClerkUser } from '@/lib/userSync';

export const dynamic = 'force-dynamic';

export default async function AuthCallbackPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect('/onboarding');
  }

  try {
    // Perform database sync using unified helper
    const syncedDbUser = await syncClerkUser({
      id: clerkUser.id,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      emailAddresses: clerkUser.emailAddresses,
      primaryEmailAddressId: clerkUser.primaryEmailAddressId,
      imageUrl: clerkUser.imageUrl
    });

    // Directly restore access to dashboard if they completed onboarding already
    if (syncedDbUser && syncedDbUser.onboardingCompleted) {
      redirect('/dashboard');
    }
  } catch (error) {
    console.error('Error during auth callback synchronization:', error);
  }

  // Direct new accounts to the interactive onboarding wizard
  redirect('/onboarding');
}
