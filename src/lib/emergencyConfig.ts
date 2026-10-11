/**
 * @fileOverview Configurable Emergency and Crisis Support Contacts for ManoMed AI.
 * 
 * TODO: CLINICAL REVIEW REQUIRED — Emergency contact numbers and crisis intervention resources
 * must be verified by local clinical authorities and adjusted according to patient jurisdiction.
 */

export interface EmergencyRegion {
  region: string;
  number: string;
  desc: string;
}

export interface EmergencyConfig {
  /**
   * Phone number for medical emergencies (e.g., 911, 999, 112).
   * Leave blank/unset to default to generic local wording ("your local emergency services").
   */
  medicalEmergencyNumber?: string;

  /**
   * Accessible display label for the medical emergency contact.
   */
  medicalEmergencyLabel: string;

  /**
   * Phone number or text shortcode for suicide/mental health crisis support (e.g., 988 in the US/Canada).
   * Leave blank/unset to default to supportive helpline referral.
   */
  crisisSupportNumber?: string;

  /**
   * Accessible display label for crisis support.
   */
  crisisSupportLabel: string;

  /**
   * Direct URL to international crisis resources (e.g., Find A Helpline).
   */
  crisisSupportUrl: string;

  /**
   * Generic safety-net fallback text for crisis or emergency.
   */
  crisisFallbackText: string;

  /**
   * Multi-jurisdiction emergency and crisis reference list.
   */
  internationalRegions: EmergencyRegion[];
}

export const emergencyConfig: EmergencyConfig = {
  // Configurable via environment variables if defined, otherwise undefined (triggers generic wording)
  medicalEmergencyNumber: process.env.NEXT_PUBLIC_EMERGENCY_PHONE || undefined,
  medicalEmergencyLabel: process.env.NEXT_PUBLIC_EMERGENCY_LABEL || "Local Emergency Services",
  crisisSupportNumber: process.env.NEXT_PUBLIC_CRISIS_PHONE || undefined,
  crisisSupportLabel: process.env.NEXT_PUBLIC_CRISIS_LABEL || "Crisis Support Helpline",
  crisisSupportUrl: process.env.NEXT_PUBLIC_CRISIS_URL || "https://findahelpline.com/",
  crisisFallbackText: "If you or someone you know is experiencing acute distress or danger, please contact your local emergency services or a crisis helpline immediately.",
  internationalRegions: [
    { region: "International Emergency (GSM)", number: "112", desc: "Standard Emergency Services" },
    { region: "United States & Canada", number: "911 / 988", desc: "Emergency / Suicide & Crisis Lifeline" },
    { region: "United Kingdom", number: "999 / 111", desc: "Emergency / NHS Urgent Advice" },
    { region: "European Union", number: "112", desc: "Pan-European Emergency" },
    { region: "Australia", number: "000 / 13 11 14", desc: "Emergency / Lifeline Australia" },
    { region: "International Crisis Directory", number: "findahelpline.com", desc: "Free, Confidential Global Helplines" },
  ],
};

/**
 * Returns jurisdiction-neutral or configured emergency contact information.
 */
export function getEmergencyDisplay(): { label: string; href: string; shortLabel: string } {
  if (emergencyConfig.medicalEmergencyNumber) {
    return {
      label: `Call ${emergencyConfig.medicalEmergencyNumber}`,
      href: `tel:${emergencyConfig.medicalEmergencyNumber}`,
      shortLabel: emergencyConfig.medicalEmergencyNumber,
    };
  }
  return {
    label: "Local Emergency Services",
    href: "tel:112",
    shortLabel: "Emergency",
  };
}

/**
 * Returns jurisdiction-neutral or configured crisis contact information.
 */
export function getCrisisDisplay(): { label: string; href: string } {
  if (emergencyConfig.crisisSupportNumber) {
    return {
      label: `Crisis Support: ${emergencyConfig.crisisSupportNumber}`,
      href: `tel:${emergencyConfig.crisisSupportNumber}`,
    };
  }
  return {
    label: "Crisis Support Directory (findahelpline.com)",
    href: emergencyConfig.crisisSupportUrl,
  };
}
