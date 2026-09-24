"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GenderType } from "@/lib/types";
import { X, Lock, Mail, User, Briefcase, Key, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "register" | "changepassword" | "forgotpassword";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "signin"
}) => {
  const { login, register, changeUserPassword, requestForgotPassword, performResetPassword } = useAuth();

  const [mode, setMode] = useState<"signin" | "register" | "changepassword" | "forgotpassword" | "resetpassword">(
    initialMode
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [gender, setGender] = useState<GenderType>("Male");

  // Password Management Fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetCode, setResetCode] = useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();
    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ email, password });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();
    if (!fullName || !email || !password || !designation) {
      setErrorMsg("Please fill in all required registration fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ fullName, email, password, designation, gender });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Please complete all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await changeUserPassword({ currentPassword, newPassword });
      setSuccessMsg("Password updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Password change failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();
    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await requestForgotPassword({ email });
      if (res.resetCode) {
        setResetCode(res.resetCode);
        setSuccessMsg(`Reset code generated: ${res.resetCode}`);
      } else {
        setSuccessMsg("Reset instructions sent to your email.");
      }
      setMode("resetpassword");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to request password reset.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetForm();
    if (!email || !resetCode || !newPassword) {
      setErrorMsg("Please complete all reset password fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      await performResetPassword({ email, resetCode, newPassword });
      setSuccessMsg("Password reset successfully! You can now sign in.");
      setTimeout(() => {
        setMode("signin");
        setErrorMsg("");
        setSuccessMsg("");
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-800 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 leading-tight">
                {mode === "signin" && "Sign In to CabinetMap"}
                {mode === "register" && "Create Staff Account"}
                {mode === "changepassword" && "Change Account Password"}
                {mode === "forgotpassword" && "Forgot Password"}
                {mode === "resetpassword" && "Reset Password"}
              </h3>
              <p className="text-xs text-stone-500">HR & Admin File Tracking Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector for Sign In / Register */}
        {(mode === "signin" || mode === "register") && (
          <div className="flex border-b border-stone-200 bg-stone-100/60 p-1">
            <button
              onClick={() => { setMode("signin"); resetForm(); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "signin" ? "bg-white text-stone-900 shadow-xs font-bold" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); resetForm(); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "register" ? "bg-white text-stone-900 shadow-xs font-bold" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="font-bold">Error:</span> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. sara@company.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode("forgotpassword"); resetForm(); }}
                    className="text-[11px] text-amber-700 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Signing in..." : "Sign In to CabinetMap"}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sara Ahmed"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Designation / Role *</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior HR Manager / Admin Executive"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Gender *</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={gender === "Male"}
                      onChange={() => setGender("Male")}
                      className="accent-amber-600"
                    />
                    <span>Male 👨‍💼</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={gender === "Female"}
                      onChange={() => setGender("Female")}
                      className="accent-amber-600"
                    />
                    <span>Female 👩‍💼</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sara@company.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Password (Min. 6 chars) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Creating Account..." : "Complete Registration"}
              </button>
            </form>
          )}

          {/* CHANGE PASSWORD FORM */}
          {mode === "changepassword" && (
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Current Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">New Password *</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Confirm New Password *</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === "forgotpassword" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <p className="text-xs text-stone-600 leading-relaxed">
                Enter your registered HR account email address below to receive a password reset verification code.
              </p>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sara@company.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => { setMode("signin"); resetForm(); }}
                  className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Request Reset Code"}
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === "resetpassword" && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Reset Verification Code *</label>
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-lg font-mono text-center tracking-widest text-stone-900 font-bold focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Set New Password *</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => { setMode("signin"); resetForm(); }}
                  className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
