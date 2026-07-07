/* =============================================================================
   READING LEVEL PLACEMENT ASSESSMENT ENGINE
   Rules sourced from: "FL_PA (26-27) - pre work.pdf" (flowcharts),
   "Mind Map.pdf" (level rules) and "sample_answer_key_with_rubrics.pdf"
   (assessment criteria / marking rubrics).
   ============================================================================= */

(() => {
  "use strict";

  /* =========================================================================
     1. DATA — CONSTANTS
     ========================================================================= */

  const LEVEL = {
    LETTER: "letter",
    WORD: "word",
    SENTENCE: "sentence",
    STORY: "story",
    ADVANCE: "advance",
    TUITION: "tuition",
  };

  // Order of the core assessment ladder (excludes the terminal Tuition stage).
  const LEVEL_ORDER = [LEVEL.LETTER, LEVEL.WORD, LEVEL.SENTENCE, LEVEL.STORY, LEVEL.ADVANCE];

  // Scoring constants (from the PDFs) — never hardcoded inline, always referenced.
  const MIN_SCORE = 0;
  const MAX_SCORE = 10;
  const SCORE_STEP = 0.5;

  // Letter Level requires a flawless score to move forward ("Move ahead only if student scored 10/10").
  const LETTER_PERFECT_SCORE = 10;

  // Word / Sentence / Story / Advance require score >= 8 to move forward
  // ("Move ahead only if the student scored >8" / flowchart: "If Score >=8/10, Assess for next level").
  const STANDARD_PASS_MARK = 8;

  // When a level is failed, the assessor walks backward one level at a time and the
  // student is placed at the FIRST (highest) level whose own recorded score meets THAT
  // level's own pass mark above — never at a level that was itself failed. If even
  // Letter Level's score doesn't meet its own pass mark, Letter is used as an absolute
  // floor placement anyway, since there is nowhere lower on the ladder.

  // Grade bands that determine a NEW student's starting level.
  const NEW_STUDENT_START_RULES = [
    { grades: ["UKG", "1", "2"], level: LEVEL.LETTER, gradeLabel: "UKG – Grade 2" },
    { grades: ["3", "4", "5"], level: LEVEL.WORD, gradeLabel: "Grade 3 – Grade 5" },
    { grades: ["6", "7", "8", "9", "10", "11", "12"], level: LEVEL.SENTENCE, gradeLabel: "Grade 6 and above" },
  ];

  const LEVEL_META = {
    letter: { label: "Letter Level", short: "Letter", icon: "🔤" },
    word: { label: "Word Level", short: "Word", icon: "🔍" },
    sentence: { label: "Sentence Level", short: "Sentence", icon: "📗" },
    story: { label: "Story Level", short: "Story", icon: "📖" },
    advance: { label: "Advance Level", short: "Advance", icon: "🎓" },
    tuition: { label: "Tuition Program", short: "Tuition", icon: "🏆" },
  };

  /* =========================================================================
     1b. DATA — ASSESSMENT CRITERIA (verbatim from the answer-key & rubric PDF)
     ========================================================================= */

  const ASSESSMENT_CRITERIA = {
    letter: {
      question: "Identify the letters and their sounds. (1 × 10 marks)",
      letters: ["M", "X", "A", "P", "L", "V", "E", "H", "C", "S"],
      answerKey: [
        ["M", "/mmm/"], ["X", "/ks/"], ["A", "/a/"], ["P", "/p/"], ["L", "/lll/"],
        ["V", "/v/"], ["E", "/eh/"], ["H", "/h/"], ["C", "/k/"], ["S", "/sss/"],
      ],
      rubric: [
        { range: "10 Marks", points: ["Correctly identifies all 10 letters independently.", "Produces accurate sounds confidently without prompting."] },
        { range: "8–9 Marks", points: ["Correctly identifies 8–9 letters and sounds.", "Makes only 1–2 minor pronunciation/sound errors."] },
        { range: "6–7 Marks", points: ["Correctly identifies 6–7 letters.", "Shows developing understanding but may confuse some sounds."] },
        { range: "4–5 Marks", points: ["Correctly identifies around 4–5 letters.", "Requires occasional prompting/support."] },
        { range: "2–3 Marks", points: ["Identifies only 2–3 letters correctly.", "Limited sound awareness."] },
        { range: "0–1 Marks", points: ["Unable to identify letters/sounds meaningfully."] },
      ],
      notes: [],
    },

    word: {
      question: "Read &amp; Explain (or use it in a sentence) the words presented below. (8 Reading + 2 Explain)",
      words: ["Joy", "Brave", "Important", "Kind", "Careful", "Healthy", "Learn", "Strong"],
      answerKey: [
        ["Joy", "happiness"], ["Brave", "courageous"], ["Important", "valuable/significant"], ["Kind", "caring/helpful"],
        ["Careful", "cautious"], ["Healthy", "fit/well"], ["Learn", "gain knowledge"], ["Strong", "powerful"],
      ],
      rubric: [
        { range: "Reading Rubric (8 Marks)", points: ["1 mark for every correctly read word.", "Deduct 0.5 for major pronunciation errors."] },
        { range: "Meaning/Explanation Rubric (2 Marks) — 2 Marks", points: ["Explains meanings of 6–8 words clearly.", "Uses examples/context appropriately."] },
        { range: "Meaning/Explanation Rubric — 1 Mark", points: ["Explains 3–5 words partially."] },
        { range: "Meaning/Explanation Rubric — 0 Marks", points: ["Unable to explain meanings."] },
      ],
      notes: ["Regional language explanations are acceptable.", "Minor grammatical mistakes may be ignored."],
    },

    sentence: {
      question: "Q1. Read the passage aloud. (5 Marks)",
      questions2: [
        "What does learning begin with?",
        "How do we discover new things?",
        "What is learning compared to in the passage?",
        "What happens when we try again after failing?",
        "Where does learning happen besides classrooms?",
      ],
      answerKeyReading: "Check for fluency, pronunciation, confidence, pacing, and expression.",
      answerKeyQuestions: [
        "Curiosity",
        "Through experiences, mistakes, and efforts",
        "A plant needing water to grow / a journey",
        "We become stronger and more confident",
        "In the world around us",
      ],
      rubric: [
        { range: "Reading Rubric (5 Marks) — 5 Marks", points: ["Fluent reading with expression, pacing, and confidence.", "Correct pronunciation throughout."] },
        { range: "4 Marks", points: ["Mostly fluent with minor errors."] },
        { range: "3 Marks", points: ["Understandable but hesitant reading."] },
        { range: "2 Marks", points: ["Frequent pauses and errors."] },
        { range: "1 Mark", points: ["Very limited independent reading."] },
        { range: "0 Marks", points: ["Unable to read."] },
        { range: "Comprehension Rubric (5 Marks)", points: ["1 mark for each correct answer.", "0.5 marks may be awarded for partially correct answers."] },
      ],
      notes: [],
    },

    story: {
      question: "Q1. Read the story aloud. (2 Marks)",
      questions2: [
        "Why did Aarav ignore the lamp in the beginning, and what made him understand its importance later?",
        "What does the lamp represent in the story, and how did it help both Aarav and others during the storm?",
        "What lesson do you learn from Aarav’s experience, and how can you apply it in your own life?",
      ],
      answerKeyReading: "Check for fluency, pronunciation, expression, and confidence.",
      answerKeyQuestions: [
        "Aarav thought the lamp was just a routine. During the storm and darkness, he realised its importance.",
        "The lamp represents hope, comfort, guidance, and helping others. It comforted Aarav and guided neighbours during the storm.",
        "Small actions can help others. We should support and help people around us.",
      ],
      rubric: [
        { range: "Reading Rubric (2 Marks) — 2 Marks", points: ["Fluent, expressive reading with confidence."] },
        { range: "1 Mark", points: ["Hesitant reading with minor pronunciation errors."] },
        { range: "0 Marks", points: ["Unable to read meaningfully."] },
        { range: "Question &amp; Answer Rubric (6 Marks) — 2 Marks per Question", points: ["Accurate, complete answer with clear understanding."] },
        { range: "1 Mark", points: ["Partial understanding shown."] },
        { range: "0 Marks", points: ["Incorrect/no response."] },
        { range: "Additional Comprehension (2 Marks) — 2 Marks", points: ["Strong overall understanding of story/message."] },
        { range: "1 Mark", points: ["Basic understanding shown."] },
        { range: "0 Marks", points: ["No meaningful comprehension."] },
      ],
      notes: [],
    },

    advance: {
      tasks: [
        "1. Identify the Figures of Speech in this poem.",
        "2. Complete the sentences with the appropriate verb form in the subjunctive mood.",
        "3. Rewrite the incorrect complex sentences.",
        "4. Opinion Writing",
      ],
      answerKey: [
        "Figures of Speech — Simile: “Like a silver lamp” / “like a restless child”. Metaphor: “silver lamp” / “silver dream”. Personification: “The stars wink gently” / “The wind hums songs”.",
        "Subjunctive Mood — a. studied, would score  b. be, understand/understands  c. had, could complete",
        "Sentence Rewriting — a. Because he was tired, he continued working late into the night. (OR: He was tired, but he continued working late into the night.)  b. Although she practiced well, she forgot her lines on stage.  c. Since it was raining heavily, they decided to continue the match.",
        "Opinion Writing — Opinion answers may vary.",
      ],
      rubric: [
        { range: "Figures of Speech", points: ["1 mark for each correct identification.", "0.5 for partially correct response."] },
        { range: "Subjunctive Mood", points: ["1 mark for completely correct sentence.", "0.5 if partially correct."] },
        { range: "Sentence Rewriting", points: ["1 mark for grammatically accurate rewrite.", "0.5 if meaning retained but grammar weak."] },
        { range: "Opinion Writing — 1 Mark", points: ["Clear opinion with supporting reason."] },
        { range: "0.5 Marks", points: ["Opinion present but reasoning unclear."] },
        { range: "0 Marks", points: ["Off-topic/no response."] },
      ],
      notes: [],
    },
  };

  // Descriptive placement rules per level, straight from the Mind Map slides —
  // shown to the assessor for full transparency alongside the marking rubric.
  const PLACEMENT_RULES = {
    letter: [
      "Begin here if NEW Student is between UKG and Grade 2.",
      "Begin here if old student was retained in this level during Impact assessment.",
      "Move ahead only if student scored 10/10.",
      "Place the student here if they score less than 10/10 in Letter Level.",
    ],
    word: [
      "Begin here if the NEW Student is between Grade 3 and Grade 5.",
      "Begin here if the continuing student was retained/promoted to this level during the Impact assessment.",
      "Move ahead only if the student scored ≥8.",
      "If the score is below 8, move back to Letter Level: if Letter's score meets its own pass mark, the student is placed at Letter; otherwise Letter is used as the floor placement.",
    ],
    sentence: [
      "Begin here if NEW Student is in Grade 6 and above.",
      "Begin here if the continuing student was retained/promoted to this level during the Impact assessment.",
      "Move ahead only if the student scored ≥8.",
      "If the score is below 8, move back to Word Level: if Word's score meets its own pass mark (≥8), the student is placed at Word; otherwise the check continues back to Letter Level.",
    ],
    story: [
      "Begin here if the continuing student was retained/promoted to this level during the Impact assessment.",
      "No new student will begin assessment at the Story Level.",
      "Move ahead only if the student scored ≥8.",
      "If the score is below 8, move back to Sentence Level: if Sentence's score meets its own pass mark (≥8), the student is placed at Sentence; otherwise the check continues further back.",
    ],
    advance: [
      "Begin here if the continuing student was retained/promoted to this level during the Impact assessment.",
      "No new student will begin assessment at the Advance Level.",
      "Move ahead to the Tuition program only if the student scored ≥8.",
      "If the score is below 8, move back to Story Level: if Story's score meets its own pass mark (≥8), the student is placed at Story; otherwise the check continues further back.",
    ],
  };

  // The student is always placed at the highest level in the ladder whose OWN recorded
  // score meets that level's own pass mark (10 for Letter, 8 for the rest) — walking
  // backward one level at a time from wherever the failure occurred. Letter Level is an
  // absolute floor: if even Letter's score doesn't meet its pass mark, the student is
  // still placed there, since there is nowhere lower to go.

  /* =========================================================================
     2. STATE
     ========================================================================= */

  const state = {
    studentType: null,      // 'new' | 'retained'
    grade: null,
    startLevel: null,
    scores: {},              // { levelKey: score }
    history: [],             // full decision timeline entries
    current: null,           // { level, mode: 'forward'|'cascade', triggeredByLevel?, reason }
    visitedLevels: [],       // for stepper highlighting, in visiting order
    finalOutcome: null,      // { type: 'placed'|'promoted', level }
  };

  /* =========================================================================
     3. ENGINE — pure decision-making functions
     ========================================================================= */

  function levelIndex(level) { return LEVEL_ORDER.indexOf(level); }
  function nextLevelOf(level) {
    const i = levelIndex(level);
    return i >= 0 && i < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[i + 1] : null;
  }
  function prevLevelOf(level) {
    const i = levelIndex(level);
    return i > 0 ? LEVEL_ORDER[i - 1] : null;
  }

  function getStartLevelForGrade(grade) {
    const rule = NEW_STUDENT_START_RULES.find(r => r.grades.includes(grade));
    return rule ? rule.level : null;
  }

  function meetsForwardPass(level, score) {
    return level === LEVEL.LETTER ? score === LETTER_PERFECT_SCORE : score >= STANDARD_PASS_MARK;
  }

  /**
   * Resolves a freshly-submitted score for the level currently being actively
   * assessed (forward progression path). Returns a decision object.
   */
  function resolveForwardScore(level, score) {
    state.scores[level] = score;

    if (level === LEVEL.LETTER) {
      if (score === LETTER_PERFECT_SCORE) {
        return { type: "ADVANCE", level, score, to: LEVEL.WORD };
      }
      // Letter Level is the floor of the ladder; there is nowhere to go back to.
      return { type: "PLACE", level: LEVEL.LETTER, score, floor: true };
    }

    if (meetsForwardPass(level, score)) {
      const next = nextLevelOf(level);
      if (!next) return { type: "PROMOTE", level, score };
      return { type: "ADVANCE", level, score, to: next };
    }

    // Failed this level's own pass mark -> walk backward to find the highest
    // level whose OWN recorded score actually meets ITS pass mark.
    return walkBackward(prevLevelOf(level), level, score);
  }

  /**
   * Resolves a freshly-submitted score for a level being tested purely to
   * find the correct final placement after a higher level was failed.
   * `triggeredByLevel` is kept only for assessor-facing messaging (which
   * failure led here) — it plays no part in the placement decision itself.
   */
  function resolveCascadeScore(level, score, triggeredByLevel) {
    state.scores[level] = score;
    return evaluateBackwardScore(level, score, triggeredByLevel);
  }

  /**
   * A level is only ever a valid placement if ITS OWN score meets ITS OWN pass
   * mark — passing a lower level never "rescues" a higher level that was
   * failed. If this level also fails, the walk continues one level further
   * back; Letter Level is the absolute floor regardless of its own score.
   */
  function evaluateBackwardScore(level, score, triggeredByLevel) {
    if (meetsForwardPass(level, score)) {
      return { type: "PLACE", level, score, triggeredByLevel };
    }
    if (level === LEVEL.LETTER) {
      return { type: "PLACE", level: LEVEL.LETTER, score, floor: true, triggeredByLevel };
    }
    return walkBackward(prevLevelOf(level), level, score);
  }

  /**
   * Determines the next backward step: reuse an already-known score for the
   * level being checked (no need to re-test), or signal that a fresh
   * assessment is required before a decision can be reached.
   */
  function walkBackward(level, triggeredByLevel, triggeredByScore) {
    if (Object.prototype.hasOwnProperty.call(state.scores, level)) {
      return evaluateBackwardScore(level, state.scores[level], triggeredByLevel);
    }
    return { type: "NEED_ASSESSMENT", level, triggeredByLevel, triggeredByScore };
  }

  /* =========================================================================
     4. UI HELPERS
     ========================================================================= */

  const $ = sel => document.querySelector(sel);
  const $all = sel => Array.from(document.querySelectorAll(sel));

  function showScreen(id) {
    $all(".screen").forEach(s => s.classList.remove("active"));
    $(`#${id}`).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toast(message, type = "info", title = "") {
    const container = $("#toastContainer");
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.innerHTML = `${title ? `<strong>${title}</strong>` : ""}${message}`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add("leaving");
      setTimeout(() => el.remove(), 320);
    }, 3800);
  }

  function formatScore(score) {
    return Number.isInteger(score) ? `${score}/10` : `${score}/10`;
  }

  /* ---------- Stepper ---------- */
  function renderStepper() {
    const stepper = $("#stepper");
    const stages = [...LEVEL_ORDER, LEVEL.TUITION];
    const currentLevel = state.current ? state.current.level : (state.finalOutcome ? state.finalOutcome.level : state.startLevel);
    const currentIdx = currentLevel ? stages.indexOf(currentLevel === LEVEL.TUITION ? LEVEL.TUITION : currentLevel) : -1;

    stepper.innerHTML = stages.map((lvl, i) => {
      const meta = LEVEL_META[lvl];
      let cls = "";
      const visited = state.visitedLevels.includes(lvl);
      if (state.finalOutcome && (state.finalOutcome.level === lvl || (state.finalOutcome.type === "PROMOTE" && lvl === LEVEL.TUITION))) {
        cls = "done";
      } else if (i < currentIdx || (visited && i !== currentIdx)) {
        cls = "done";
      } else if (i === currentIdx) {
        cls = "current";
      }
      const connector = i < stages.length - 1 ? '<div class="step-connector"></div>' : "";
      return `
        <div class="step ${cls}">
          <div class="step-node">
            <div class="step-circle">${cls === "done" ? "✓" : meta.icon}</div>
            <div class="step-label">${meta.short}</div>
          </div>
          ${connector}
        </div>`;
    }).join("");

    const progressPct = currentIdx >= 0 ? Math.round((currentIdx / (stages.length - 1)) * 100) : 0;
    $("#progressFill").style.width = `${progressPct}%`;
  }

  /* ---------- Criteria rendering ---------- */
  function renderCriteria(level) {
    const data = ASSESSMENT_CRITERIA[level];
    let html = "";

    if (level === LEVEL.LETTER) {
      html += `<div class="criteria-question"><strong>Q.</strong> ${data.question}</div>`;
      html += `<div class="criteria-subhead">Letters Presented</div>`;
      html += `<div class="answer-grid">${data.letters.map(l => `<div class="answer-chip"><b>${l}</b></div>`).join("")}</div>`;
      html += `<div class="criteria-subhead">Answer Key (Letter → Sound)</div>`;
      html += `<div class="answer-grid">${data.answerKey.map(([l, s]) => `<div class="answer-chip"><b>${l}</b> — ${s}</div>`).join("")}</div>`;
    }

    if (level === LEVEL.WORD) {
      html += `<div class="criteria-question"><strong>Q.</strong> ${data.question}</div>`;
      html += `<div class="criteria-subhead">Words Presented</div>`;
      html += `<div class="answer-grid">${data.words.map(w => `<div class="answer-chip">${w}</div>`).join("")}</div>`;
      html += `<div class="criteria-subhead">Answer Key (Word — Meaning)</div>`;
      html += `<div class="answer-grid">${data.answerKey.map(([w, m]) => `<div class="answer-chip"><b>${w}</b> — ${m}</div>`).join("")}</div>`;
    }

    if (level === LEVEL.SENTENCE || level === LEVEL.STORY) {
      html += `<div class="criteria-question"><strong>${data.question}</strong></div>`;
      html += `<div class="criteria-subhead">Q2. Answer the following questions</div>`;
      html += `<ul class="check-list">${data.questions2.map((q, i) => `<li data-check><input type="checkbox" /><span class="item-text">${i + 1}. ${q}</span></li>`).join("")}</ul>`;
      html += `<div class="criteria-subhead">Q1 Answer Key</div>`;
      html += `<div class="criteria-question">${data.answerKeyReading}</div>`;
      html += `<div class="criteria-subhead">Q2 Answer Key</div>`;
      html += `<ul class="check-list">${data.answerKeyQuestions.map((a, i) => `<li data-check><input type="checkbox" /><span class="item-text">${i + 1}. ${a}</span></li>`).join("")}</ul>`;
    }

    if (level === LEVEL.ADVANCE) {
      html += `<div class="criteria-subhead">Tasks</div>`;
      html += `<ul class="check-list">${data.tasks.map(t => `<li data-check><input type="checkbox" /><span class="item-text">${t}</span></li>`).join("")}</ul>`;
      html += `<div class="criteria-subhead">Answer Key</div>`;
      html += data.answerKey.map(a => `<div class="criteria-question">${a}</div>`).join("");
    }

    html += `<div class="criteria-subhead">Marking Rubric</div>`;
    html += data.rubric.map(band => `
      <div class="rubric-band">
        <span class="rubric-range">${band.range}</span>
        <ul>${band.points.map(p => `<li>${p}</li>`).join("")}</ul>
      </div>`).join("");

    if (data.notes && data.notes.length) {
      html += `<div class="notes-block"><b>Notes:</b><ul>${data.notes.map(n => `<li>${n}</li>`).join("")}</ul></div>`;
    }

    html += `<div class="rules-block"><b>Placement Rules —</b><ul>${PLACEMENT_RULES[level].map(r => `<li>${r}</li>`).join("")}</ul></div>`;

    $("#criteriaBody").innerHTML = html;

    // Assessor self-check items (visual aid only — does not affect scoring/logic).
    $all("#criteriaBody .check-list li").forEach(li => {
      li.addEventListener("click", (e) => {
        if (e.target.tagName !== "INPUT") {
          const cb = li.querySelector("input");
          cb.checked = !cb.checked;
        }
        li.classList.toggle("checked", li.querySelector("input").checked);
      });
    });
  }

  /* ---------- Accordion toggle (generic, event-delegated) ---------- */
  document.addEventListener("click", (e) => {
    const header = e.target.closest(".accordion-header");
    if (!header) return;
    const targetId = header.dataset.target;
    const body = document.getElementById(targetId);
    if (!body) return;
    const collapsed = body.classList.toggle("collapsed");
    header.classList.toggle("collapsed", collapsed);
  });

  /* ---------- Timeline rendering ---------- */
  function timelineEntryHtml(entry) {
    const cls = entry.kind === "final" ? "tl-final" : entry.pass === true ? "tl-pass" : entry.pass === false ? "tl-fail" : "";
    return `<li class="${cls}">
      <div class="tl-title">${entry.title}</div>
      <div class="tl-detail">${entry.detail}</div>
    </li>`;
  }

  function renderTimeline(targetId) {
    const html = state.history.map(timelineEntryHtml).join("");
    $(`#${targetId}`).innerHTML = html;
  }

  /* =========================================================================
     5. FLOW CONTROL
     ========================================================================= */

  function resetApp() {
    state.studentType = null;
    state.grade = null;
    state.startLevel = null;
    state.scores = {};
    state.history = [];
    state.current = null;
    state.visitedLevels = [];
    state.finalOutcome = null;

    $("#gradeSelect").value = "";
    $("#retainedLevelSelect").value = "";
    $("#derivedLevelBox").classList.add("hidden");
    $("#startNewBtn").disabled = true;
    $("#startRetainedBtn").disabled = true;
    $all(".choice-card").forEach(c => c.classList.remove("selected"));
    $("#toSetupBtn").disabled = true;

    renderStepper();
    showScreen("screen-welcome");
  }

  /* ---------- Step 1: student type ---------- */
  $all(".choice-card").forEach(card => {
    card.addEventListener("click", () => {
      $all(".choice-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      state.studentType = card.dataset.studentType;
      $("#toSetupBtn").disabled = false;
    });
  });

  $("#toSetupBtn").addEventListener("click", () => {
    if (state.studentType === "new") {
      showScreen("screen-new-setup");
    } else {
      showScreen("screen-retained-setup");
    }
  });

  $("#backToWelcomeBtn1").addEventListener("click", () => showScreen("screen-welcome"));
  $("#backToWelcomeBtn2").addEventListener("click", () => showScreen("screen-welcome"));

  /* ---------- Step 2a: new student grade ---------- */
  $("#gradeSelect").addEventListener("change", (e) => {
    const grade = e.target.value;
    state.grade = grade;
    const level = getStartLevelForGrade(grade);
    state.startLevel = level;

    const rule = NEW_STUDENT_START_RULES.find(r => r.level === level);
    $("#derivedLevelName").textContent = LEVEL_META[level].icon + "  " + LEVEL_META[level].label;
    $("#derivedLevelReason").textContent = `New students in ${rule.gradeLabel} begin at ${LEVEL_META[level].label}.`;
    $("#derivedLevelBox").classList.remove("hidden");
    $("#startNewBtn").disabled = false;
  });

  $("#startNewBtn").addEventListener("click", () => {
    beginAssessmentFlow(`Starting assessment as a New Student (Grade ${state.grade}). Starting level determined by grade: ${LEVEL_META[state.startLevel].label}.`);
  });

  /* ---------- Step 2b: retained student level ---------- */
  $("#retainedLevelSelect").addEventListener("change", (e) => {
    state.startLevel = e.target.value;
    $("#startRetainedBtn").disabled = !e.target.value;
  });

  $("#startRetainedBtn").addEventListener("click", () => {
    beginAssessmentFlow(`Starting assessment as a Retained Student. Resuming at the last completed/retained level: ${LEVEL_META[state.startLevel].label}.`);
  });

  function beginAssessmentFlow(reason) {
    state.scores = {};
    state.history = [];
    state.visitedLevels = [state.startLevel];
    state.current = { level: state.startLevel, mode: "forward", reason };
    renderAssessmentScreen();
    showScreen("screen-assessment");
  }

  /* ---------- Assessment screen rendering ---------- */
  function renderAssessmentScreen() {
    const { level, mode, reason } = state.current;
    const meta = LEVEL_META[level];

    $("#levelIcon").textContent = meta.icon;
    $("#levelTitle").textContent = meta.label.toUpperCase();

    const banner = $("#assessmentBanner");
    banner.textContent = reason;
    banner.classList.toggle("cascade", mode === "cascade");

    renderCriteria(level);

    $("#scoreInput").value = "";
    $("#scoreError").classList.add("hidden");
    $("#decisionPanel").classList.add("hidden");
    $("#decisionPanel").innerHTML = "";
    $("#continueBtn").classList.add("hidden");
    $("#submitScoreBtn").disabled = false;
    $("#scoreInput").disabled = false;

    renderTimeline("timeline");
    renderStepper();
  }

  /* ---------- Score submission ---------- */
  $("#submitScoreBtn").addEventListener("click", handleScoreSubmit);
  $("#scoreInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleScoreSubmit();
  });

  function handleScoreSubmit() {
    const raw = $("#scoreInput").value;
    const score = parseFloat(raw);
    const errorEl = $("#scoreError");

    if (raw === "" || isNaN(score) || score < MIN_SCORE || score > MAX_SCORE) {
      errorEl.textContent = `Please enter a valid score between ${MIN_SCORE} and ${MAX_SCORE}.`;
      errorEl.classList.remove("hidden");
      toast("Invalid score entered.", "error", "Validation Error");
      return;
    }
    errorEl.classList.add("hidden");

    const { level, mode, triggeredByLevel } = state.current;
    const decision = mode === "forward"
      ? resolveForwardScore(level, score)
      : resolveCascadeScore(level, score, triggeredByLevel);

    // Log the raw test itself to the timeline.
    const meta = LEVEL_META[level];
    state.history.push({
      title: `${meta.label} assessed — Score = ${formatScore(score)}`,
      detail: mode === "forward"
        ? `Administered as the active assessment level.`
        : `Administered as a backward placement check following a lower score at ${LEVEL_META[triggeredByLevel].label}.`,
      pass: meetsForwardPass(level, score),
    });

    $("#scoreInput").disabled = true;
    $("#submitScoreBtn").disabled = true;

    // Pass the score just typed by the assessor explicitly: decision.score can
    // instead reflect an earlier, already-recorded level's score whenever the
    // cascade resolves silently through known history (see PLACE handling).
    applyDecision(decision, score);
  }

  /**
   * Renders the decision panel + updates timeline/state based on the engine's
   * decision object, then decides whether the loop continues or the final
   * report is shown. `submittedScore` is always the score the assessor just
   * entered on the current screen (used for the on-screen "Score:" display).
   */
  function applyDecision(decision, submittedScore) {
    let panelClass, badgeText, badgeClass, reasonText, nextText, title, detail;

    switch (decision.type) {
      case "ADVANCE": {
        panelClass = "pass"; badgeClass = "pass"; badgeText = "PASS";
        reasonText = `Score of ${formatScore(decision.score)} meets the pass mark for ${LEVEL_META[decision.level].label} (${passMarkDescription(decision.level)}).`;
        nextText = `Moving forward to ${LEVEL_META[decision.to].label}.`;
        title = `Advanced to ${LEVEL_META[decision.to].label}`;
        detail = reasonText;
        state.history.push({ title, detail, pass: true });

        state.current = { level: decision.to, mode: "forward", reason: `Advanced from ${LEVEL_META[decision.level].label} after scoring ${formatScore(decision.score)} (pass mark met).` };
        if (!state.visitedLevels.includes(decision.to)) state.visitedLevels.push(decision.to);
        break;
      }

      case "PROMOTE": {
        panelClass = "pass"; badgeClass = "pass"; badgeText = "PASS";
        reasonText = `Score of ${formatScore(decision.score)} meets the pass mark at Advance Level (${passMarkDescription(LEVEL.ADVANCE)}).`;
        nextText = `Student is promoted to the Tuition Program.`;
        title = `Promoted to Tuition Program`;
        detail = reasonText;
        state.history.push({ title, detail, pass: true, kind: "final" });

        state.finalOutcome = { type: "PROMOTE", level: LEVEL.TUITION };
        break;
      }

      case "NEED_ASSESSMENT": {
        panelClass = "fail"; badgeClass = "fail"; badgeText = "BELOW PASS MARK";
        const triggeredMeta = LEVEL_META[decision.triggeredByLevel];
        const checkMeta = LEVEL_META[decision.level];
        reasonText = `${triggeredMeta.label} score of ${formatScore(decision.triggeredByScore)} is below the pass mark. To determine final placement, the student is now assessed at ${checkMeta.label}.`;
        nextText = `Moving back to assess ${checkMeta.label}.`;
        title = `Moving back to ${checkMeta.label}`;
        detail = reasonText;
        state.history.push({ title, detail, pass: false });

        state.current = { level: decision.level, mode: "cascade", triggeredByLevel: decision.triggeredByLevel, reason: `${triggeredMeta.label} score of ${formatScore(decision.triggeredByScore)} was below the pass mark. Assessing ${checkMeta.label} to determine final placement.` };
        if (!state.visitedLevels.includes(decision.level)) state.visitedLevels.push(decision.level);
        break;
      }

      case "PLACE": {
        const placedMeta = LEVEL_META[decision.level];
        panelClass = "info"; badgeClass = "info"; badgeText = "PLACEMENT DETERMINED";

        if (decision.floor) {
          reasonText = `Letter Level score of ${formatScore(decision.score)} does not meet the required perfect score. Since Letter Level is the base of the ladder, the student is finally placed here regardless.`;
        } else {
          reasonText = `${placedMeta.label} score of ${formatScore(decision.score)} meets its own pass mark (${passMarkDescription(decision.level)}). A level is only ever used as the final placement once its own score actually meets that mark, so the student is placed at ${placedMeta.label}.`;
        }
        nextText = `Final Placement: ${placedMeta.label}.`;
        title = `Final Placement — ${placedMeta.label}`;
        detail = reasonText;
        state.history.push({ title, detail, kind: "final" });

        state.finalOutcome = { type: "PLACE", level: decision.level };
        break;
      }
    }

    // Render decision panel
    const panel = $("#decisionPanel");
    panel.className = `decision-panel ${panelClass}`;
    panel.innerHTML = `
      <div class="decision-row">
        <span class="decision-score">Score: ${formatScore(submittedScore)}</span>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="decision-reason">${reasonText}</div>
      <div class="decision-next">➜ ${nextText}</div>
    `;
    panel.classList.remove("hidden");

    toast(reasonText, decision.type === "PLACE" || decision.type === "PROMOTE" ? "success" : (badgeClass === "fail" ? "warning" : "success"), title);

    renderTimeline("timeline");
    renderStepper();

    const continueBtn = $("#continueBtn");
    continueBtn.classList.remove("hidden");
    continueBtn.textContent = (decision.type === "PLACE" || decision.type === "PROMOTE") ? "View Final Report →" : "Continue →";
    continueBtn.onclick = () => {
      if (decision.type === "PLACE" || decision.type === "PROMOTE") {
        renderFinalReport();
        showScreen("screen-final");
      } else {
        renderAssessmentScreen();
      }
    };
  }

  function passMarkDescription(level) {
    return level === LEVEL.LETTER ? "exactly 10/10" : `score of ${STANDARD_PASS_MARK} or above`;
  }

  /* =========================================================================
     6. FINAL REPORT
     ========================================================================= */

  function renderFinalReport() {
    const finalLevel = state.finalOutcome.level;
    const isPromoted = state.finalOutcome.type === "PROMOTE";
    const startIdx = levelIndex(state.startLevel);
    const finalIdx = isPromoted ? LEVEL_ORDER.length : levelIndex(finalLevel);

    // ---- Summary tiles ----
    let promotionStatus, promotionTone;
    if (isPromoted) {
      promotionStatus = "Promoted — Advance Level Cleared";
      promotionTone = "success";
    } else if (finalIdx > startIdx) {
      promotionStatus = `Promoted to ${LEVEL_META[finalLevel].label}`;
      promotionTone = "success";
    } else if (finalIdx === startIdx) {
      promotionStatus = `Retained at ${LEVEL_META[finalLevel].label}`;
      promotionTone = "warning";
    } else {
      promotionStatus = `Moved Back — Retained at ${LEVEL_META[finalLevel].label}`;
      promotionTone = "warning";
    }

    const nextStep = isPromoted
      ? "Enroll the student in the Tuition Program for the next academic cycle."
      : `Begin the next assessment cycle at ${LEVEL_META[finalLevel].label} (last completed/retained level).`;

    const recommendation = isPromoted
      ? "Student has cleared all core reading levels. Recommend continued engagement through the Tuition Program's advanced curriculum."
      : buildRecommendation(finalLevel);

    const reasonText = state.history.filter(h => h.kind === "final").map(h => h.detail).join(" ");

    $("#finalSummaryGrid").innerHTML = `
      <div class="summary-tile">
        <div class="tile-label">Student Type</div>
        <div class="tile-value">${state.studentType === "new" ? "New Student" : "Retained Student"}</div>
      </div>
      <div class="summary-tile">
        <div class="tile-label">Starting Level</div>
        <div class="tile-value">${LEVEL_META[state.startLevel].icon} ${LEVEL_META[state.startLevel].label}</div>
      </div>
      <div class="summary-tile accent">
        <div class="tile-label">Final Placement</div>
        <div class="tile-value">${LEVEL_META[finalLevel].icon} ${LEVEL_META[finalLevel].label}</div>
      </div>
      <div class="summary-tile ${promotionTone}">
        <div class="tile-label">Promotion Status</div>
        <div class="tile-value">${promotionStatus}</div>
      </div>
    `;

    // ---- Score table (in the order levels were actually assessed) ----
    const orderedLevels = LEVEL_ORDER.filter(l => Object.prototype.hasOwnProperty.call(state.scores, l));
    $("#scoreTable tbody").innerHTML = orderedLevels.map(l => {
      const score = state.scores[l];
      const passed = meetsForwardPass(l, score);
      return `<tr>
        <td>${LEVEL_META[l].icon} ${LEVEL_META[l].label}</td>
        <td>${formatScore(score)}</td>
        <td><span class="badge ${passed ? "pass" : "fail"}">${passed ? "Pass" : "Below Pass Mark"}</span></td>
      </tr>`;
    }).join("");

    // ---- Timeline ----
    renderTimeline("finalTimeline");

    // ---- Text blocks ----
    $("#finalReason").textContent = reasonText || "Placement determined by the assessment engine based on submitted scores.";
    $("#finalRecommendation").textContent = recommendation;
    $("#finalPromotion").textContent = promotionStatus;
    $("#finalNextStep").textContent = nextStep;

    renderStepper();
  }

  function buildRecommendation(finalLevel) {
    const meta = LEVEL_META[finalLevel];
    return `Focus continued instruction on ${meta.label} skills using the rubric criteria provided. Re-assess against the next level (${LEVEL_META[nextLevelOf(finalLevel) || LEVEL.TUITION].label}) once ${meta.label} is consistently mastered.`;
  }

  /* =========================================================================
     7. RESTART / INIT
     ========================================================================= */

  $("#restartBtn").addEventListener("click", () => {
    if (state.history.length === 0 || confirm("Start over? Current assessment progress will be lost.")) {
      resetApp();
    }
  });
  $("#restartFromFinalBtn").addEventListener("click", resetApp);

  // Initial paint
  resetApp();
})();
