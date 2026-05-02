"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface StudentLoginProps {
  onLogin: (name: string, rollNumber: string) => void;
  bypassRosterValidation?: (name: string, rollNumber: string) => boolean;
}

export function StudentLogin({
  onLogin,
  bypassRosterValidation,
}: StudentLoginProps) {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !rollNumber.trim()) {
      setError("Please enter both name and roll number");
      return;
    }

    setIsSubmitting(true);
    try {
      if (bypassRosterValidation?.(name, rollNumber)) {
        onLogin(name, rollNumber);
        return;
      }

      const response = await fetch("/api/students/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rollNumber,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      onLogin(data.name, data.rollNumber);
    } catch (error) {
      console.error("Error validating login:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-center">
        Student Login
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Roll Number</label>
          <Input
            type="text"
            placeholder="Enter your roll number"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Checking..." : "Login"}
        </Button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-4">
        This device will be locked to your account. Use this device to scan attendance QR codes.
      </p>
    </Card>
  );
}
