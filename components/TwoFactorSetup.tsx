"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { useSession, twoFactor } from "@/lib/auth-client";

interface TwoFactorSetupData {
  uri: string;
}

export function TwoFactorSetup() {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);

  const { data } = useSession();
  const user = data?.user;

  const startSetup = async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      // Note: This would need a password in a real implementation
      const { data, error } = await twoFactor.enable({
        password: "", // You'll need to add a password input field
      });
      
      if (error) {
        setError(error.message || "Failed to start 2FA setup");
      } else if (data) {
        setSetupData({
          uri: data.totpURI,
        });
      }
    } catch (err) {
      setError("Failed to start 2FA setup");
    } finally {
      setLoading(false);
    }
  };

  const verifySetup = async () => {
    if (!code) {
      setError("Please enter the verification code");
      return;
    }
    
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { error } = await twoFactor.verifyTotp({
        code,
      });

      if (error) {
        setError(error.message || "Invalid code. Please try again.");
      } else {
        toast.success("2FA setup completed successfully!");
        // Optionally reset the setup data
        setSetupData(null);
        setCode("");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Two-Factor Authentication Setup
      </h2>

      {!setupData ? (
        <div className="space-y-4">
          <p>Click the button below to start 2FA setup.</p>
          <Button onClick={startSetup} disabled={loading}>
            {loading ? "Preparing setup..." : "Start 2FA Setup"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p>Scan this QR code with your authenticator app:</p>

          <div className="p-4 bg-white border rounded-md inline-block">
            <QRCode value={setupData.uri} size={200} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code from your app"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button onClick={verifySetup} disabled={loading}>
            {loading ? "Verifying..." : "Verify and Enable 2FA"}
          </Button>
        </div>
      )}
    </div>
  );
}
