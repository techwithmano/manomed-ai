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

  await t.test('guard 7: isolated distant past "I fainted last year" must NOT trigger', () => {
    const result = checkRedFlags('I fainted last year', 'en');
    assert.equal(result, null, 'Isolated distant past fainting must not trigger emergency');
  });
});

test('Remediation Sprint 1: Mandated Clinical Governance Red-Flag Tests (A through E)', async (t) => {
  await t.test('Case A: "I had no chest pain this morning, but now I have crushing chest pain" triggers', () => {
    const input = 'I had no chest pain this morning, but now I have crushing chest pain';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for acute coronary despite earlier negation clause');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'acute_coronary');
  });

  await t.test('Case B: "My father had a heart attack. I am having severe chest pressure." triggers', () => {
    const input = 'My father had a heart attack. I am having severe chest pressure.';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for acute coronary despite family history in prior clause');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'acute_coronary');
  });

  await t.test('Case C: "I fainted last year, and today I suddenly feel like I am going to pass out." triggers', () => {
    const input = 'I fainted last year, and today I suddenly feel like I am going to pass out.';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for syncope despite distant past history');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'syncope_unresponsive');
  });

  await t.test('Case D: "I am not short of breath, but I cannot get enough air and my lips look blue." triggers', () => {
    const input = 'I am not short of breath, but I cannot get enough air and my lips look blue.';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for severe respiratory despite negation of shortness of breath');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'severe_respiratory');
  });

  await t.test('Case E: "My brother is unresponsive." triggers, with guidance suited to a third party', () => {
    const input = 'My brother is unresponsive.';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for unresponsive third party');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'syncope_unresponsive');
    assert.equal(result?.isThirdParty, true, 'Expected isThirdParty flag to be true');
    assert.ok(
      result?.userMessage.toLowerCase().includes('person') ||
      result?.userMessage.toLowerCase().includes('dispatcher') ||
      result?.userMessage.toLowerCase().includes('emergency services'),
      'Expected userMessage to be suited to a third party'
    );
  });
});

test('Remediation Sprint 1: Other-Person Emergency Presentations', async (t) => {
  await t.test('Third-Party Stroke: "My mother is having a stroke, her face is drooping and speech is slurred"', () => {
    const input = 'My mother is having a stroke, her face is drooping and speech is slurred';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for third-party stroke');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'stroke_fast');
    assert.equal(result?.isThirdParty, true);
    assert.ok(result?.userMessage.includes('someone near you'));
  });

  await t.test('Third-Party Overdose: "My friend took a whole bottle of pills an hour ago"', () => {
    const input = 'My friend took a whole bottle of pills an hour ago';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for third-party overdose');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'overdose_poisoning');
    assert.equal(result?.isThirdParty, true);
    assert.ok(result?.userMessage.includes('another person') || result?.userMessage.includes('Poison Control'));
  });

  await t.test('Third-Party Anaphylaxis: "My son\'s throat is swelling shut after eating peanut butter"', () => {
    const input = "My son's throat is swelling shut after eating peanut butter";
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected match for third-party anaphylaxis');
    assert.equal(result?.type, 'medical_emergency');
    assert.equal(result?.category, 'anaphylaxis');
    assert.equal(result?.isThirdParty, true);
    assert.ok(result?.userMessage.includes('someone is experiencing') || result?.userMessage.includes('EpiPen'));
  });
});

test('Remediation Sprint 2: Mandated Hardening Test Cases (7 Phrases)', async (t) => {
  await t.test('Case 1: "severe abdominal pain, and fever and chills" triggers acute_abdomen', () => {
    const input = 'severe abdominal pain, and fever and chills';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected acute_abdomen match');
    assert.equal(result?.category, 'acute_abdomen');
  });

  await t.test('Case 2: "chest pain while walking, severe" triggers acute_coronary', () => {
    const input = 'chest pain while walking, severe';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected acute_coronary match');
    assert.equal(result?.category, 'acute_coronary');
  });

  await t.test('Case 3: "crushing chest pain and I can\'t breathe" triggers acute_coronary', () => {
    const input = "crushing chest pain and I can't breathe";
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected acute_coronary match');
    assert.equal(result?.category, 'acute_coronary');
  });

  await t.test('Case 4: "no fever but I can\'t breathe" triggers severe_respiratory', () => {
    const input = "no fever but I can't breathe";
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected severe_respiratory match');
    assert.equal(result?.category, 'severe_respiratory');
  });

  await t.test('Case 5: "my friend told me to come in. I have chest pain" triggers acute_coronary (patient)', () => {
    const input = 'my friend told me to come in. I have chest pain';
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected acute_coronary match');
    assert.equal(result?.category, 'acute_coronary');
    assert.equal(result?.isThirdParty, false);
  });

  await t.test('Case 6: "I\'m not worried about my dad\'s stroke but my face is drooping" triggers stroke_fast (patient)', () => {
    const input = "I'm not worried about my dad's stroke but my face is drooping";
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected stroke_fast match');
    assert.equal(result?.category, 'stroke_fast');
    assert.equal(result?.isThirdParty, false);
  });

  await t.test('Case 7: "I used to have seizures, I\'m having one now" triggers seizure_convulsions', () => {
    const input = "I used to have seizures, I'm having one now";
    const result = checkRedFlags(input, 'en');
    assert.ok(result !== null, 'Expected seizure_convulsions match');
    assert.equal(result?.category, 'seizure_convulsions');
  });
});

