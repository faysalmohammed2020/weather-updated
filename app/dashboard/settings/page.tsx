//app/dashboard/settings
"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { changePassword, twoFactor, useSession } from "@/lib/auth-client";
import {
  PASSWORD_REQUIREMENTS,
  USER_ROLES,
  type UserRole,
} from "@/lib/constants/user-management";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  Shield,
  Settings as SettingsIcon,
  XCircle,
} from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PasswordCheck = {
  id: string;
  label: string;
  passed: boolean;
};

type PasswordStrength = {
  label: "Bad" | "Weak" | "Strong" | "Extra Strong";
  score: number;
  maxScore: number;
  barClassName: string;
  textClassName: string;
};

const FALLBACK_PASSWORD_LENGTH = 12;

const hasUppercase = (value: string) => /[A-Z]/.test(value);
const hasLowercase = (value: string) => /[a-z]/.test(value);
const hasNumber = (value: string) => /\d/.test(value);
const hasSymbol = (value: string) => /[^A-Za-z0-9]/.test(value);

function getPasswordChecks({
  currentPassword,
  newPassword,
  confirmPassword,
  minLength = FALLBACK_PASSWORD_LENGTH,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  minLength?: number;
}): PasswordCheck[] {
  return [
    {
      id: "length",
      label: `At least ${minLength} characters`,
      passed: newPassword.length >= minLength,
    },
    {
      id: "uppercase",
      label: "Contains uppercase letter",
      passed: hasUppercase(newPassword),
    },
    {
      id: "lowercase",
      label: "Contains lowercase letter",
      passed: hasLowercase(newPassword),
    },
    {
      id: "number",
      label: "Contains number",
      passed: hasNumber(newPassword),
    },
    {
      id: "symbol",
      label: "Contains symbol/special character",
      passed: hasSymbol(newPassword),
    },
    {
      id: "different",
      label: "Different from current password",
      passed:
        currentPassword.length > 0 &&
        newPassword.length > 0 &&
        newPassword !== currentPassword,
    },
    {
      id: "match",
      label: "Confirm password matches",
      passed:
        confirmPassword.length > 0 &&
        newPassword.length > 0 &&
        confirmPassword === newPassword,
    },
  ];
}

function getPasswordStrength(
  password: string,
  minLength: number,
): PasswordStrength {
  const maxScore = 6;
  const score = [
    password.length >= minLength,
    hasUppercase(password),
    hasLowercase(password),
    hasNumber(password),
    hasSymbol(password),
    password.length >= minLength + 4,
  ].filter(Boolean).length;

  if (score >= 6) {
    return {
      label: "Extra Strong",
      score,
      maxScore,
      barClassName: "bg-emerald-600",
      textClassName: "text-emerald-700",
    };
  }

  if (score >= 4) {
    return {
      label: "Strong",
      score,
      maxScore,
      barClassName: "bg-green-600",
      textClassName: "text-green-700",
    };
  }

  if (score >= 2) {
    return {
      label: "Weak",
      score,
      maxScore,
      barClassName: "bg-yellow-500",
      textClassName: "text-yellow-700",
    };
  }

  return {
    label: "Bad",
    score,
    maxScore,
    barClassName: "bg-red-500",
    textClassName: "text-red-600",
  };
}

