/**
 * @fileOverview Episodes Management & Suggest-and-Confirm Grouping.
 * 
 * Stores user-managed health episodes in localStorage under 'manomed_episodes_v1'.
 * Supports versioned migration so existing individual records continue working.
 * 
 * Strict clinical requirements:
 * 1. Suggest-and-confirm: Suggestions are presented for user review. Never merge silently.
 * 2. Episode titles come strictly from the user's own chief complaint or dates (never AI diagnoses).
 * 3. Local-only: No network or cloud writes.
 */

import { SavedAssessmentSummary } from '@/lib/assessment-store';

export const STORAGE_KEY_EPISODES = 'manomed_episodes_v1';

export interface Episode {
  id: string;
  title: string;
  patientName: string;
  createdAt: string;
  updatedAt: string;
  assessmentIds: string[];
}

export interface SuggestedEpisode {
  id: string;
  suggestedTitle: string;
  patientName: string;
  assessmentIds: string[];
  dateSpanSummary: string;
  assessmentsCount: number;
}

/**
 * Reads all user-confirmed episodes from localStorage.
 */
export function getEpisodes(): Episode[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EPISODES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to read episodes from localStorage:', err);
    return [];
  }
}

/**
 * Saves or updates an episode in localStorage.
 */
export function saveEpisode(episode: Episode): void {
  if (typeof window === 'undefined') return;
  try {
    const episodes = getEpisodes();
    const existingIndex = episodes.findIndex((e) => e.id === episode.id);
    const updated = [...episodes];
    if (existingIndex >= 0) {
      updated[existingIndex] = { ...episode, updatedAt: new Date().toISOString() };
    } else {
      updated.unshift({ ...episode, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEY_EPISODES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save episode:', err);
  }
}

/**
 * Removes an episode, returning its assessments to ungrouped status.
 */
export function deleteEpisode(episodeId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const episodes = getEpisodes();
    const updated = episodes.filter((e) => e.id !== episodeId);
    localStorage.setItem(STORAGE_KEY_EPISODES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete episode:', err);
  }
}

/**
 * Updates an episode's title.
 */
export function renameEpisode(episodeId: string, newTitle: string): void {
  if (typeof window === 'undefined' || !newTitle.trim()) return;
  try {
    const episodes = getEpisodes();
    const updated = episodes.map((e) =>
      e.id === episodeId ? { ...e, title: newTitle.trim(), updatedAt: new Date().toISOString() } : e
    );
    localStorage.setItem(STORAGE_KEY_EPISODES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to rename episode:', err);
  }
}

/**
 * Removes an assessment from an episode. If no assessments remain, deletes the episode.
 */
export function removeAssessmentFromEpisode(episodeId: string, assessmentId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const episodes = getEpisodes();
    const target = episodes.find((e) => e.id === episodeId);
    if (!target) return;

    const remainingIds = target.assessmentIds.filter((id) => id !== assessmentId);
    if (remainingIds.length === 0) {
      deleteEpisode(episodeId);
    } else {
      saveEpisode({
        ...target,
        assessmentIds: remainingIds,
      });
    }
  } catch (err) {
    console.error('Failed to remove assessment from episode:', err);
  }
}

/**
 * Generates an episode title using the patient's own words (chief complaint).
 * RULE: NEVER uses AI condition names or diagnostic titles.
 */
export function generateDefaultEpisodeTitle(
  firstAssessmentDate: string,
  primarySymptoms?: string
): string {
  const d = new Date(firstAssessmentDate);
  const formattedDate = !isNaN(d.getTime())
    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'recent date';

  if (primarySymptoms && primarySymptoms.trim()) {
    // Truncate user's chief complaint narrative to ~35 characters
    const cleanComplaint = primarySymptoms.replace(/[\n\r]+/g, ' ').trim();
    const snippet =
      cleanComplaint.length > 35 ? `${cleanComplaint.slice(0, 32)}...` : cleanComplaint;
    return `Symptom check: "${snippet}", started ${formattedDate}`;
  }

  return `Symptom check, started ${formattedDate}`;
}

/**
 * Scans assessments to suggest potential episode groupings.
 * 
 * Rules:
 * - Only suggests assessments NOT currently part of any confirmed episode.
 * - Same patient name (case-insensitive).
 * - Dates within 14 days of each other.
 * - Requires at least 2 matching assessments.
 * - NEVER merges silently — caller displays suggest-and-confirm UI.
 */
export function detectSuggestedEpisodes(
  assessments: SavedAssessmentSummary[],
  confirmedEpisodes: Episode[],
  dismissedSuggestionIds: string[] = []
): SuggestedEpisode[] {
  // Collect all already grouped assessment IDs
  const assignedIds = new Set<string>();
  for (const ep of confirmedEpisodes) {
    for (const id of ep.assessmentIds) {
      assignedIds.add(id);
    }
  }

  // Filter to ungrouped assessments
  const ungrouped = assessments.filter((a) => !assignedIds.has(a.id));
  if (ungrouped.length < 2) return [];

  // Group by patient name
  const byPatient = new Map<string, SavedAssessmentSummary[]>();
  for (const item of ungrouped) {
    const nameKey = (item.patientName || 'Anonymous').trim().toLowerCase();
    const current = byPatient.get(nameKey) || [];
    current.push(item);
    byPatient.set(nameKey, current);
  }

  const suggestions: SuggestedEpisode[] = [];

  for (const [, patientItems] of byPatient.entries()) {
    if (patientItems.length < 2) continue;

    // Sort chronologically ascending
    const sorted = [...patientItems].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group items within a 14-day window
    let currentCluster: SavedAssessmentSummary[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prevTime = new Date(currentCluster[currentCluster.length - 1].date).getTime();
      const currTime = new Date(sorted[i].date).getTime();
      const diffDays = Math.abs(currTime - prevTime) / (1000 * 60 * 60 * 24);

      if (diffDays <= 14) {
        currentCluster.push(sorted[i]);
      } else {
        if (currentCluster.length >= 2) {
          addClusterSuggestion(currentCluster, suggestions, dismissedSuggestionIds);
        }
        currentCluster = [sorted[i]];
      }
    }

    if (currentCluster.length >= 2) {
      addClusterSuggestion(currentCluster, suggestions, dismissedSuggestionIds);
    }
  }

  return suggestions;
}

function addClusterSuggestion(
  cluster: SavedAssessmentSummary[],
  output: SuggestedEpisode[],
  dismissedIds: string[]
) {
  const ids = cluster.map((c) => c.id);
  const suggestionId = `sug_${ids.sort().join('_').slice(0, 32)}`;
  if (dismissedIds.includes(suggestionId)) return;

  const firstDate = new Date(cluster[0].date);
  const lastDate = new Date(cluster[cluster.length - 1].date);
  const dateSpanSummary =
    cluster.length === 1
      ? firstDate.toLocaleDateString()
      : `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  const defaultTitle = generateDefaultEpisodeTitle(cluster[0].date, cluster[0].primarySymptoms);

  output.push({
    id: suggestionId,
    suggestedTitle: defaultTitle,
    patientName: cluster[0].patientName || 'Patient',
    assessmentIds: ids,
    dateSpanSummary,
    assessmentsCount: cluster.length,
  });
}
