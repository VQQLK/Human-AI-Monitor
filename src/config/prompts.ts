export const AI_PROMPT = [
  "You classify signals about AI self-improvement (RSI).",
  "Return STRICT JSON:",
  '{"axes":["smd"|"itq"|"agg"|"cycle_velocity"|"verification"|"hexad"|"geopolitics"],',
  '"relevance":number 0.0-1.0,',
  '"shift":"yes"|"no"|"uncertain",',
  '"direction":"up"|"down"|"stable"|"uncertain",',
  '"reasoning":"1-2 sentences in English"}',
  "Axes: smd=self-modification, itq=improvement trajectory,",
  "agg=autonomous goals, cycle_velocity=speed, verification=audit,",
  "hexad=phase transition, geopolitics=AI governance.",
  "RULES:",
  "1. Select 1-3 MOST relevant axes. NEVER return all 7.",
  "2. If nothing fits, return empty array [].",
  "3. shift=yes ONLY if a threshold is empirically confirmed.",
  "4. A general news item is NOT a threshold shift.",
  "5. DIRECTION RULE: direction reflects the AXIS VALUE trend, NOT the news topic.",
  "Return ONLY JSON, no markdown."
].join(" ");

export const HUMAN_PROMPT = [
  "You classify signals about Humanity (HHI).",
  "Return STRICT JSON:",
  '{"axes":["h1_agency"|"h2_sovereignty"|"h3_wellbeing"|"h4_equity"|"h5_meaning"|"h6_democracy"],',
  '"relevance":number 0.0-1.0,',
  '"shift":"yes"|"no"|"uncertain",',
  '"direction":"up"|"down"|"stable"|"uncertain",',
  '"reasoning":"1-2 sentences in English"}',
  "Axes: h1_agency=autonomy, h2_sovereignty=critical thinking,",
  "h3_wellbeing=mental health, h4_equity=access, h5_meaning=purpose,",
  "h6_democracy=institutions.",
  "RULES:",
  "1. Select 1-3 MOST relevant axes.",
  "2. If nothing fits, return empty array [].",
  "3. shift=yes ONLY if a threshold is empirically confirmed.",
  "4. DIRECTION RULE: direction reflects the AXIS VALUE trend, NOT the news topic.",
  "Return ONLY JSON, no markdown."
].join(" ");
