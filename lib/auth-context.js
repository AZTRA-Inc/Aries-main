"use client";

// ═══════════════════════════════════════
// Auth Context — Centralized auth state
// ═══════════════════════════════════════

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { initAuth, getSession, signOut as authSignOut } from "./auth";

const AuthContext = createContext(null);

// Session idle timeout: 30 minutes (PenTest requirement)
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
// Token refresh interval: 10 minutes
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const idleTimerRef = useRef(null);
  const refreshTimerRef = useRef(null);

  // ─── Sign Out ───
  const handleSignOut = useCallback(async function () {
    try {
      await authSignOut();
    } catch (e) {
      // swallow
    }
    setUser(null);
    // Clear all timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
  }, []);

  // ─── Idle Timeout Reset ───
  const resetIdleTimer = useCallback(
    function () {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(function () {
        // Auto sign-out after 30 min inactivity
        handleSignOut();
      }, IDLE_TIMEOUT_MS);
    },
    [handleSignOut]
  );

  // ─── Check Session on Mount ───
  const checkSession = useCallback(async function () {
    try {
      await initAuth();
      const session = await getSession();
      if (session) {
        setUser(session);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(function () {
    checkSession();
  }, [checkSession]);

  // ─── Setup Idle Timeout + Token Refresh ───
  useEffect(
    function () {
      if (!user) return;

      // Start idle timer
      resetIdleTimer();

      // Listen for user activity
      var events = ["mousedown", "keydown", "scroll", "touchstart"];
      function onActivity() {
        resetIdleTimer();
      }
      events.forEach(function (ev) {
        window.addEventListener(ev, onActivity, { passive: true });
      });

      // Auto-refresh tokens every 10 min
      refreshTimerRef.current = setInterval(async function () {
        try {
          var session = await getSession();
          if (session) {
            setUser(session);
          } else {
            handleSignOut();
          }
        } catch {
          handleSignOut();
        }
      }, REFRESH_INTERVAL_MS);

      return function () {
        events.forEach(function (ev) {
          window.removeEventListener(ev, onActivity);
        });
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      };
    },
    [user, resetIdleTimer, handleSignOut]
  );

  // ─── Refresh User (call after sign-in) ───
  var refreshUser = useCallback(async function () {
    try {
      var session = await getSession();
      if (session) {
        setUser(session);
      }
    } catch {
      // swallow
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: user,
        loading: loading,
        signOut: handleSignOut,
        refreshUser: refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  var ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