const Settings = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Initialize all hooks first (before any conditional logic)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [setupStep, setSetupStep] = useState<"password" | "qrcode" | "verify">(
    "password",
  );
  const [totpUri, setTotpUri] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState("");
  const [isDisableLoading, setIsDisableLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTwoFactorPassword, setShowTwoFactorPassword] = useState(false);
  const [showDisablePassword, setShowDisablePassword] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    setTwoFactorEnabled(Boolean(session?.user?.twoFactorEnabled));
  }, [session?.user?.twoFactorEnabled]);

  if (isPending) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const roleLabel = String(session.user?.role || "observer")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const currentRole =
    ((session.user?.role as UserRole | undefined) ?? USER_ROLES.OBSERVER);
  const configuredMinPasswordLength =
    PASSWORD_REQUIREMENTS[currentRole] ?? FALLBACK_PASSWORD_LENGTH;
  const minPasswordLength = configuredMinPasswordLength;
  const passwordChecks = getPasswordChecks({
    currentPassword,
    newPassword,
    confirmPassword,
    minLength: minPasswordLength,
  });
  const allPasswordChecksPassed = passwordChecks.every((check) => check.passed);
  const isPasswordSubmitDisabled =
    isPasswordLoading ||
    !currentPassword ||
    !newPassword ||
    !confirmPassword ||
    !allPasswordChecksPassed;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    const failedPasswordCheck = getPasswordChecks({
      currentPassword,
      newPassword,
      confirmPassword,
      minLength: minPasswordLength,
    }).find((check) => !check.passed);

    if (failedPasswordCheck) {
      setPasswordError(`Password rule failed: ${failedPasswordCheck.label}`);
      return;
    }

    setIsPasswordLoading(true);
    setPasswordError("");

    try {
      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (!result.ok) {
        setPasswordError(result.error || "Failed to update password");
        return;
      }

      toast.success(result.message || "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleToggle2FA = async (checked: boolean) => {
    if (checked) {
      // If turning on 2FA, open the password dialog
      setIsDialogOpen(true);
    } else {
      // If turning off 2FA, open disable confirmation dialog
      setDisableDialogOpen(true);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      setDisableError("Password is required");
      return;
    }

    setIsDisableLoading(true);
    setDisableError("");

    try {
      const { error } = await twoFactor.disable({
        password: disablePassword,
      });

      if (error) {
        setDisableError(error.message || "Failed to disable 2FA");
      } else {
        toast.success("Two-factor authentication disabled successfully");
        setDisableDialogOpen(false);
        setDisablePassword("");
        setTwoFactorEnabled(false);
        router.refresh();
      }
    } catch (err: unknown) {
      setDisableError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsDisableLoading(false);
    }
  };

  const handleInitiate2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await twoFactor.enable({
        password,
      });

      if (error) {
        setError(error.message || "Failed to initiate 2FA setup");
      } else if (data) {
        // Store the TOTP URI and backup codes
        setTotpUri(data.totpURI);
        setBackupCodes(data.backupCodes || []);
        // Move to QR code scanning step
        setSetupStep("qrcode");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) {
      setError("Verification code is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error } = await twoFactor.verifyTotp({
        code: verificationCode,
      });

      if (error) {
        setError(error.message || "Failed to verify code");
      } else {
        toast.success("Two-factor authentication enabled successfully!");
        setIsDialogOpen(false);
        // Reset the setup state
        setSetupStep("password");
        setPassword("");
        setVerificationCode("");
        setTotpUri("");
        setTwoFactorEnabled(true);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-sm text-gray-500">{roleLabel}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Password</h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="flex items-start gap-3">
            <KeyRound className="h-5 w-5 mt-0.5 text-blue-600" />
            <div className="w-full space-y-4">
              <p className="text-sm text-gray-500">
                Change your own password. This works for root admin, super
                admin, station admin, and observer accounts.
              </p>

              <div className="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-700">
                <p className="font-medium text-sky-900">Password rules</p>
                <ul className="mt-2 space-y-1">
                  {passwordChecks.map((check) => (
                    <PasswordRuleItem key={check.id} check={check} />
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-500">
                  You cannot reuse any of your last 4 passwords.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <PasswordInputField
                    id="currentPassword"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    showPassword={showCurrentPassword}
                    onToggleVisibility={() =>
                      setShowCurrentPassword((prev) => !prev)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <PasswordInputField
                    id="newPassword"
                    value={newPassword}
                    onChange={setNewPassword}
                    showPassword={showNewPassword}
                    onToggleVisibility={() =>
                      setShowNewPassword((prev) => !prev)
                    }
                    placeholder={`At least ${minPasswordLength} characters`}
                  />
                  {newPassword && (
                    <PasswordStrengthIndicator
                      password={newPassword}
                      minLength={minPasswordLength}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInputField
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    showPassword={showConfirmPassword}
                    onToggleVisibility={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                  />
                  {confirmPassword && (
                    <p
                      className={`text-xs font-medium ${
                        confirmPassword === newPassword
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {confirmPassword === newPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}
                </div>
              </div>

              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isPasswordSubmitDisabled}>
                  {isPasswordLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Security</h2>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 mt-0.5 text-blue-600" />
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account by requiring a
                verification code
              </p>
            </div>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={handleToggle2FA}
            disabled={isLoading}
          />
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            // Reset state when dialog is closed
            setSetupStep("password");
            setPassword("");
            setVerificationCode("");
            setTotpUri("");
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {setupStep === "password" && "Enable Two-Factor Authentication"}
              {setupStep === "qrcode" && "Scan QR Code"}
              {setupStep === "verify" && "Verify Authentication Code"}
            </DialogTitle>
            <DialogDescription>
              {setupStep === "password" &&
                "Enter your password to enable two-factor authentication."}
              {setupStep === "qrcode" &&
                "Scan this QR code with your authenticator app."}
              {setupStep === "verify" &&
                "Enter the 6-digit code from your authenticator app."}
            </DialogDescription>
          </DialogHeader>

          {setupStep === "password" && (
            <form onSubmit={handleInitiate2FA}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInputField
                    id="password"
                    value={password}
                    onChange={setPassword}
                    showPassword={showTwoFactorPassword}
                    onToggleVisibility={() =>
                      setShowTwoFactorPassword((prev) => !prev)
                    }
                    placeholder="Enter your password"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
              </DialogFooter>
            </form>
          )}

          {setupStep === "qrcode" && (
            <div className="space-y-6">
              <div className="flex justify-center py-4">
                {totpUri && (
                  <div className="p-2 bg-white border rounded-md">
                    <QRCode value={totpUri} size={200} />
                  </div>
                )}
              </div>

              <p className="text-sm text-center text-gray-500">
                After scanning the QR code, your authenticator app will display
                a 6-digit code.
              </p>

              {backupCodes.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Backup Codes</h4>
                  <p className="text-xs text-gray-500 mb-2">
                    Save these backup codes in a secure place. You can use them
                    to sign in if you lose access to your authenticator app.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="text-xs font-mono bg-white p-1 border rounded"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setSetupStep("verify")}>
                  Continue to Verification
                </Button>
              </DialogFooter>
            </div>
          )}

          {setupStep === "verify" && (
            <form onSubmit={handleVerifyTotp}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSetupStep("qrcode")}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify & Enable 2FA"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog
        open={disableDialogOpen}
        onOpenChange={(open) => {
          setDisableDialogOpen(open);
          if (!open) {
            setDisablePassword("");
            setDisableError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your password to disable two-factor authentication. This
              will make your account less secure.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDisable2FA}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="disablePassword">Password</Label>
                <PasswordInputField
                  id="disablePassword"
                  value={disablePassword}
                  onChange={setDisablePassword}
                  showPassword={showDisablePassword}
                  onToggleVisibility={() =>
                    setShowDisablePassword((prev) => !prev)
                  }
                  placeholder="Enter your password"
                />
              </div>
              {disableError && (
                <p className="text-sm text-red-500">{disableError}</p>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDisableDialogOpen(false)}
                disabled={isDisableLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isDisableLoading}
              >
                {isDisableLoading ? "Disabling..." : "Disable 2FA"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function PasswordRuleItem({ check }: { check: PasswordCheck }) {
  return (
    <li
      className={`flex items-center gap-2 ${
        check.passed ? "text-green-700" : "text-slate-500"
      }`}
    >
      {check.passed ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 shrink-0 text-red-400" />
      )}
      <span>{check.label}</span>
    </li>
  );
}

function PasswordStrengthIndicator({
  password,
  minLength,
}: {
  password: string;
  minLength: number;
}) {
  const strength = getPasswordStrength(password, minLength);
  const progressPercent = Math.max(
    12,
    Math.round((strength.score / strength.maxScore) * 100),
  );

  return (
    <div className="space-y-1">
      <p className={`text-xs font-medium ${strength.textClassName}`}>
        Password strength: {strength.label}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${strength.barClassName}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}

function PasswordInputField({
  id,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

export default Settings;