test('Remediation Sprint 2: 20 Informal Paraphrases (5 per category)', async (t) => {
  // Category A: Chest (5 paraphrases)
  await t.test('Chest 1: "my chest hurts really bad like someone is squeezing it"', () => {
    const res = checkRedFlags('my chest hurts really bad like someone is squeezing it', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'acute_coronary');
  });
  await t.test('Chest 2: "having really bad chest pressure that goes up into my jaw"', () => {
    const res = checkRedFlags('having really bad chest pressure that goes up into my jaw', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'acute_coronary');
  });
  await t.test('Chest 3: "feels like a ton of bricks sitting on my chest"', () => {
    const res = checkRedFlags('feels like a ton of bricks sitting on my chest', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'acute_coronary');
  });
  await t.test('Chest 4: "bad chest tightness and pain in my left arm"', () => {
    const res = checkRedFlags('bad chest tightness and pain in my left arm', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'acute_coronary');
  });
  await t.test('Chest 5: "burning pain in center of chest going into my back"', () => {
    const res = checkRedFlags('burning pain in center of chest going into my back', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'acute_coronary');
  });

  // Category B: Stroke (5 paraphrases)
  await t.test('Stroke 1: "half of my face feels numb and is drooping down"', () => {
    const res = checkRedFlags('half of my face feels numb and is drooping down', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'stroke_fast');
  });
  await t.test('Stroke 2: "suddenly can\'t talk right and words coming out all slurred"', () => {
    const res = checkRedFlags("suddenly can't talk right and words coming out all slurred", 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'stroke_fast');
  });
  await t.test('Stroke 3: "my husband can\'t move his right arm or leg all of a sudden"', () => {
    const res = checkRedFlags("my husband can't move his right arm or leg all of a sudden", 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'stroke_fast');
  });
  await t.test('Stroke 4: "woke up and one side of my body is completely weak"', () => {
    const res = checkRedFlags('woke up and one side of my body is completely weak', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'stroke_fast');
  });
  await t.test('Stroke 5: "she is smiling crooked and speech is completely slurred"', () => {
    const res = checkRedFlags('she is smiling crooked and speech is completely slurred', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'stroke_fast');
  });

  // Category C: Breathing (5 paraphrases)
  await t.test('Breathing 1: "gasping for air and feel like I\'m suffocating"', () => {
    const res = checkRedFlags("gasping for air and feel like I'm suffocating", 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'severe_respiratory');
  });
  await t.test('Breathing 2: "can\'t catch my breath at all, struggling for air"', () => {
    const res = checkRedFlags("can't catch my breath at all, struggling for air", 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'severe_respiratory');
  });
  await t.test('Breathing 3: "baby is turning blue around the lips and struggling to breathe"', () => {
    const res = checkRedFlags('baby is turning blue around the lips and struggling to breathe', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'severe_respiratory');
  });
  await t.test('Breathing 4: "hard to breathe and cannot get enough oxygen into my lungs"', () => {
    const res = checkRedFlags('hard to breathe and cannot get enough oxygen into my lungs', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'severe_respiratory');
  });
  await t.test('Breathing 5: "chest is tight and I can\'t breathe right now"', () => {
    const res = checkRedFlags("chest is tight and I can't breathe right now", 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'severe_respiratory');
  });

  // Category D: Overdose (5 paraphrases)
  await t.test('Overdose 1: "took too many sleeping pills by mistake and can\'t stay awake"', () => {
    const res = checkRedFlags("took too many sleeping pills by mistake and can't stay awake", 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'overdose_poisoning');
  });
  await t.test('Overdose 2: "my roommate swallowed a whole bunch of painkillers"', () => {
    const res = checkRedFlags('my roommate swallowed a whole bunch of painkillers', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'overdose_poisoning');
  });
  await t.test('Overdose 3: "toddler drank some cleaning solution from under the sink"', () => {
    const res = checkRedFlags('toddler drank some cleaning solution from under the sink', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'overdose_poisoning');
  });
  await t.test('Overdose 4: "accidental overdose on my heart medication"', () => {
    const res = checkRedFlags('accidental overdose on my heart medication', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'overdose_poisoning');
  });
  await t.test('Overdose 5: "ingested rat poison by accident"', () => {
    const res = checkRedFlags('ingested rat poison by accident', 'en');
    assert.ok(res !== null);
    assert.equal(res?.category, 'overdose_poisoning');
  });
});

