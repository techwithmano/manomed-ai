/**
 * WCAG 2.1 Contrast Measurement Script
 * Resolves actual Tailwind & CSS tokens used in ManoMed AI, composites alpha over real surfaces,
 * and prints verified contrast ratios for:
 * 1. ClinicalStatusBadge tokens across tiers & surfaces
 * 2. muted-foreground text on card/background/muted in both themes
 * 3. LabReferenceRangeBar labels and zone indicators
 * 4. Primary button text in both themes
 * 5. Emergency and crisis banners in SymptomInputForm
 * 6. Focus ring against adjacent surfaces (3:1 for non-text UI components)
 *
 * NOTE: Automated contrast ratio calculations per WCAG 2.1 relative luminance formula
 * do not prove full WCAG conformance. Complete conformance requires manual human audit
 * of layout, dynamic states, subpixel rendering, user zoom, and real hardware displays.
 */
import colors from 'tailwindcss/colors';
import { getUnifiedTriageStatus } from '../src/lib/clinicalStatuses';

// sRGB to linear conversion per WCAG 2.1 specification
function srgbToLinear(c8: number): number {
  const c = c8 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

// Relative luminance per WCAG 2.1 definition
function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

// Alpha compositing: blends foreground hex with alpha (0..1) over an opaque background hex
function composite(fgHex: string, bgHex: string, alpha: number): string {
  const fg = fgHex.replace('#', '');
  const bg = bgHex.replace('#', '');
  const r1 = parseInt(fg.substring(0, 2), 16);
  const g1 = parseInt(fg.substring(2, 4), 16);
  const b1 = parseInt(fg.substring(4, 6), 16);
  const r2 = parseInt(bg.substring(0, 2), 16);
  const g2 = parseInt(bg.substring(2, 4), 16);
  const b2 = parseInt(bg.substring(4, 6), 16);

  const r = Math.round(r1 * alpha + r2 * (1 - alpha));
  const g = Math.round(g1 * alpha + g2 * (1 - alpha));
  const b = Math.round(b1 * alpha + b2 * (1 - alpha));

  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Contrast ratio (L1 + 0.05) / (L2 + 0.05)
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

// Helper to resolve Tailwind class to hex
function resolveClassToHex(cls: string): { hex: string; alpha?: number } {
  const withoutDark = cls.replace(/^dark:/, '');
  const cleaned = withoutDark.replace(/^(bg-|text-|border-|ring-)/, '');
  const parts = cleaned.split('/');
  const colorPart = parts[0];
  const alphaPart = parts[1] ? parseInt(parts[1], 10) / 100 : 1;

  const [family, shade] = colorPart.split('-');
  const palette = (colors as unknown as Record<string, Record<string, string>>)[family];
  if (palette && palette[shade]) {
    return { hex: palette[shade], alpha: alphaPart };
  }
  throw new Error(`Cannot resolve Tailwind class to hex: ${cls} (cleaned: ${cleaned})`);
}

// Real surfaces in the application
const SURFACES = {
  light: {
    pageBg: '#ffffff',
    card: '#ffffff',
    muted: '#f1f5f9',
    input: '#e2e8f0',
  },
  dark: {
    pageBg: '#08080a',
    card: '#0f0f13',
    muted: '#1c1c20',
    input: '#27272a',
    navy: '#0b0f19',
    gray900: '#111827',
  },
};

interface TableRow {
  category: string;
  context: string;
  classPair: string;
  fgHex: string;
  bgHex: string;
  ratio: number;
  threshold: number;
  status: string;
}

const rows: TableRow[] = [];

function recordCheck(
  category: string,
  context: string,
  classPair: string,
  fgHex: string,
  bgHex: string,
  isComponent: boolean = false
) {
  const ratio = contrastRatio(fgHex, bgHex);
  const threshold = isComponent ? 3.0 : 4.5;
  const pass = ratio >= threshold;
  rows.push({
    category,
    context,
    classPair,
    fgHex,
    bgHex,
    ratio: Math.round(ratio * 100) / 100,
    threshold,
    status: pass ? (isComponent ? 'PASS (UI 3:1)' : 'PASS (AA 4.5:1)') : `FAIL (< ${threshold}:1)`,
  });
}

// -------------------------------------------------------------
// 1. ClinicalStatusBadge tokens across tiers and dark surfaces
// -------------------------------------------------------------
const tiers = ['EMERGENCY', 'URGENT', 'ROUTINE', 'NORMAL'] as const;
for (const tier of tiers) {
  const info = getUnifiedTriageStatus(tier);
  const badgeClasses = info.classes.badge.split(' ');
  const lightBgClass = badgeClasses.find(c => c.startsWith('bg-') && !c.startsWith('dark:'))!;
  const lightTextClass = badgeClasses.find(c => c.startsWith('text-') && !c.startsWith('dark:'))!;
  const darkBgClass = badgeClasses.find(c => c.startsWith('dark:bg-'))!;
  const darkTextClass = badgeClasses.find(c => c.startsWith('dark:text-'))!;

  const iconClasses = info.classes.icon.split(' ');
  const lightIconClass = iconClasses.find(c => !c.startsWith('dark:'))!;
  const darkIconClass = iconClasses.find(c => c.startsWith('dark:'))!;

  const lBg = resolveClassToHex(lightBgClass).hex;
  const lText = resolveClassToHex(lightTextClass).hex;
  const lIcon = resolveClassToHex(lightIconClass).hex;

  recordCheck('ClinicalStatusBadge', `${tier} (Light Text)`, `${lightTextClass} on ${lightBgClass}`, lText, lBg);
  recordCheck('ClinicalStatusBadge', `${tier} (Light Icon)`, `${lightIconClass} on ${lightBgClass}`, lIcon, lBg);

  const dBgInfo = resolveClassToHex(darkBgClass);
  const dText = resolveClassToHex(darkTextClass).hex;
  const dIcon = resolveClassToHex(darkIconClass).hex;

  for (const [sName, sHex] of Object.entries(SURFACES.dark)) {
    const resolvedBg = composite(dBgInfo.hex, sHex, dBgInfo.alpha ?? 1);
    recordCheck('ClinicalStatusBadge', `${tier} (Dark Text on ${sName})`, `${darkTextClass} on ${darkBgClass}`, dText, resolvedBg);
    recordCheck('ClinicalStatusBadge', `${tier} (Dark Icon on ${sName})`, `${darkIconClass} on ${darkBgClass}`, dIcon, resolvedBg);
  }
}

// -------------------------------------------------------------
// 2. Muted-foreground text on card/background/muted in both themes
// -------------------------------------------------------------
// Light mode: muted-foreground = Slate-600 (#475569)
const lightMutedFg = '#475569';
recordCheck('muted-foreground Text', 'Light on Page Background', 'text-muted-foreground on bg-background', lightMutedFg, SURFACES.light.pageBg);
recordCheck('muted-foreground Text', 'Light on Card', 'text-muted-foreground on bg-card', lightMutedFg, SURFACES.light.card);
recordCheck('muted-foreground Text', 'Light on Muted Surface', 'text-muted-foreground on bg-muted', lightMutedFg, SURFACES.light.muted);

// Dark mode: muted-foreground = Zinc-400 (#a1a1aa)
const darkMutedFg = '#a1a1aa';
recordCheck('muted-foreground Text', 'Dark on Page Background', 'text-muted-foreground on bg-background', darkMutedFg, SURFACES.dark.pageBg);
recordCheck('muted-foreground Text', 'Dark on Card', 'text-muted-foreground on bg-card', darkMutedFg, SURFACES.dark.card);
recordCheck('muted-foreground Text', 'Dark on Muted Surface', 'text-muted-foreground on bg-muted', darkMutedFg, SURFACES.dark.muted);

// -------------------------------------------------------------
// 3. LabReferenceRangeBar labels and zone colors
// -------------------------------------------------------------
// "Unit needed" badge
const amber500 = resolveClassToHex('bg-amber-500').hex;
const amber900 = resolveClassToHex('text-amber-900').hex;
const amber200 = resolveClassToHex('text-amber-200').hex;
const lightUnitNeededBg = composite(amber500, SURFACES.light.card, 0.15);
const darkUnitNeededBg = composite(amber500, SURFACES.dark.card, 0.15);

recordCheck('LabReferenceRangeBar', 'Unit Needed Badge (Light)', 'text-amber-900 on amber-500/15', amber900, lightUnitNeededBg);
recordCheck('LabReferenceRangeBar', 'Unit Needed Badge (Dark)', 'dark:text-amber-200 on amber-500/15', amber200, darkUnitNeededBg);

// Range legend text (muted-foreground on card)
recordCheck('LabReferenceRangeBar', 'Range Legend Low/High (Light)', 'text-muted-foreground on card', lightMutedFg, SURFACES.light.card);
recordCheck('LabReferenceRangeBar', 'Range Legend Low/High (Dark)', 'text-muted-foreground on dark card', darkMutedFg, SURFACES.dark.card);

// Range legend central normal value (text-foreground/80)
const lightFg80 = composite('#0f172a', SURFACES.light.card, 0.8);
const darkFg80 = composite('#fafafa', SURFACES.dark.card, 0.8);
recordCheck('LabReferenceRangeBar', 'Range Legend Normal (Light)', 'text-foreground/80 on card', lightFg80, SURFACES.light.card);
recordCheck('LabReferenceRangeBar', 'Range Legend Normal (Dark)', 'text-foreground/80 on dark card', darkFg80, SURFACES.dark.card);

// Zone colors against track background (UI component check, 3:1)
// Light track bg = bg-muted/40 over card (#f1f5f9 at 40% over #ffffff = #f9fafc)
const lightTrackBg = composite(SURFACES.light.muted, SURFACES.light.card, 0.4);
// Dark track bg = bg-muted/40 over dark card (#1c1c20 at 40% over #0f0f13 = #141418)
const darkTrackBg = composite(SURFACES.dark.muted, SURFACES.dark.card, 0.4);

// Active low/high zone: amber-700 in light mode, amber-400 in dark mode
const amber700 = resolveClassToHex('bg-amber-700').hex;
const amber400 = resolveClassToHex('bg-amber-400').hex;
// Active normal zone: emerald-600 in light mode, emerald-400 in dark mode
const emerald600 = resolveClassToHex('bg-emerald-600').hex;
const emerald400 = resolveClassToHex('bg-emerald-400').hex;

// Contrast of active zone against track background (UI element distinction, 3:1 threshold)
recordCheck('LabReferenceRangeBar Zones', 'Normal Active Zone (Light)', 'bg-emerald-600 zone vs track', emerald600, lightTrackBg, true);
recordCheck('LabReferenceRangeBar Zones', 'Abnormal Active Zone (Light)', 'bg-amber-700 zone vs track', amber700, lightTrackBg, true);
recordCheck('LabReferenceRangeBar Zones', 'Normal Active Zone (Dark)', 'dark:bg-emerald-400 zone vs track', emerald400, darkTrackBg, true);
recordCheck('LabReferenceRangeBar Zones', 'Abnormal Active Zone (Dark)', 'dark:bg-amber-400 zone vs track', amber400, darkTrackBg, true);

// -------------------------------------------------------------
// 4. Primary Button text in both themes
// -------------------------------------------------------------
// Light mode: primary = #2563EB, foreground = #FFFFFF
const lightPrimary = '#2563eb';
const buttonText = '#ffffff';
recordCheck('Primary Button', 'Primary Button (Light)', 'text-white on bg-primary (#2563EB)', buttonText, lightPrimary);

// Dark mode: primary = #2563EB, foreground = #FFFFFF
const darkPrimary = '#2563eb';
recordCheck('Primary Button', 'Primary Button (Dark)', 'text-white on dark bg-primary (#2563EB)', buttonText, darkPrimary);

// -------------------------------------------------------------
// 5. Emergency and Crisis Banners in SymptomInputForm
// -------------------------------------------------------------
// Crisis Banner
const purple500 = resolveClassToHex('bg-purple-500').hex;
const purple950 = resolveClassToHex('text-purple-950').hex;
const purple100 = resolveClassToHex('text-purple-100').hex;
const purple800 = resolveClassToHex('text-purple-800').hex;
const purple300 = resolveClassToHex('text-purple-300').hex;
const lightCrisisBg = composite(purple500, SURFACES.light.card, 0.1);
const darkCrisisBg = composite(purple500, SURFACES.dark.card, 0.1);

recordCheck('Crisis Banner', 'Crisis Title (Light)', 'text-purple-950 on bg-purple-500/10', purple950, lightCrisisBg);
recordCheck('Crisis Banner', 'Crisis Title (Dark)', 'dark:text-purple-100 on dark bg-purple-500/10', purple100, darkCrisisBg);
recordCheck('Crisis Banner', 'Crisis Subtext (Light)', 'text-purple-800 on bg-purple-500/10', purple800, lightCrisisBg);
recordCheck('Crisis Banner', 'Crisis Subtext (Dark)', 'dark:text-purple-300 on dark bg-purple-500/10', purple300, darkCrisisBg);

// Crisis CTA Button: bg-purple-700 (#7e22ce) with white text
const purple700 = resolveClassToHex('bg-purple-700').hex;
recordCheck('Crisis Banner', 'Crisis Call Button', 'text-white on bg-purple-700', buttonText, purple700);

// Emergency Banner
const red700 = resolveClassToHex('text-red-700').hex;
const red400 = resolveClassToHex('text-red-400').hex;
const destructiveLight = resolveClassToHex('bg-red-500').hex;
const lightEmergBg = composite(destructiveLight, SURFACES.light.card, 0.1);
const darkEmergBg = composite(destructiveLight, SURFACES.dark.card, 0.1);

recordCheck('Emergency Banner', 'Emergency Title (Light)', 'text-red-700 on bg-destructive/10', red700, lightEmergBg);
recordCheck('Emergency Banner', 'Emergency Title (Dark)', 'dark:text-red-400 on dark bg-destructive/10', red400, darkEmergBg);
recordCheck('Emergency Banner', 'Emergency Body (Light)', 'text-foreground on bg-destructive/10', '#0f172a', lightEmergBg);
recordCheck('Emergency Banner', 'Emergency Body (Dark)', 'dark:text-foreground on dark bg-destructive/10', '#fafafa', darkEmergBg);
recordCheck('Emergency Banner', 'Emergency Subtext (Light)', 'text-muted-foreground on bg-destructive/10', lightMutedFg, lightEmergBg);
recordCheck('Emergency Banner', 'Emergency Subtext (Dark)', 'text-muted-foreground on dark bg-destructive/10', darkMutedFg, darkEmergBg);

// Emergency CTA Button: bg-red-700 (#b91c1c) with white text
recordCheck('Emergency Banner', 'Emergency Call Button', 'text-white on bg-red-700', buttonText, red700);

// -------------------------------------------------------------
// 6. Focus Ring against adjacent surfaces (3:1 for UI components)
// -------------------------------------------------------------
// Light focus ring: #2563EB (--ring: 221.2 83.2% 53.3%)
const ringLight = '#2563eb';
recordCheck('Focus Ring (UI 3:1)', 'Light Ring vs Page Background', 'ring-primary vs bg-background', ringLight, SURFACES.light.pageBg, true);
recordCheck('Focus Ring (UI 3:1)', 'Light Ring vs Card Surface', 'ring-primary vs bg-card', ringLight, SURFACES.light.card, true);
recordCheck('Focus Ring (UI 3:1)', 'Light Ring vs Muted Surface', 'ring-primary vs bg-muted', ringLight, SURFACES.light.muted, true);
recordCheck('Focus Ring (UI 3:1)', 'Light Ring vs Input Border', 'ring-primary vs border-input', ringLight, SURFACES.light.input, true);

// Dark focus ring: #3B82F6 (--ring: 217.2 91.2% 59.8%)
const ringDark = '#3b82f6';
recordCheck('Focus Ring (UI 3:1)', 'Dark Ring vs Page Background', 'ring-primary vs dark bg-background', ringDark, SURFACES.dark.pageBg, true);
recordCheck('Focus Ring (UI 3:1)', 'Dark Ring vs Card Surface', 'ring-primary vs dark bg-card', ringDark, SURFACES.dark.card, true);
recordCheck('Focus Ring (UI 3:1)', 'Dark Ring vs Muted Surface', 'ring-primary vs dark bg-muted', ringDark, SURFACES.dark.muted, true);
recordCheck('Focus Ring (UI 3:1)', 'Dark Ring vs Input Border', 'ring-primary vs dark border-input', ringDark, SURFACES.dark.input, true);

// -------------------------------------------------------------
// Output Report Table
// -------------------------------------------------------------
console.log('='.repeat(120));
console.log('COMPREHENSIVE WCAG 2.1 CONTRAST MEASUREMENTS');
console.log('='.repeat(120));
console.log('NOTE: Automated contrast ratio calculations per WCAG 2.1 relative luminance formula');
console.log('do not prove full WCAG conformance. Automated checks evaluate mathematical luminosity;');
console.log('human audit is required for spatial layout, user scaling, font rendering, and dynamic states.\n');

console.log('| Category | Context | Class Pair | Foreground Hex | Background Hex | Ratio | Threshold | Status |');
console.log('| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |');
for (const r of rows) {
  console.log(
    `| ${r.category} | ${r.context} | \`${r.classPair}\` | \`${r.fgHex}\` | \`${r.bgHex}\` | **${r.ratio}:1** | ${r.threshold}:1 | ${r.status} |`
  );
}

// Check failures
const failures = rows.filter(r => r.ratio < r.threshold);
if (failures.length > 0) {
  console.error(`\n❌ ERROR: ${failures.length} color pair(s) failed required WCAG contrast thresholds:`);
  console.error(failures);
  process.exit(1);
} else {
  console.log(`\n✅ All ${rows.length} measured contrast pairs PASS required WCAG thresholds (4.5:1 text, 3:1 UI components).`);
}
