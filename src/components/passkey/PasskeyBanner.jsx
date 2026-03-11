/**
 * PasskeyBanner — Post-SAML Registration Prompt
 * -----------------------------------------------
 * Shown on the Dashboard when the user is logged in via SAML
 * but has not yet registered a passkey.
 *
 * Flow:
 *   1. On mount → GET /api/me to check hasPasskey
 *   2. If no passkey → show banner
 *   3. "Register Passkey" → startRegistration() → POST /webauthn/register/verify
 *   4. On success → show success state, dismiss banner
 */

import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, X, Loader2, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { startRegistration } from '@/lib/webauthn';

export default function PasskeyBanner() {
    const [status, setStatus] = useState('loading'); // loading | show | registered | dismissed
    const [registering, setRegistering] = useState(false);
    const [user, setUser] = useState(null);

    // ── Check passkey status on mount ─────────────────────────────────────────
    useEffect(() => {
        async function checkPasskeyStatus() {
            try {
                const res = await fetch('/api/me', { credentials: 'include' });
                if (!res.ok) {
                    setStatus('dismissed'); // Not a SAML session — hide banner
                    return;
                }
                const data = await res.json();
                setUser(data);
                setStatus(data.hasPasskey ? 'registered' : 'show');
            } catch {
                setStatus('dismissed');
            }
        }
        checkPasskeyStatus();
    }, []);

    // ── Register passkey ───────────────────────────────────────────────────────
    const handleRegister = async () => {
        if (!navigator.credentials) {
            toast({
                variant: 'destructive',
                title: 'Not Supported',
                description: 'Your browser does not support passkeys.',
            });
            return;
        }

        setRegistering(true);
        try {
            const { attResp } = await startRegistration();

            // Send attestation to server
            const verifyRes = await fetch('/webauthn/register/verify', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attResp),
            });

            const result = await verifyRes.json();

            if (result.verified) {
                setStatus('registered');
                toast({
                    title: '🗝️ Passkey registered!',
                    description: 'You can now sign in with your passkey next time.',
                });
            } else {
                throw new Error(result.error || 'Verification failed');
            }
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                toast({
                    variant: 'destructive',
                    title: 'Cancelled',
                    description: 'Passkey registration was cancelled.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Registration failed',
                    description: err.message,
                });
            }
        } finally {
            setRegistering(false);
        }
    };

    // ── Render states ──────────────────────────────────────────────────────────

    if (status === 'loading' || status === 'dismissed') return null;

    if (status === 'registered') {
        return (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 px-5 py-4 mb-6">
                <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                    ✅ Passkey registered — you can sign in with biometrics next time.
                </p>
            </div>
        );
    }

    // status === 'show'
    return (
        <div className="relative rounded-xl border border-indigo-200 dark:border-indigo-800
                    bg-gradient-to-r from-indigo-50 to-purple-50
                    dark:from-indigo-950/40 dark:to-purple-950/40
                    px-5 py-4 mb-6 overflow-hidden">

            {/* Dismiss button */}
            <button
                onClick={() => setStatus('dismissed')}
                className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">

                {/* Icon */}
                <div className="shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 p-2.5">
                    <Fingerprint className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                        Register a Passkey
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Add a passkey so you can sign in with Face ID, Touch ID, or your device PIN —
                        no password needed.
                        {user?.email && <span className="font-medium"> Account: {user.email}</span>}
                    </p>

                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <Button
                            size="sm"
                            disabled={registering}
                            onClick={handleRegister}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                        >
                            {registering
                                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Registering…</>
                                : <><KeyRound className="h-3.5 w-3.5" /> Register Passkey</>
                            }
                        </Button>

                        <p className="text-xs text-muted-foreground">
                            Secured with FIDO2 / WebAuthn
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
