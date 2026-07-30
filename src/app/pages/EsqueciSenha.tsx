import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "../components/ui/input-otp";
import { useAuthApi, useSanctumApi } from "../hooks/api/entities";
import { ApiError } from "../hooks/api/config/httpClient";
import { shake, useMorphButton, type SubmitState } from "../hooks/useFormSubmitAnimation";
import { toast } from "sonner";

type Step = 1 | 2 | 3;

function extractApiErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        const data = error.data;

        if (typeof data === "string" && data.trim().length > 0) {
            return data;
        }

        if (data && typeof data === "object") {
            const record = data as Record<string, unknown>;

            if (typeof record.message === "string" && record.message.trim().length > 0) {
                return record.message;
            }

            const errors = record.errors;
            if (errors && typeof errors === "object") {
                const firstError = Object.values(errors as Record<string, unknown>).find((value) => {
                    if (typeof value === "string") return true;
                    return Array.isArray(value) && typeof value[0] === "string";
                });

                if (typeof firstError === "string") {
                    return firstError;
                }

                if (Array.isArray(firstError) && typeof firstError[0] === "string") {
                    return firstError[0];
                }
            }
        }
    }

    return fallback;
}

export function EsqueciSenha() {
    const [step, setStep] = useState<Step>(1);
    const [email, setEmail] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [sendEmailState, setSendEmailState] = useState<SubmitState>("idle");
    const [validatePinState, setValidatePinState] = useState<SubmitState>("idle");
    const [resetPasswordState, setResetPasswordState] = useState<SubmitState>("idle");

    const authApi = useMemo(() => useAuthApi(), []);
    const sanctumApi = useMemo(() => useSanctumApi(), []);
    const navigate = useNavigate();
    const cardRef = useRef<HTMLDivElement>(null);
    const { shakeCard } = shake(cardRef, String(step));
    const { morphStyle: sendEmailMorphStyle, morphContent: sendEmailMorphContent } = useMorphButton(sendEmailState, <span>Enviar codigo</span>);
    const { morphStyle: validatePinMorphStyle, morphContent: validatePinMorphContent } = useMorphButton(validatePinState, <span>Confirmar pin</span>);
    const { morphStyle: resetPasswordMorphStyle, morphContent: resetPasswordMorphContent } = useMorphButton(resetPasswordState, <span>Atualizar senha</span>);

    const handleBack = () => {
        if (step === 1) {
            navigate("/");
            return;
        }

        setStep((current) => (current === 3 ? 2 : 1));
    };

    const triggerError = (setState: (state: SubmitState) => void) => {
        setState("error");
        shakeCard();
        setTimeout(() => setState("idle"), 1500);
    };

    const handleSendEmail = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Informe seu e-mail.");
            triggerError(setSendEmailState);
            return;
        }

        setSendEmailState("loading");
        try {
            await sanctumApi.csrfCookie();
            const response = await authApi.forgotPassword({ email: email.trim() });
            toast.success(response.message || "Codigo enviado para seu e-mail.");
            setSendEmailState("success");
            setTimeout(() => {
                setSendEmailState("idle");
                setStep(2);
            }, 600);
        } catch (error) {
            toast.error(extractApiErrorMessage(error, "Nao foi possivel enviar o codigo."));
            triggerError(setSendEmailState);
        }
    };

    const handleValidatePin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pinCode.trim()) {
            toast.error("Informe o pincode recebido.");
            triggerError(setValidatePinState);
            return;
        }

        setValidatePinState("loading");
        try {
            await sanctumApi.csrfCookie();
            const response = await authApi.validateResetPin({
                email: email.trim(),
                pin_code: pinCode.trim(),
            });
            toast.success(response.message || "Pincode validado.");
            setValidatePinState("success");
            setTimeout(() => {
                setValidatePinState("idle");
                setStep(3);
            }, 600);
        } catch (error) {
            toast.error(extractApiErrorMessage(error, "Pincode invalido ou expirado."));
            triggerError(setValidatePinState);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Preencha os campos de senha.");
            triggerError(setResetPasswordState);
            return;
        }

        if (password !== confirmPassword) {
            toast.error("As senhas nao coincidem.");
            triggerError(setResetPasswordState);
            return;
        }

        setResetPasswordState("loading");
        try {
            await sanctumApi.csrfCookie();
            const response = await authApi.resetPassword({
                email: email.trim(),
                pin_code: pinCode.trim(),
                password,
            });
            toast.success(response.message || "Senha atualizada com sucesso.");
            setResetPasswordState("success");
            setTimeout(() => navigate("/"), 700);
        } catch (error) {
            toast.error(extractApiErrorMessage(error, "Nao foi possivel atualizar sua senha."));
            triggerError(setResetPasswordState);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-sidebar to-background flex items-center justify-center p-4">
            <div ref={cardRef} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-foreground">Recuperar senha</h1>
                    <Button
                        type="button"
                        variant="link"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1 p-0 h-auto"
                        onClick={handleBack}
                    >
                        <ArrowLeft className="h-4 w-4" /> Voltar
                    </Button>
                </div>

                <div className="mb-5 text-xs text-muted-foreground">
                    Passo {step} de 3
                </div>

                {step === 1 && (
                    <form className="space-y-4" onSubmit={handleSendEmail}>
                        <div className="form-field space-y-1.5">
                            <Label>E-mail</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    className="pl-9 rounded-xl bg-muted"
                                />
                            </div>
                        </div>
                        <div className="form-field flex justify-center">
                            <Button
                                type="submit"
                                className="form-field w-full rounded-xl overflow-hidden"
                                disabled={sendEmailState !== "idle"}
                                style={sendEmailMorphStyle}
                            >
                                {sendEmailMorphContent}
                            </Button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <form className="space-y-4" onSubmit={handleValidatePin}>
                        <div className="form-field space-y-1.5">
                            <Label>Pincode</Label>
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={pinCode}
                                    onChange={setPinCode}
                                    containerClassName="justify-center"
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                    </InputOTPGroup>
                                    <InputOTPSeparator />
                                    <InputOTPGroup>
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                        </div>
                        <div className="form-field flex justify-center">
                            <Button
                                type="submit"
                                className="rounded-xl overflow-hidden"
                                disabled={validatePinState !== "idle"}
                                style={validatePinMorphStyle}
                            >
                                {validatePinMorphContent}
                            </Button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <form className="space-y-4" onSubmit={handleResetPassword}>
                        <div className="form-field rounded-xl border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                            E-mail: <span className="font-medium text-foreground">{email}</span>
                        </div>
                        <div className="form-field space-y-1.5">
                            <Label>Nova senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-9 rounded-xl bg-muted"
                                />
                            </div>
                        </div>
                        <div className="form-field space-y-1.5">
                            <Label>Confirmar senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-9 rounded-xl bg-muted"
                                />
                            </div>
                        </div>
                        <div className="form-field flex justify-center">
                            <Button
                                type="submit"
                                className="rounded-xl overflow-hidden"
                                disabled={resetPasswordState !== "idle"}
                                style={resetPasswordMorphStyle}
                            >
                                {resetPasswordMorphContent}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
