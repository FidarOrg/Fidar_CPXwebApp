/**
 * PasskeyBanner — Post-SAML Registration Prompt
 * -----------------------------------------------
 * Shown on /saml-dashboard after PingOne login.
 *
 * User identity comes from the URL param `?saml_email=...` (set by the
 * Express callback redirect). The email is stored in sessionStorage so
 * it survives a page refresh without re-authenticating.
 *
 * The WebAuthn registration requests include the email in the body so
 * the Express server can identify the user without a cross-origin cookie.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, X, Loader2, Fingerprint, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { base64urlToBuffer, bufferToBase64url } from '@/lib/webauthn';

export default function PasskeyBanner() {
    const [status, setStatus]           = useState('loading');
    const [registering, setRegistering] = useState(false);
    const [samlEmail, setSamlEmail]     = useState(null);
    const navigate = useNavigate();

    // ── Read user email from URL param or sessionStorage ─────────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlEmail = params.get('saml_email');

        if (urlEmail) {
            // Fresh SAML login — store and clean up URL
            sessionStorage.setItem('saml_email', urlEmail);
            setSamlEmail(urlEmail);
            // Remove the param from the URL without reloading
            const clean = window.location.pathname;
            window.history.replaceState({}, '', clean);
        } else {
            // Returning visit — check sessionStorage
            const stored = sessionStorage.getItem('saml_email');
            if (stored) {
                setSamlEmail(stored);
            } else {
                setStatus('dismissed'); // No SAML session at all — hide banner
                return;
            }
        }
    }, []);

    // ── Once we have the email, check if passkey already exists ───────────────
    useEffect(() => {
        if (!samlEmail) return;
        // Ask the backend about this user's passkey status
        fetch('/api/me', { credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.hasPasskey) {
                    setStatus('registered');
                } else {
                    setStatus('show');
                }
            })
            .catch(() => setStatus('show')); // If /api/me fails, still show the banner
    }, [samlEmail]);

    // ── Register passkey ───────────────────────────────────────────────────────
    const handleRegister = async () => {
        if (!navigator.credentials) {
            toast({ variant: 'destructive', title: 'Not Supported', description: 'Your browser does not support passkeys.' });
            return;
        }

        setRegistering(true);
        try {
            // 1. Get registration options — send email in body (no cross-origin cookie needed)
            const optRes = await fetch('/webauthn/register/options', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: samlEmail }),
            });

            if (!optRes.ok) {
                const err = await optRes.json().catch(() => ({ error: optRes.statusText }));
                throw new Error(err.error || 'Failed to get registration options');
            }

            const options = await optRes.json();
            const userId = options._userId; // echoed back from server

            // 2. Decode base64url fields for navigator.credentials
            const publicKeyOptions = {
                ...options,
                challenge: base64urlToBuffer(options.challenge),
                user: { ...options.user, id: base64urlToBuffer(options.user.id) },
                excludeCredentials: (options.excludeCredentials || []).map(c => ({
                    ...c, id: base64urlToBuffer(c.id),
                })),
            };

            // 3. Browser passkey dialog
            const cred = await navigator.credentials.create({ publicKey: publicKeyOptions });
            if (!cred) throw new Error('Registration cancelled');

            // 4. Send attestation to server — include _userId so verify can identify user
            const attResp = {
                id:     cred.id,
                rawId:  bufferToBase64url(cred.rawId),
                type:   cred.type,
                _userId: userId,
                response: {
                    attestationObject: bufferToBase64url(cred.response.attestationObject),
                    clientDataJSON:    bufferToBase64url(cred.response.clientDataJSON),
                    transports:        cred.response.getTransports?.() || [],
                },
                clientExtensionResults: cred.getClientExtensionResults?.() || {},
            };

            const verifyRes = await fetch('/webauthn/register/verify', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attResp),
            });

            const result = await verifyRes.json();

            if (result.verified) {
                // Allow user through ProtectedRoute on /dashboard
                localStorage.setItem('authToken', 'passkey-session');
                sessionStorage.setItem('passkeyRegistered', '1');
                setStatus('registered');
                toast({ title: '🗝️ Passkey registered!', description: 'You can now sign in with your passkey.' });
            } else {
                throw new Error(result.error || 'Verification failed');
            }
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                toast({ variant: 'destructive', title: 'Cancelled', description: 'Passkey registration was cancelled.' });
            } else {
                toast({ variant: 'destructive', title: 'Registration failed', description: err.message });
            }
        } finally {
            setRegistering(false);
        }
    };

    // ── Render states ──────────────────────────────────────────────────────────
    if (status === 'loading' || status === 'dismissed') return null;

    if (status === 'registered') {
        return (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800 px-5 py-4 mb-6">
                <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div className="flex-1">
                    <p className="text-sm text-green-800 dark:text-green-300 font-medium">
                        ✅ Passkey registered!
                        {samlEmail && <span className="ml-2 opacity-70 text-xs">({samlEmail})</span>}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                        Next time, use "Sign in with Passkey" on the Employee Login page.
                    </p>
                </div>
                <Button
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="bg-green-600 hover:bg-green-700 text-white gap-1.5 shrink-0"
                >
                    Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        );
    }

    // status === 'show'
    return (
        <div className="relative rounded-xl border border-indigo-200 dark:border-indigo-800
                    bg-gradient-to-r from-indigo-50 to-purple-50
                    dark:from-indigo-950/40 dark:to-purple-950/40
                    px-5 py-4 mb-6 overflow-hidden">

            {/* Dismiss */}
            <button
                onClick={() => setStatus('dismissed')}
                className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Dismiss"
            >
                <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
                <div className="shrink-0 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 p-2.5">
                    <Fingerprint className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Register a Passkey</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Sign in faster next time using Face ID, Touch ID, or your device PIN.
                        {samlEmail && <span className="ml-1 font-medium">Account: {samlEmail}</span>}
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
                        <p className="text-xs text-muted-foreground">Secured with FIDO2 / WebAuthn</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
