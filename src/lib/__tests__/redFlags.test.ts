import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRedFlags } from '../redFlags';

test('Red-Flag Engine: 5 Core Emergency Test Phrases', async (t) => {
  await t.test('triggers acute coronary red flag for crushing chest pain radiating to arm', () => {
    const input = 'Feels like an elephant is sitting on my chest and the pain is shooting down my left arm.';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for acute coronary phrase');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'acute_coronary');
  });

  await t.test('triggers stroke FAST red flag for facial droop and slurred speech', () => {
    const input = "My mom's face is drooping on one side and her speech is slurred and confused.";
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for stroke FAST phrase');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'stroke_fast');
  });

  await t.test('triggers severe respiratory distress for gasping and cyanosis', () => {
    const input = "Can't breathe at all, gasping for air and my lips are turning blue.";
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for respiratory phrase');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'severe_respiratory');
  });

  await t.test('triggers anaphylaxis red flag for throat is swelling shut (with auxiliary verb)', () => {
    const input = 'Throat is swelling shut and hives all over after eating peanut sauce.';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for anaphylaxis phrase');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'anaphylaxis');
  });

  await t.test('triggers crisis support (NOT medical emergency) for suicidal ideation', () => {
    const input = "I don't want to live anymore and I have thoughts of ending my life.";
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for crisis support');
    assert.equal(result?.type, 'crisis_support');
    assert.equal(result?.category, 'suicide_self_harm');
  });
});

test('Red-Flag Engine: Natural Variant Phrases', async (t) => {
  await t.test('triggers anaphylaxis on "throat feels like it\'s closing"', () => {
    const result = checkRedFlags("My throat feels like it's closing after bee sting", 'en');
    assert.ok(result !== null);
    assert.equal(result?.category, 'anaphylaxis');
  });

  await t.test('triggers anaphylaxis on "tongue swelling"', () => {
    const result = checkRedFlags('Sudden tongue swelling and hives', 'en');
    assert.ok(result !== null);
    assert.equal(result?.category, 'anaphylaxis');
  });

  await t.test('triggers stroke FAST on "face drooping"', () => {
    const result = checkRedFlags('Sudden face drooping on right side', 'en');
    assert.ok(result !== null);
    assert.equal(result?.category, 'stroke_fast');
  });

  await t.test('triggers severe respiratory on "can\'t breathe"', () => {
    const result = checkRedFlags("I can't breathe and feeling faint", 'en');
    assert.ok(result !== null);
    assert.equal(result?.category, 'severe_respiratory');
  });

  await t.test('triggers severe respiratory on "lips turning blue"', () => {
    const result = checkRedFlags('Severe shortness of breath with lips turning blue', 'en');
    assert.ok(result !== null);
    assert.equal(result?.category, 'severe_respiratory');
  });

  await t.test('triggers acute coronary on "pain going down my left arm"', () => {
    const result = checkRedFlags('Severe pain going down my left arm since 20 minutes ago', 'en');
    assert.ok(result !== null);
    assert.equal(result?.category, 'acute_coronary');
  });
});

test('Red-Flag Engine: 3 Non-Emergency Benchmark Phrases', async (t) => {
  await t.test('does not trigger for tension headache', () => {
    const input = 'Mild tension headache after looking at my computer screen all afternoon.';
    const result = checkRedFlags(input, 'en');
    assert.equal(result, null, 'Tension headache should not trigger emergency alert');
  });

  await t.test('does not trigger for sprained ankle', () => {
    const input = 'Sprained my left ankle playing basketball 3 days ago, slight swelling and bruising.';
    const result = checkRedFlags(input, 'en');
    assert.equal(result, null, 'Sprained ankle should not trigger emergency alert');
  });

  await t.test('does not trigger for seasonal allergies and stuffy nose', () => {
    const input = 'Stuffy nose, sneezing, and itchy watery eyes from spring tree pollen.';
    const result = checkRedFlags(input, 'en');
    assert.equal(result, null, 'Seasonal allergies should not trigger emergency alert');
  });
});

