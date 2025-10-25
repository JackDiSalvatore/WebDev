'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import postgres from 'postgres';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// ===============================================
// TODO
const postgresUrl = 'localhost:15432';
console.log(`Connecting to... ${postgresUrl}`);

const sql = postgres({
    host: 'localhost',
    port: 15432,
    password: 'password',
    db: 'nextjs-dashboard-postgres',
    username: 'postgres'
});
// ===============================================

// Types

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.'
    }),
    amount: z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.'}),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.'
    }),
    date: z.string()
})

const CreateInvoice = FormSchema.omit({ id: true, date: true });

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    }
    message?: string | null;
};

// Auth Functions

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

// Invoice Functions

export async function createInvoice(state: State, payload: FormData): Promise<State> {
    const validatedFields = CreateInvoice.safeParse({
        customerId: payload.get("customerId"),
        amount: payload.get("amount"),
        status: payload.get("status")
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.'
        };
    }

    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    console.log({ customerId, amount, status });

    try {
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
        `;
    } catch (error) {
        console.error(error);
        return { message: 'Database Error: Failed to Create Invoice.' }
    }

    // clear client-side router cache
    // and trigger new request to the server
    revalidatePath('/dashboard/invoices');
    // re-direct user
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, state: State, payload: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: payload.get('customerId'),
        amount: payload.get('amount'),
        status: payload.get('status')
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Edit Invoice'
        }
    }

    // Prepare data for database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    } catch (error) {
        console.error(error);
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    // Intentionally throw error for testing
    // throw new Error('Failed to Delete Invoice');

    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
    } catch (error) {
        console.error(error);
    }

    revalidatePath('/dashboard/invoices');
}