test('Sprint 2.1: Restored Original Phrasings Test Suite', async (t) => {
  await t.test('original phrasing: "crushing chest pain radiating to arm" triggers acute_coronary', () => {
    const res = checkRedFlags('crushing chest pain radiating to arm', 'en');
    assert.ok(res !== null, 'Expected match for acute coronary');
    assert.equal(res?.category, 'acute_coronary');
  });

  await t.test('original phrasing: "chest pain radiating to left arm" triggers acute_coronary', () => {
    const res = checkRedFlags('chest pain radiating to left arm', 'en');
    assert.ok(res !== null, 'Expected match for acute coronary');
    assert.equal(res?.category, 'acute_coronary');
  });

  await t.test('guard-4 original phrasing isolated: "I fainted at the sight of blood years ago" returns null', () => {
    const res = checkRedFlags('I fainted at the sight of blood years ago', 'en');
    assert.equal(res, null, 'Isolated vasovagal history must not trigger syncope emergency');
  });
});

test('Sprint 2.1: Benign Phrases and False-Positive / Over-Warning Measurement', async (t) => {
  // Known clinical over-warnings (acceptable for chest/breathing safety, documented and measured)
  await t.test('measures over-warning on "heartburn after spicy food, burning in my chest" -> triggers acute_coronary', () => {
    const res = checkRedFlags('heartburn after spicy food, burning in my chest', 'en');
    assert.ok(res !== null, 'Triggers chest over-warning safety pattern');
    assert.equal(res?.category, 'acute_coronary');
  });

  await t.test('measures over-warning on "chest tightness when I\'m anxious but it passes" -> triggers acute_coronary', () => {
    const res = checkRedFlags("chest tightness when I'm anxious but it passes", 'en');
    assert.ok(res !== null, 'Triggers chest tightness over-warning safety pattern');
    assert.equal(res?.category, 'acute_coronary');
  });

  await t.test('measures over-warning on "I can\'t breathe through my nose with this cold" -> triggers severe_respiratory', () => {
    const res = checkRedFlags("I can't breathe through my nose with this cold", 'en');
    assert.ok(res !== null, 'Triggers breathing difficulty over-warning safety pattern');
    assert.equal(res?.category, 'severe_respiratory');
  });

  // Benign phrases correctly returning null (no emergency triggered)
  await t.test('benign: "my toddler drank some water" returns null', () => {
    assert.equal(checkRedFlags('my toddler drank some water', 'en'), null);
  });

  await t.test('benign: "I took two vitamins instead of one" returns null', () => {
    assert.equal(checkRedFlags('I took two vitamins instead of one', 'en'), null);
  });

  await t.test('benign: "my face felt numb at the dentist yesterday" returns null', () => {
    assert.equal(checkRedFlags('my face felt numb at the dentist yesterday', 'en'), null);
  });

  await t.test('benign: "I felt faint after standing up quickly years ago" returns null', () => {
    assert.equal(checkRedFlags('I felt faint after standing up quickly years ago', 'en'), null);
  });

  await t.test('benign: "bad cramps and a fever last week, now fine" returns null', () => {
    assert.equal(checkRedFlags('bad cramps and a fever last week, now fine', 'en'), null);
  });

  await t.test('benign: "bit my tongue while eating dinner, small scratch" returns null', () => {
    assert.equal(checkRedFlags('bit my tongue while eating dinner, small scratch', 'en'), null);
  });

  await t.test('benign: "got soap in my eye in the shower, burns a bit" returns null', () => {
    assert.equal(checkRedFlags('got soap in my eye in the shower, burns a bit', 'en'), null);
  });

  await t.test('benign: "stubbed my toe on the bed frame, throbbing pain" returns null', () => {
    assert.equal(checkRedFlags('stubbed my toe on the bed frame, throbbing pain', 'en'), null);
  });

  await t.test('benign: "sneezing a lot after dusting the bookshelf" returns null', () => {
    assert.equal(checkRedFlags('sneezing a lot after dusting the bookshelf', 'en'), null);
  });

  await t.test('benign: "mild nausea after eating greasy food for lunch" returns null', () => {
    assert.equal(checkRedFlags('mild nausea after eating greasy food for lunch', 'en'), null);
  });

  await t.test('benign: "tired after a long day of working in the yard" returns null', () => {
    assert.equal(checkRedFlags('tired after a long day of working in the yard', 'en'), null);
  });
});