test('Red-Flag Engine: Edge Cases Evaluation (Real Assertions)', async (t) => {
  await t.test('edge case 1: "no chest pain, just a cough" must NOT trigger (negation guard)', () => {
    const input = 'no chest pain, just a cough';
    const result = checkRedFlags(input, 'en');
    assert.equal(result, null, 'Negation "no chest pain" must not trigger red flag');
  });

  await t.test('edge case 2: "my grandfather died of a heart attack" must NOT trigger (family history)', () => {
    const input = 'my grandfather died of a heart attack';
    const result = checkRedFlags(input, 'en');
    assert.equal(result, null, 'Past family history must not trigger acute emergency');
  });

  await t.test('edge case 3: empty string, whitespace, and sub-3-char inputs must return null', () => {
    assert.equal(checkRedFlags('', 'en'), null);
    assert.equal(checkRedFlags('   ', 'en'), null);
    assert.equal(checkRedFlags('hi', 'en'), null);
  });

  await t.test('edge case 4: very long benign input (5000+ chars) must NOT trigger and execute safely', () => {
    const longBenignInput = 'Patient reports general fatigue, mild knee stiffness in the morning, and dry skin. '.repeat(65);
    assert.ok(longBenignInput.length > 5000);
    const start = performance.now();
    const result = checkRedFlags(longBenignInput, 'en');
    const elapsedMs = performance.now() - start;
    assert.equal(result, null);
    assert.ok(elapsedMs < 50, `Execution took ${elapsedMs.toFixed(2)}ms, expected < 50ms`);
  });

  await t.test('edge case 5: very long input with embedded emergency phrase triggers correctly', () => {
    const base = 'Regular routine follow-up note discussing exercise tolerance. '.repeat(50);
    const longWithEmergency = base + ' Patient feels elephant sitting on chest radiating to left arm. ' + base;
    assert.ok(longWithEmergency.length > 5000);
    const result = checkRedFlags(longWithEmergency, 'en');
    assert.ok(result !== null);
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'acute_coronary');
  });

  await t.test('edge case 6: non-English locale "ar" returns null pending clinical translation', () => {
    const emergencyInArabicLocale = checkRedFlags('chest pain radiating to left arm', 'ar');
    assert.equal(emergencyInArabicLocale, null, 'Non-English locales have no active pattern rules yet');
  });
});

test('Red-Flag Engine: Resolved Clinical Coverage Gaps (Now Fully Covered)', async (t) => {
  // Converted Gap A: Isolated severe chest pain without radiation words
  await t.test('triggers acute coronary for isolated severe chest pain without radiation words', () => {
    const result = checkRedFlags('I have sudden severe chest pain', 'en');
    assert.ok(result !== null, 'Expected match for isolated severe chest pain');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'acute_coronary');
  });

  // Converted Gap B: Thunderclap headache
  await t.test('triggers thunderclap headache for "worst headache of my life / thunderclap headache"', () => {
    const result = checkRedFlags('Worst headache of my life, came on like thunderclap', 'en');
    assert.ok(result !== null, 'Expected match for thunderclap headache');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'thunderclap_headache');
  });

  // Converted Gap C: Syncope / Fainting
  await t.test('triggers syncope red flag for "passed out / lost consciousness"', () => {
    const result = checkRedFlags('Patient passed out and lost consciousness suddenly', 'en');
    assert.ok(result !== null, 'Expected match for syncope / lost consciousness');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'syncope_unresponsive');
  });
});

