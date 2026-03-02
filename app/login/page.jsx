"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { colors } from "@/lib/tokens";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setTimeout(function () {
      localStorage.setItem("aries_auth", "true");
      router.push("/");
    }, 600);
  }

  function handleSSO(provider) {
    setLoading(true);
    setTimeout(function () {
      localStorage.setItem("aries_auth", "true");
      router.push("/");
    }, 600);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: colors.canvas }}
    >
      <div
        className="w-full max-w-[400px] mx-4"
        style={{
          background: colors.bg,
          borderRadius: 16,
          border: "1px solid " + colors.border,
          boxShadow: "0 12px 36px rgba(15,23,42,0.08), 0 4px 12px rgba(15,23,42,0.04)",
        }}
      >
        {/* Header / Branding */}
        <div className="flex flex-col items-center pt-10 pb-2 px-10">
          <div className="flex items-center gap-2.5 mb-6">
            {/* Aries zodiac sign in dark box */}
            <div
              className="w-[36px] h-[36px] rounded-lg flex items-center justify-center"
              style={{ background: colors.t1 }}
            >
              <svg
                width="22"
                height="22"
                viewBox="-1 -2 26 26"
                fill="none"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 23V13" />
                <path d="M12 13 C5 3, -3 1, -1 7 C1 13, 8 13, 10 6" />
                <path d="M12 13 C19 3, 27 1, 25 7 C23 13, 16 13, 14 6" />
              </svg>
            </div>
            {/* Aries SVG wordmark */}
            <svg
              width="90"
              height="36"
              viewBox="0 0 441 179"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 179V175.947L19.0852 117.947L44.2903 5H49.9032L75.1613 117.947L89.1935 175.947V179"
                stroke={colors.t1}
                strokeWidth="8.41935"
              />
              <path
                d="M12 144C23.5789 122.917 50.7895 80.2 67 78"
                stroke={colors.t1}
                strokeWidth="7"
              />
              <path
                d="M118.87 178.999V109.239M118.87 70.0293V109.239M118.87 109.239C118.87 109.239 123.402 98.0572 127.289 91.7988C131.176 85.5404 133.24 82.3117 138.515 78.4487C143.789 74.5856 146.978 73.3182 152.547 72.8357C158.116 72.3533 162.542 73.2528 166.579 75.6422C170.617 78.0316 173.371 79.8458 174.999 84.0616C176.627 88.2773 177.805 92.4809 174.999 98.0938C172.192 103.707 166.579 106.513 166.579 106.513"
                stroke={colors.t1}
                strokeWidth="8.98065"
              />
              <path
                d="M191.733 176.225V70.7025H201.162V176.225H191.733ZM196.447 42.638C194.352 42.638 192.631 42.0393 191.284 40.8419C190.086 39.6445 189.487 38.0728 189.487 36.127C189.487 34.1812 190.086 32.6096 191.284 31.4122C192.631 30.2148 194.352 29.6161 196.447 29.6161C198.543 29.6161 200.189 30.2148 201.387 31.4122C202.734 32.6096 203.407 34.1812 203.407 36.127C203.407 38.0728 202.734 39.6445 201.387 40.8419C200.189 42.0393 198.543 42.638 196.447 42.638ZM276.731 178.47C266.553 178.47 257.498 176.225 249.565 171.735C241.782 167.244 235.645 160.883 231.155 152.651C226.814 144.419 224.644 134.69 224.644 123.464C224.644 112.238 226.814 102.509 231.155 94.2767C235.645 86.0445 241.632 79.6832 249.116 75.1928C256.6 70.7025 265.056 68.4574 274.486 68.4574C284.515 68.4574 293.046 70.5528 300.081 74.7438C307.265 78.9348 312.729 84.4728 316.471 91.358C320.213 98.0935 322.084 105.577 322.084 113.81C322.084 115.905 321.784 118.075 321.185 120.321C320.587 122.566 319.988 124.362 319.389 125.709H234.522C234.672 134.839 236.543 142.772 240.135 149.508C243.877 156.093 248.891 161.183 255.178 164.775C261.614 168.217 268.948 169.939 277.18 169.939C284.664 169.939 291.175 168.741 296.713 166.346C302.401 163.952 307.789 160.509 312.878 156.019L317.593 163.203C312.205 168.292 306.218 172.109 299.632 174.653C293.046 177.198 285.413 178.47 276.731 178.47ZM234.522 117.177H311.531C311.831 116.728 311.98 116.13 311.98 115.381C312.13 114.633 312.205 113.959 312.205 113.361C312.205 106.326 310.708 100.114 307.715 94.7257C304.871 89.3374 300.68 85.0716 295.142 81.9283C289.604 78.7851 282.718 77.2135 274.486 77.2135C267.751 77.2135 261.464 78.7851 255.627 81.9283C249.939 85.0716 245.149 89.6367 241.258 95.6238C237.516 101.461 235.271 108.646 234.522 117.177ZM379.688 178.47C371.904 178.47 364.72 177.198 358.134 174.653C351.548 171.959 345.187 168.217 339.05 163.428L344.214 155.794C350.351 160.434 356.188 163.952 361.726 166.346C367.264 168.741 373.326 169.939 379.912 169.939C390.39 169.939 398.173 167.918 403.262 163.877C408.351 159.686 410.895 154.297 410.895 147.712C410.895 142.473 409.474 138.432 406.63 135.588C403.935 132.744 398.772 130.648 391.138 129.301L368.686 125.035C360.005 123.389 353.419 120.47 348.929 116.279C344.588 111.939 342.418 106.401 342.418 99.6651C342.418 93.9774 343.84 88.8135 346.684 84.1735C349.677 79.3838 353.943 75.567 359.481 72.7232C365.169 69.8793 371.979 68.4574 379.912 68.4574C387.546 68.4574 394.581 69.7296 401.017 72.2741C407.453 74.669 412.916 77.887 417.406 81.9283L412.243 89.3374C407.902 85.5954 403.037 82.6767 397.649 80.5812C392.261 78.3361 386.423 77.2135 380.137 77.2135C371.605 77.2135 364.795 79.2341 359.706 83.2754C354.766 87.167 352.297 92.4806 352.297 99.2161C352.297 103.557 353.719 107.149 356.563 109.993C359.556 112.687 364.346 114.633 370.932 115.83L393.383 120.096C402.064 121.743 408.8 124.586 413.59 128.628C418.379 132.669 420.774 138.881 420.774 147.263C420.774 156.543 417.257 164.101 410.222 169.939C403.187 175.626 393.009 178.47 379.688 178.47Z"
                fill={colors.t1}
              />
            </svg>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-10 pb-4">
          {/* Email */}
          <div className="mb-4">
            <label
              className="block text-[11px] font-medium mb-1.5"
              style={{ color: colors.t2 }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={function (e) { setEmail(e.target.value); }}
              placeholder="you@company.com"
              className="w-full px-3 py-[9px] text-xs outline-none rounded-md transition-all"
              style={{
                border: "1px solid " + colors.border,
                background: colors.surface,
                color: colors.t1,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
              onFocus={function (e) {
                e.currentTarget.style.borderColor = colors.t3;
                e.currentTarget.style.boxShadow = "0 0 0 3px " + colors.border;
              }}
              onBlur={function (e) {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label
                className="text-[11px] font-medium"
                style={{ color: colors.t2 }}
              >
                Password
              </label>
              <button
                type="button"
                className="text-[11px] bg-transparent border-none cursor-pointer"
                style={{ color: colors.blue }}
                onClick={function () {}}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={function (e) { setPassword(e.target.value); }}
                placeholder="Enter your password"
                className="w-full px-3 py-[9px] pr-10 text-xs outline-none rounded-md transition-all"
                style={{
                  border: "1px solid " + colors.border,
                  background: colors.surface,
                  color: colors.t1,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
                onFocus={function (e) {
                  e.currentTarget.style.borderColor = colors.t3;
                  e.currentTarget.style.boxShadow = "0 0 0 3px " + colors.border;
                }}
                onBlur={function (e) {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <button
                type="button"
                onClick={function () { setShowPw(!showPw); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1"
                style={{ color: colors.t4 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPw ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-[11px] mb-3" style={{ color: colors.red }}>
              {error}
            </p>
          )}

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-[10px] text-xs font-semibold rounded-md transition-all cursor-pointer"
            style={{
              background: colors.t1,
              color: "#FFFFFF",
              border: "none",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={function (e) {
              if (!loading) e.currentTarget.style.background = colors.t2;
            }}
            onMouseLeave={function (e) {
              e.currentTarget.style.background = colors.t1;
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 px-10 py-3">
          <div className="flex-1 h-px" style={{ background: colors.border }} />
          <span className="text-[10px] font-medium" style={{ color: colors.t4 }}>
            OR CONTINUE WITH
          </span>
          <div className="flex-1 h-px" style={{ background: colors.border }} />
        </div>

        {/* SSO Buttons */}
        <div className="px-10 pb-4 flex gap-3">
          {/* Google */}
          <button
            onClick={function () { handleSSO("google"); }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-[9px] text-xs font-medium rounded-md transition-all cursor-pointer"
            style={{
              background: colors.bg,
              border: "1px solid " + colors.border,
              color: colors.t2,
            }}
            onMouseEnter={function (e) {
              e.currentTarget.style.background = colors.canvas;
              e.currentTarget.style.borderColor = colors.borderH;
            }}
            onMouseLeave={function (e) {
              e.currentTarget.style.background = colors.bg;
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.79.42 3.49 1.18 5l3.66-2.84v-.07z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </button>

          {/* Microsoft */}
          <button
            onClick={function () { handleSSO("microsoft"); }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-[9px] text-xs font-medium rounded-md transition-all cursor-pointer"
            style={{
              background: colors.bg,
              border: "1px solid " + colors.border,
              color: colors.t2,
            }}
            onMouseEnter={function (e) {
              e.currentTarget.style.background = colors.canvas;
              e.currentTarget.style.borderColor = colors.borderH;
            }}
            onMouseLeave={function (e) {
              e.currentTarget.style.background = colors.bg;
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <rect x="1" y="1" width="10" height="10" fill="#F25022" />
              <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
              <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
              <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
            </svg>
            Microsoft
          </button>
        </div>

        {/* Footer */}
        <div
          className="text-center py-5 text-[11px] mx-10"
          style={{ borderTop: "1px solid " + colors.border, color: colors.t3 }}
        >
          Don&apos;t have an account?{" "}
          <button
            className="bg-transparent border-none cursor-pointer font-medium"
            style={{ color: colors.blue }}
            onClick={function () {}}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
