export type EffectiveTierResult = {
  effectiveTier: string;
  effectiveStatus: string;
  inGracePeriod: boolean;
};

export function resolveEffectiveTier(params: {
  subscriptionTier: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  gracePeriodUntil: string | null;
}): EffectiveTierResult {

  const {
    subscriptionTier,
    subscriptionStatus,
    currentPeriodEnd,
    gracePeriodUntil,
  } = params;

  const now = new Date();

  // =========================
  // ACTIVE SUBSCRIPTION
  // =========================
  if (subscriptionStatus === "active") {
    return {
      effectiveTier: subscriptionTier || "free",
      effectiveStatus: "active",
      inGracePeriod: false,
    };
  }

  // =========================
  // GRACE PERIOD
  // =========================
  if (
    gracePeriodUntil &&
    new Date(gracePeriodUntil) > now
  ) {
    return {
      effectiveTier: subscriptionTier || "free",
      effectiveStatus: "grace",
      inGracePeriod: true,
    };
  }

  // =========================
  // EXPIRED
  // =========================
  return {
    effectiveTier: "free",
    effectiveStatus: "expired",
    inGracePeriod: false,
  };
}