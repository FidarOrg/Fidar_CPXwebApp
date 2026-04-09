/**
 * PasskeyLoginButton — Standalone Passkey Sign-In
 * -------------------------------------------------
 * Displayed on the landing page alongside the existing SSO / Employee Login buttons.
 * Allows users who have already registered a passkey to sign in without SAML.
 *
 * Flow:
 *   1. User enters their email
 *   2. Click "Sign in with Passkey"
 *   3. startAuthentication(email) → navigator.credentials.get()
 *   4. POST /webauthn/login/verify server validates assertion
 *   5. Session established → navigate to /dashboard
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { startAuthentication } from '@/lib/webauthn';
import { FIDAR_API_BASE } from '@/config';

export default function PasskeyLoginButton() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    const handlePasskeyLogin = async () => {
        if (!email.trim()) return;

        if (!navigator.credentials) {
            toast({
                variant: 'destructive',
                title: 'Not Supported',
                description: 'Your browser does not support passkeys.',
            });
            return;
        }

        setLoading(true);
        try {
            const assertion = await startAuthentication(email.trim());

            const verifyRes = await fetch(`${FIDAR_API_BASE}/fidar/sdk/api/webauthn/login/verify`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...assertion, email: email.trim() }),
            });

            const result = await verifyRes.json();

            if (result.verified) {
                // Store a token marker so ProtectedRoute knows we're authenticated
                localStorage.setItem('authToken', 'passkey-session');
                toast({
                    title: '🗝️ Signed in with passkey!',
                    description: `Welcome back, ${result.email}`,
                });
                navigate('/dashboard');
            } else {
                throw new Error(result.error || 'Verification failed');
            }
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                toast({
                    variant: 'destructive',
                    title: 'Cancelled',
                    description: 'Passkey sign-in was cancelled.',
                });
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Sign-in failed',
                    description: err.message,
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handlePasskeyLogin();
    };

    // ── Collapsed state — just the button ─────────────────────────────────────
    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                className="passkey-btn flex items-center gap-2"
                title="Sign in with a registered passkey"
            >
                <Fingerprint className="h-4 w-4 text-indigo-500" />
                Sign in with Passkey
            </button>
        );
    }

    // ── Expanded state — email input + sign-in button ─────────────────────────
    return (
        <div className="w-full rounded-xl border border-indigo-200 dark:border-indigo-800
                    bg-gradient-to-b from-indigo-50/60 to-purple-50/60
                    dark:from-indigo-950/30 dark:to-purple-950/30
                    p-4 space-y-3 animate-in fade-in duration-200">

            <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-indigo-600" />
                <p className="text-sm font-semibold">Sign in with Passkey</p>
            </div>

            <div className="space-y-1.5">
                <Label htmlFor="passkey-email" className="text-xs">Email</Label>
                <Input
                    id="passkey-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="h-9 text-sm"
                />
            </div>

            <div className="flex gap-2">
                <Button
                    className="passkey-btn flex-1 gap-2"
                    disabled={!email.trim() || loading}
                    onClick={handlePasskeyLogin}
                >
                    {loading
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying…</>
                        : <><Fingerprint className="h-3.5 w-3.5" /> Continue</>
                    }
                </Button>

                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setExpanded(false)}
                    disabled={loading}
                >
                    Cancel
                </Button>
            </div>

            <p className="text-[11px] text-muted-foreground">
                You must have previously registered a passkey on this device.
            </p>
        </div>
    );
}
