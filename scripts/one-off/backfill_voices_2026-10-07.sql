
INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Dario Amodei',
  'Anthropic',
  'frontier_labs',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%dario amodei%' OR LOWER(summary) LIKE '%dario amodei%' OR LOWER(title) LIKE '%amodei%' OR LOWER(summary) LIKE '%amodei%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Sam Altman',
  'OpenAI',
  'frontier_labs',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%sam altman%' OR LOWER(summary) LIKE '%sam altman%' OR LOWER(title) LIKE '%altman%' OR LOWER(summary) LIKE '%altman%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Elon Musk',
  'xAI',
  'frontier_labs',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%elon musk%' OR LOWER(summary) LIKE '%elon musk%' OR LOWER(title) LIKE '%musk%' OR LOWER(summary) LIKE '%musk%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Jensen Huang',
  'Nvidia',
  'frontier_labs',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%jensen huang%' OR LOWER(summary) LIKE '%jensen huang%' OR LOWER(title) LIKE '%huang%' OR LOWER(summary) LIKE '%huang%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Mark Zuckerberg',
  'Meta',
  'frontier_labs',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%mark zuckerberg%' OR LOWER(summary) LIKE '%mark zuckerberg%' OR LOWER(title) LIKE '%zuckerberg%' OR LOWER(summary) LIKE '%zuckerberg%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Demis Hassabis',
  'Google DeepMind',
  'researchers',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%demis hassabis%' OR LOWER(summary) LIKE '%demis hassabis%' OR LOWER(title) LIKE '%hassabis%' OR LOWER(summary) LIKE '%hassabis%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Geoffrey Hinton',
  'ex-Google, Nobel Laureate',
  'researchers',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%geoffrey hinton%' OR LOWER(summary) LIKE '%geoffrey hinton%' OR LOWER(title) LIKE '%hinton%' OR LOWER(summary) LIKE '%hinton%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Stuart Russell',
  'UC Berkeley',
  'researchers',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%stuart russell%' OR LOWER(summary) LIKE '%stuart russell%' OR LOWER(title) LIKE '%russell%' OR LOWER(summary) LIKE '%russell%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Yann LeCun',
  'Meta, Chief AI Scientist',
  'researchers',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%yann lecun%' OR LOWER(summary) LIKE '%yann lecun%' OR LOWER(title) LIKE '%lecun%' OR LOWER(summary) LIKE '%lecun%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'António Guterres',
  'UN Secretary-General',
  'institutions',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%antónio guterres%' OR LOWER(summary) LIKE '%antónio guterres%' OR LOWER(title) LIKE '%guterres%' OR LOWER(summary) LIKE '%guterres%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Donald Trump',
  'US President',
  'institutions',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%donald trump%' OR LOWER(summary) LIKE '%donald trump%' OR LOWER(title) LIKE '%trump%' OR LOWER(summary) LIKE '%trump%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Xi Jinping',
  'President of the People''s Republic of China',
  'institutions',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%xi jinping%' OR LOWER(summary) LIKE '%xi jinping%' OR LOWER(title) LIKE '%xi%' OR LOWER(summary) LIKE '%xi%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Fields Medal Winners',
  '25 Fields Medal Winners',
  'mathematics',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%fields medal%' OR LOWER(summary) LIKE '%fields medal%' OR LOWER(title) LIKE '%fields medalists%' OR LOWER(summary) LIKE '%fields medalists%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Yuk Hui',
  'Philosopher of Technology, Hong Kong',
  'philosophy',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%yuk hui%' OR LOWER(summary) LIKE '%yuk hui%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Jay Clayton',
  'Director of National Intelligence, Head of SIF',
  'us_administration',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%jay clayton%' OR LOWER(summary) LIKE '%jay clayton%' OR LOWER(title) LIKE '%clayton%' OR LOWER(summary) LIKE '%clayton%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Andrew Ferguson',
  'FTC Chairman',
  'us_administration',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%andrew ferguson%' OR LOWER(summary) LIKE '%andrew ferguson%' OR LOWER(title) LIKE '%ferguson%' OR LOWER(summary) LIKE '%ferguson%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Emil Michael',
  'Deputy Secretary of Defense for R&D',
  'us_administration',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%emil michael%' OR LOWER(summary) LIKE '%emil michael%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Scott Kupor',
  'Director of Office of Personnel Management',
  'us_administration',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%scott kupor%' OR LOWER(summary) LIKE '%scott kupor%' OR LOWER(title) LIKE '%kupor%' OR LOWER(summary) LIKE '%kupor%');


INSERT OR IGNORE INTO voices (item_hash, speaker, affiliation, category, quote, date, source, relevance, axes, created_at)
SELECT 
  hash,
  'Susie Wiles',
  'White House Chief of Staff',
  'us_administration',
  title,
  date,
  source,
  relevance,
  axes,
  CURRENT_TIMESTAMP
FROM items
WHERE relevance >= 0.8
  AND (LOWER(title) LIKE '%susie wiles%' OR LOWER(summary) LIKE '%susie wiles%' OR LOWER(title) LIKE '%wiles%' OR LOWER(summary) LIKE '%wiles%');
