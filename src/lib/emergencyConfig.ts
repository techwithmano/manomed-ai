/**
 * @fileOverview Configurable Emergency and Crisis Support Contacts for ManoMed AI.
 * 
 * TODO: CLINICAL REVIEW REQUIRED — Emergency contact numbers and crisis intervention resources
 * must be verified by local clinical authorities and adjusted according to patient jurisdiction.
 */

export interface EmergencyConfig {
  /**
   * Phone number for medical emergencies (e.g., 911, 999, 112).
   * Leave blank/unset to default to generic local wording ("your local emergency services").
   */
  medicalEmergencyNumber?: string;

  /**
   * Phone number or text shortcode for suicide/mental health crisis support (e.g., 988 in the US/Canada).
   * Leave blank/unset to default to supportive helpline referral.
   */
  crisisSupportNumber?: string;

  /**
   * Direct URL to international crisis resources (e.g., Find A Helpline).
   */
  crisisSupportUrl: string;
}

export const emergencyConfig: EmergencyConfig = {
  // Configurable via environment variables if defined, otherwise undefined (triggers generic wording)
  medicalEmergencyNumber: process.env.NEXT_PUBLIC_EMERGENCY_PHONE || undefined,
  crisisSupportNumber: process.env.NEXT_PUBLIC_CRISIS_PHONE || undefined,
  crisisSupportUrl: process.env.NEXT_PUBLIC_CRISIS_URL || "https://findahelpline.com/",
};
