export const runtime = 'nodejs';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { syncClerkUser } from '@/lib/userSync';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response('Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to your .env file.', {
      status: 500,
    });
  }

  // Retrieve verification headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Verify signature headers presence
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix signature headers.', {
      status: 400,
    });
  }

  // Get raw body payload
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  // Validate the payload signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying Clerk webhook:', err);
    return new Response('Error: Invalid webhook signature verification.', {
      status: 400,
    });
  }

  const eventType = evt.type;

  // Handle user creation and update events seamlessly
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const clerkUser = evt.data as any;
    
    try {
      await syncClerkUser({
        id: clerkUser.id,
        firstName: clerkUser.first_name,
        lastName: clerkUser.last_name,
        emailAddresses: clerkUser.email_addresses.map((e: any) => ({
          emailAddress: e.email_address,
          id: e.id,
        })),
        primaryEmailAddressId: clerkUser.primary_email_address_id,
        imageUrl: clerkUser.image_url,
      });
      console.log(`Clerk user webhook processed successfully for event ${eventType}`);
    } catch (syncError) {
      console.error('Failed to process Clerk webhook synchronization:', syncError);
      return new Response('Error: Internal database sync processing failure.', {
        status: 500,
      });
    }
  }

  return new Response('Success: Webhook processed.', { status: 200 });
}