test('Red-Flag Engine: Newly Added Emergency Clinical Categories', async (t) => {
  await t.test('triggers aortic dissection for tearing pain between shoulder blades', () => {
    const result = checkRedFlags('Severe tearing pain between my shoulder blades since 10 minutes ago', 'en');
    assert.ok(result !== null, 'Expected match for aortic dissection');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'aortic_dissection');
  });

  await t.test('triggers acute abdomen for rigid board-like abdomen', () => {
    const result = checkRedFlags('Stomach is excruciating and I have a rigid board-like abdomen', 'en');
    assert.ok(result !== null, 'Expected match for acute abdomen');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'acute_abdomen');
  });

  await t.test('triggers acute abdomen for severe abdominal pain with fever and chills', () => {
    const result = checkRedFlags('Severe abdominal pain with high fever and shaking chills', 'en');
    assert.ok(result !== null, 'Expected match for peritonitis/acute abdomen');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'acute_abdomen');
  });

  await t.test('triggers overdose / poisoning for "took a whole bottle of pills"', () => {
    const result = checkRedFlags('Patient took a whole bottle of pills an hour ago', 'en');
    assert.ok(result !== null, 'Expected match for overdose');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'overdose_poisoning');
  });

  await t.test('triggers overdose / poisoning for "drank bleach"', () => {
    const result = checkRedFlags('Accidentally drank bleach from a cup on the counter', 'en');
    assert.ok(result !== null, 'Expected match for chemical ingestion');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'overdose_poisoning');
  });

  await t.test('triggers severe hemorrhage for vomiting blood', () => {
    const result = checkRedFlags('Vomiting blood since this morning', 'en');
    assert.ok(result !== null, 'Expected match for gastrointestinal hemorrhage');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'severe_hemorrhage');
  });

  await t.test('triggers head injury red flag for head trauma with repeated vomiting and confusion', () => {
    const result = checkRedFlags('Hit my head in a fall, now having repeated vomiting and confusion', 'en');
    assert.ok(result !== null, 'Expected match for head trauma complications');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'head_injury');
  });

  await t.test('triggers seizure / convulsions for "having a seizure and convulsing"', () => {
    const result = checkRedFlags('Patient is actively having a seizure and convulsing on the floor', 'en');
    assert.ok(result !== null, 'Expected match for seizure / convulsions');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'seizure_convulsions');
  });

  await t.test('triggers sudden vision loss for "sudden vision loss in my right eye"', () => {
    const result = checkRedFlags('Sudden vision loss in my right eye like a curtain came down', 'en');
    assert.ok(result !== null, 'Expected match for sudden vision loss');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'sudden_vision_loss');
  });

  await t.test('triggers uncontrolled bleeding for "bleeding that won\'t stop"', () => {
    const result = checkRedFlags('Deep laceration on arm with bleeding that won\'t stop after 20 minutes of pressure', 'en');
    assert.ok(result !== null, 'Expected match for bleeding that won\'t stop');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'severe_hemorrhage');
  });

  await t.test('triggers meningismus for "stiff neck with fever"', () => {
    const result = checkRedFlags('Severe stiff neck with high fever and sensitivity to light', 'en');
    assert.ok(result !== null, 'Expected match for stiff neck with fever');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'meningismus');
  });
});

test('Red-Flag Engine: False-Positive, Negation Guards, and Mixed-Clause Cases (Clinical Safety)', async (t) => {
  await t.test('guard 1: "no chest pain" and "denies chest pain" must NOT trigger', () => {
    assert.equal(checkRedFlags('Patient denies chest pain and has a runny nose', 'en'), null);
    assert.equal(checkRedFlags('no chest pain, just a cough', 'en'), null);
    assert.equal(checkRedFlags('negative for chest pain', 'en'), null);
  });

  await t.test('guard 2: "my dad had a stroke last year" must NOT trigger (family history)', () => {
    const result = checkRedFlags('my dad had a stroke last year', 'en');
    assert.equal(result, null, 'Family history of stroke must not trigger patient emergency alert');
  });

  await t.test('guard 3: "my mom had a stroke, I\'m fine" must NOT trigger (family history in clause)', () => {
    const result = checkRedFlags("my mom had a stroke, I'm fine", 'en');
    assert.equal(result, null, "Family history phrase must not trigger emergency alert");
  });

  await t.test('guard 4: "I fainted at the sight of blood years ago" must NOT trigger (situational / distant past)', () => {
    const result = checkRedFlags('I fainted at the sight of blood years ago, today just have mild rash', 'en');
    assert.equal(result, null, 'Historical vasovagal trigger from years ago must not trigger acute syncope alert');
  });

  await t.test('guard 5: mixed clause — "I had chest pain years ago but now I have crushing chest pain" MUST trigger', () => {
    const result = checkRedFlags('I had chest pain years ago but now I have crushing chest pain', 'en');
    assert.ok(result !== null, 'Acute symptom in current clause must trigger despite distant past in prior clause');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'acute_coronary');
  });

  await t.test('guard 6: mixed clause — family history present but patient reports acute chest pain triggers correctly', () => {
    const mixedInput = 'My dad had a stroke last year. But today I have severe crushing chest pain.';
    const result = checkRedFlags(mixedInput, 'en');
    assert.ok(result !== null, 'Patient acute symptom in separate clause must trigger');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'acute_coronary');
  });
});
