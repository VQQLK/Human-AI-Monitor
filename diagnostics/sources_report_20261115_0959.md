# HUMAN-AI-MONITOR — АУДИТ ИСТОЧНИКОВ И VOICES
- root: `/Users/id/Human-AI-Monitor/human-ai-monitor-collector`  |  2026-11-15 09:59 UTC  |  python 3.11.15  |  PyYAML: True
- git: `83dec71`, изменённых файлов: 2

## 1. Инвентаризация конфигов
- `config/axes_ai.yaml` (4294 B, kind=AI): 
- `config/axes_human.yaml` (2640 B, kind=HUMAN): 
- `config/sources_ai.yaml` (3677 B, kind=AI): rss=30
- `config/sources_human.yaml` (3460 B, kind=HUMAN): rss=30
- `config/voices.yaml` (12247 B, kind=VOICES): voices=63
- Итого: HUMAN=30, VOICES=63, прочие группы=0

## 2. Структурный аудит
### HUMAN (n=30)
- дубликаты имён: нет
- дубликаты фидов (нормализованные): нет
- дубликаты доменов: нет
- отсутствуют поля: lang: ['Business & Human Rights Resource Centre']; category: ['Benton Institute for Broadband & Society', 'Reuters Institute', 'Noema Magazine', 'Politico — Politics', 'NPR — World', 'Pew Research Center', 'EFF (Electronic Frontier Foundation)', 'Our World in Data', 'ТАСС', 'FT Chinese (FT中文网)', 'Al Jazeera', 'The Hindu — International', 'Aeon', 'Psyche', '3 Quarks Daily', 'Axios', 'Science', 'MIT News (Engineering)', 'SpaceNews', 'The Atlantic', 'Inside Higher Ed', 'Issues in Science and Technology', 'STAT News', 'IEEE Spectrum', 'Phys.org', 'Nature', 'Quanta Magazine', 'New Scientist', 'Business & Human Rights Resource Centre', 'Haber 7']; weight: ['Benton Institute for Broadband & Society', 'Reuters Institute', 'Noema Magazine', 'Politico — Politics', 'NPR — World', 'Pew Research Center', 'EFF (Electronic Frontier Foundation)', 'Our World in Data', 'ТАСС', 'FT Chinese (FT中文网)', 'Al Jazeera', 'The Hindu — International', 'Aeon', 'Psyche', '3 Quarks Daily', 'Axios', 'Science', 'MIT News (Engineering)', 'SpaceNews', 'The Atlantic', 'Inside Higher Ed', 'Issues in Science and Technology', 'STAT News', 'IEEE Spectrum', 'Phys.org', 'Nature', 'Quanta Magazine', 'New Scientist', 'Business & Human Rights Resource Centre', 'Haber 7']; enabled: ['Benton Institute for Broadband & Society', 'Reuters Institute', 'Noema Magazine', 'Politico — Politics', 'NPR — World', 'Pew Research Center', 'EFF (Electronic Frontier Foundation)', 'Our World in Data', 'ТАСС', 'FT Chinese (FT中文网)', 'Al Jazeera', 'The Hindu — International', 'Aeon', 'Psyche', '3 Quarks Daily', 'Axios', 'Science', 'MIT News (Engineering)', 'SpaceNews', 'The Atlantic', 'Inside Higher Ed', 'Issues in Science and Technology', 'STAT News', 'IEEE Spectrum', 'Phys.org', 'Nature', 'Quanta Magazine', 'New Scientist', 'Business & Human Rights Resource Centre', 'Haber 7']
### VOICES (n=63)
- дубликаты имён: нет
- дубликаты фидов (нормализованные): нет
- дубликаты доменов: нет
- отсутствуют поля: feed_url: ['Dario Amodei', 'Claude', 'Sam Altman', 'Jensen Huang', 'Ilya Sutskever', 'Elon Musk', 'Mark Zuckerberg', 'Demis Hassabis', 'Yann LeCun', 'Andrej Karpathy', 'Geoffrey Hinton', 'Paul Christiano', 'Stuart Russell', 'Eliezer Yudkowsky', 'Henry Shevlin', 'Yuk Hui', 'Jiang Xueqin', 'Marc Andreessen', 'Peter Thiel', 'Paul Graham', 'Jeff Bezos', 'Bill Gates', 'Vitalik Buterin', 'Alex Karp', 'Mira Murati', 'Mustafa Suleyman', 'Greg Brockman', 'Jakub Pachocki', 'Sundar Pichai', 'Satya Nadella', 'Fei-Fei Li', 'Yoshua Bengio', 'Max Tegmark', 'Nick Bostrom', 'Sergey Brin', 'Arkady Volozh', 'Arthur Mensch', 'Aidan Gomez', 'Moustapha Cisse', 'Pelonomi Moiloa', 'Liang Wenfeng', 'Yang Zhilin', 'Junyang Lin', 'Tang Jie', 'Wu Yonghui', 'Yan Junjie', 'Zhang Zhengyou', 'Fields Medal Winners', 'OpenAI', 'xAI', 'Google', 'Microsoft', 'Meta', 'Nvidia', 'DeepSeek', 'Alibaba Qwen', 'Moonshot AI', 'Zhipu AI', 'ByteDance', 'Tencent', 'Mistral AI', 'Perplexity AI', 'Nobel Prize Winners']; lang: ['Dario Amodei', 'Claude', 'Sam Altman', 'Jensen Huang', 'Ilya Sutskever', 'Elon Musk', 'Mark Zuckerberg', 'Demis Hassabis', 'Yann LeCun', 'Andrej Karpathy', 'Geoffrey Hinton', 'Paul Christiano', 'Stuart Russell', 'Eliezer Yudkowsky', 'Henry Shevlin', 'Yuk Hui', 'Jiang Xueqin', 'Marc Andreessen', 'Peter Thiel', 'Paul Graham', 'Jeff Bezos', 'Bill Gates', 'Vitalik Buterin', 'Alex Karp', 'Mira Murati', 'Mustafa Suleyman', 'Greg Brockman', 'Jakub Pachocki', 'Sundar Pichai', 'Satya Nadella', 'Fei-Fei Li', 'Yoshua Bengio', 'Max Tegmark', 'Nick Bostrom', 'Sergey Brin', 'Arkady Volozh', 'Arthur Mensch', 'Aidan Gomez', 'Moustapha Cisse', 'Pelonomi Moiloa', 'Liang Wenfeng', 'Yang Zhilin', 'Junyang Lin', 'Tang Jie', 'Wu Yonghui', 'Yan Junjie', 'Zhang Zhengyou', 'Fields Medal Winners', 'OpenAI', 'xAI', 'Google', 'Microsoft', 'Meta', 'Nvidia', 'DeepSeek', 'Alibaba Qwen', 'Moonshot AI', 'Zhipu AI', 'ByteDance', 'Tencent', 'Mistral AI', 'Perplexity AI', 'Nobel Prize Winners']; weight: ['Dario Amodei', 'Claude', 'Sam Altman', 'Jensen Huang', 'Ilya Sutskever', 'Elon Musk', 'Mark Zuckerberg', 'Demis Hassabis', 'Yann LeCun', 'Andrej Karpathy', 'Geoffrey Hinton', 'Paul Christiano', 'Stuart Russell', 'Eliezer Yudkowsky', 'Henry Shevlin', 'Yuk Hui', 'Jiang Xueqin', 'Marc Andreessen', 'Peter Thiel', 'Paul Graham', 'Jeff Bezos', 'Bill Gates', 'Vitalik Buterin', 'Alex Karp', 'Mira Murati', 'Mustafa Suleyman', 'Greg Brockman', 'Jakub Pachocki', 'Sundar Pichai', 'Satya Nadella', 'Fei-Fei Li', 'Yoshua Bengio', 'Max Tegmark', 'Nick Bostrom', 'Sergey Brin', 'Arkady Volozh', 'Arthur Mensch', 'Aidan Gomez', 'Moustapha Cisse', 'Pelonomi Moiloa', 'Liang Wenfeng', 'Yang Zhilin', 'Junyang Lin', 'Tang Jie', 'Wu Yonghui', 'Yan Junjie', 'Zhang Zhengyou', 'Fields Medal Winners', 'OpenAI', 'xAI', 'Google', 'Microsoft', 'Meta', 'Nvidia', 'DeepSeek', 'Alibaba Qwen', 'Moonshot AI', 'Zhipu AI', 'ByteDance', 'Tencent', 'Mistral AI', 'Perplexity AI', 'Nobel Prize Winners']; enabled: ['Dario Amodei', 'Claude', 'Sam Altman', 'Jensen Huang', 'Ilya Sutskever', 'Elon Musk', 'Mark Zuckerberg', 'Demis Hassabis', 'Yann LeCun', 'Andrej Karpathy', 'Geoffrey Hinton', 'Paul Christiano', 'Stuart Russell', 'Eliezer Yudkowsky', 'Henry Shevlin', 'Yuk Hui', 'Jiang Xueqin', 'Marc Andreessen', 'Peter Thiel', 'Paul Graham', 'Jeff Bezos', 'Bill Gates', 'Vitalik Buterin', 'Alex Karp', 'Mira Murati', 'Mustafa Suleyman', 'Greg Brockman', 'Jakub Pachocki', 'Sundar Pichai', 'Satya Nadella', 'Fei-Fei Li', 'Yoshua Bengio', 'Max Tegmark', 'Nick Bostrom', 'Sergey Brin', 'Arkady Volozh', 'Arthur Mensch', 'Aidan Gomez', 'Moustapha Cisse', 'Pelonomi Moiloa', 'Liang Wenfeng', 'Yang Zhilin', 'Junyang Lin', 'Tang Jie', 'Wu Yonghui', 'Yan Junjie', 'Zhang Zhengyou', 'Fields Medal Winners', 'OpenAI', 'xAI', 'Google', 'Microsoft', 'Meta', 'Nvidia', 'DeepSeek', 'Alibaba Qwen', 'Moonshot AI', 'Zhipu AI', 'ByteDance', 'Tencent', 'Mistral AI', 'Perplexity AI', 'Nobel Prize Winners']
- пересечение доменов HUMAN∩VOICES: нет
- фиды по http (не https): нет

## 3. Состав портфеля (по полям конфига)
- HUMAN.lang: en×26, ru×1, zh×1, ?×1, tr×1
- HUMAN.category: ?×30
- HUMAN.enabled: ?×30
- VOICES.lang: ?×63
- VOICES.category: frontier_labs×39, researchers×10, safety_philosophy×5, investors×5, mathematics×2, crypto×1, enterprise×1
- VOICES.enabled: ?×63

## 4. Живой пробинг фидов (HUMAN+VOICES)
| источник | HTTP | items | свежая(д) | items/7д | >30д% | AI-hit | примечание |
|---|---|---|---|---|---|---|---|
| Benton Institute for Broadband & S | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Reuters Institute | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Noema Magazine | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Politico — Politics | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| NPR — World | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Pew Research Center | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| EFF (Electronic Frontier Foundatio | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Our World in Data | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| ТАСС | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| FT Chinese (FT中文网) | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Al Jazeera | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| The Hindu — International | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Aeon | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Psyche | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| 3 Quarks Daily | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Axios | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Science | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| MIT News (Engineering) | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| SpaceNews | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| The Atlantic | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Inside Higher Ed | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Issues in Science and Technology | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| STAT News | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| IEEE Spectrum | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Phys.org | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Nature | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Quanta Magazine | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| New Scientist | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Business & Human Rights Resource C | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Haber 7 | ERR | None | None | None | None | None/None | URLError: <urlopen error [SSL: CERTIFICATE_VERIFY_FAILED] ce |
| Dario Amodei | — | — | — | — | — | — | нет URL |
| Claude | — | — | — | — | — | — | нет URL |
| Sam Altman | — | — | — | — | — | — | нет URL |
| Jensen Huang | — | — | — | — | — | — | нет URL |
| Ilya Sutskever | — | — | — | — | — | — | нет URL |
| Elon Musk | — | — | — | — | — | — | нет URL |
| Mark Zuckerberg | — | — | — | — | — | — | нет URL |
| Demis Hassabis | — | — | — | — | — | — | нет URL |
| Yann LeCun | — | — | — | — | — | — | нет URL |
| Andrej Karpathy | — | — | — | — | — | — | нет URL |
| Geoffrey Hinton | — | — | — | — | — | — | нет URL |
| Paul Christiano | — | — | — | — | — | — | нет URL |
| Stuart Russell | — | — | — | — | — | — | нет URL |
| Eliezer Yudkowsky | — | — | — | — | — | — | нет URL |
| Henry Shevlin | — | — | — | — | — | — | нет URL |
| Yuk Hui | — | — | — | — | — | — | нет URL |
| Jiang Xueqin | — | — | — | — | — | — | нет URL |
| Marc Andreessen | — | — | — | — | — | — | нет URL |
| Peter Thiel | — | — | — | — | — | — | нет URL |
| Paul Graham | — | — | — | — | — | — | нет URL |
| Jeff Bezos | — | — | — | — | — | — | нет URL |
| Bill Gates | — | — | — | — | — | — | нет URL |
| Vitalik Buterin | — | — | — | — | — | — | нет URL |
| Alex Karp | — | — | — | — | — | — | нет URL |
| Mira Murati | — | — | — | — | — | — | нет URL |
| Mustafa Suleyman | — | — | — | — | — | — | нет URL |
| Greg Brockman | — | — | — | — | — | — | нет URL |
| Jakub Pachocki | — | — | — | — | — | — | нет URL |
| Sundar Pichai | — | — | — | — | — | — | нет URL |
| Satya Nadella | — | — | — | — | — | — | нет URL |
| Fei-Fei Li | — | — | — | — | — | — | нет URL |
| Yoshua Bengio | — | — | — | — | — | — | нет URL |
| Max Tegmark | — | — | — | — | — | — | нет URL |
| Nick Bostrom | — | — | — | — | — | — | нет URL |
| Sergey Brin | — | — | — | — | — | — | нет URL |
| Arkady Volozh | — | — | — | — | — | — | нет URL |
| Arthur Mensch | — | — | — | — | — | — | нет URL |
| Aidan Gomez | — | — | — | — | — | — | нет URL |
| Moustapha Cisse | — | — | — | — | — | — | нет URL |
| Pelonomi Moiloa | — | — | — | — | — | — | нет URL |
| Liang Wenfeng | — | — | — | — | — | — | нет URL |
| Yang Zhilin | — | — | — | — | — | — | нет URL |
| Junyang Lin | — | — | — | — | — | — | нет URL |
| Tang Jie | — | — | — | — | — | — | нет URL |
| Wu Yonghui | — | — | — | — | — | — | нет URL |
| Yan Junjie | — | — | — | — | — | — | нет URL |
| Zhang Zhengyou | — | — | — | — | — | — | нет URL |
| Fields Medal Winners | — | — | — | — | — | — | нет URL |
| OpenAI | — | — | — | — | — | — | нет URL |
| xAI | — | — | — | — | — | — | нет URL |
| Google | — | — | — | — | — | — | нет URL |
| Microsoft | — | — | — | — | — | — | нет URL |
| Meta | — | — | — | — | — | — | нет URL |
| Nvidia | — | — | — | — | — | — | нет URL |
| DeepSeek | — | — | — | — | — | — | нет URL |
| Alibaba Qwen | — | — | — | — | — | — | нет URL |
| Moonshot AI | — | — | — | — | — | — | нет URL |
| Zhipu AI | — | — | — | — | — | — | нет URL |
| ByteDance | — | — | — | — | — | — | нет URL |
| Tencent | — | — | — | — | — | — | нет URL |
| Mistral AI | — | — | — | — | — | — | нет URL |
| Perplexity AI | — | — | — | — | — | — | нет URL |
| Nobel Prize Winners | — | — | — | — | — | — | нет URL |

## 5. VOICES — исходный YAML
### `config/voices.yaml`
```yaml
version: 1
updated: 2026-10-08-v4
min_relevance: 0.2
# Below this relevance, speaker must appear in title (not just summary).
# Prevents "passing mention" false positives (e.g. California Dems letter
# mentions Musk/Zuckerberg in summary only).
title_only_below: 0.5
voices:
- name: Dario Amodei
  affiliation: Anthropic
  category: frontier_labs
  keywords:
  - Dario Amodei
  - Amodei
  - Anthropic CEO
  - Anthropic's CEO
  - Anthropic chief
  - Дарио Амодеи
  sources:
  - Anthropic News
  note: CEO of Anthropic
- name: Claude
  category: frontier_labs
  keywords:
  - Claude
  - Claude Mythos
  - Anthropic's Claude
  sources:
  - Anthropic News
  note: Anthropic's AI assistant
- name: Sam Altman
  affiliation: OpenAI
  category: frontier_labs
  keywords:
  - Sam Altman
  - Altman
  - OpenAI CEO
  - OpenAI's CEO
  - OpenAI chief
  - Сэм Альтман
  sources:
  - OpenAI Blog
  note: CEO of OpenAI
- name: Jensen Huang
  affiliation: Nvidia
  category: frontier_labs
  keywords:
  - Jensen Huang
  - Huang
  - Nvidia CEO
  - NVIDIA CEO
  - Nvidia's CEO
  - Nvidia chief
  - Дженсен Хуанг
  sources:
  - The Verge — AI
  - Ars Technica — AI
  note: CEO of Nvidia
- name: Ilya Sutskever
  affiliation: Safe Superintelligence Inc.
  category: frontier_labs
  keywords:
  - Ilya Sutskever
  - Sutskever
  - ilyasutskever
  - Илья Суцкевер
  sources:
  - The Verge — AI
  - Ars Technica — AI
  - MIT Technology Review — AI
  note: Co-founder of SSI, ex-OpenAI Chief Scientist
- name: Elon Musk
  affiliation: xAI, Tesla, SpaceX
  category: frontier_labs
  keywords:
  - Elon Musk
  - Musk
  - elonmusk
  - xAI CEO
  - Tesla CEO
  - SpaceX CEO
  - Илон Маск
  - Маск
  sources:
  - The Verge — AI
  - Ars Technica — AI
  - The Hill — News
  - CBS News — Technology
  note: CEO of xAI, Tesla, SpaceX
- name: Mark Zuckerberg
  affiliation: Meta
  category: frontier_labs
  keywords:
  - Mark Zuckerberg
  - Zuckerberg
  - Meta CEO
  - Meta's CEO
  - Meta chief
  - Марк Цукерберг
  - Цукерберг
  sources:
  - The Verge — AI
  - Politico — Technology
  note: CEO of Meta
- name: Demis Hassabis
  affiliation: Google DeepMind
  category: frontier_labs
  keywords:
  - Demis Hassabis
  - Hassabis
  - DeepMind CEO
  - Google DeepMind CEO
  - DeepMind's CEO
  - DeepMind chief
  - Демис Хассабис
  sources:
  - Google DeepMind Blog
  - MIT Technology Review — AI
  note: CEO of Google DeepMind, Nobel Prize 2024
- name: Yann LeCun
  affiliation: Meta, Chief AI Scientist
  category: researchers
  keywords:
  - Yann LeCun
  - LeCun
  - ylecun
  - Ян Лекун
  sources:
  - The Verge — AI
  - MIT Technology Review — AI
  note: Chief AI Scientist at Meta
- name: Andrej Karpathy
  affiliation: Eureka Labs, ex-Tesla, ex-OpenAI
  category: researchers
  keywords:
  - Andrej Karpathy
  - Karpathy
  - karpathy
  - Андрей Карпаты
  sources:
  - The Verge — AI
  - Ars Technica — AI
  note: Founder of Eureka Labs, ex-Tesla AI director
- name: Geoffrey Hinton
  affiliation: ex-Google, Nobel Laureate
  category: researchers
  keywords:
  - Geoffrey Hinton
  - Hinton
  - Джеффри Хинтон
  sources:
  - The Verge — AI
  - Ars Technica — AI
  note: Godfather of AI, Nobel Prize 2024
- name: Paul Christiano
  affiliation: Alignment Research Center (ARC)
  category: researchers
  keywords:
  - Paul Christiano
  - Пол Кристиано
  - ARC founder
  note: Founder of ARC, RLHF co-author, OpenAI Foundation board member

- name: Stuart Russell
  affiliation: UC Berkeley
  category: researchers
  keywords:
  - Stuart Russell
  - Стюарт Рассел
  sources:
  - LessWrong — AI
  - AI Alignment Forum
  note: Professor at UC Berkeley
- name: Eliezer Yudkowsky
  affiliation: Machine Intelligence Research Institute
  category: safety_philosophy
  keywords:
  - Eliezer Yudkowsky
  - Yudkowsky
  - ESYudkowsky
  - Элиезер Юдковский
  sources:
  - LessWrong — AI
  - AI Alignment Forum
  note: Co-founder of MIRI, AI safety researcher
- name: Henry Shevlin
  affiliation: Cambridge, Leverhulme CFI
  category: safety_philosophy
  keywords:
  - Henry Shevlin
  - Shevlin
  - dioscuri
  sources:
  - Aeon
  - Psyche
  - Noema Magazine
  note: Philosopher of AI consciousness
- name: Yuk Hui
  affiliation: Philosopher of Technology, Hong Kong
  category: safety_philosophy
  keywords:
  - Yuk Hui
  sources:
  - Noema Magazine
  note: Philosopher of technology
- name: Jiang Xueqin
  affiliation: Peking University
  category: safety_philosophy
  keywords:
  - Jiang Xueqin
  - Xueqin
  - xueqinjiang
  sources:
  - Noema Magazine
  note: Education reformer, philosopher
- name: Marc Andreessen
  affiliation: a16z
  category: investors
  keywords:
  - Marc Andreessen
  - Andreessen
  - pmarca
  - Марк Андреессен
  sources:
  - The Verge — AI
  - Politico — Technology
  note: Co-founder of Andreessen Horowitz
- name: Peter Thiel
  affiliation: Founders Fund
  category: investors
  keywords:
  - Peter Thiel
  - Thiel
  - peterthiel
  - Питер Тиль
  sources:
  - Politico — Technology
  - The Hill — Policy
  note: Co-founder of Founders Fund, PayPal
- name: Paul Graham
  affiliation: Y Combinator
  category: investors
  keywords:
  - Paul Graham
  - Graham
  - paulg
  - Пол Грэм
  sources:
  - The Verge — AI
  - Ars Technica — AI
  note: Co-founder of Y Combinator
- name: Jeff Bezos
  affiliation: Amazon, Blue Origin
  category: investors
  keywords:
  - Jeff Bezos
  - Bezos
  - Джефф Безос
  sources:
  - The Hill — News
  - CBS News — Technology
  - NPR — World
  note: Founder of Amazon, Blue Origin
- name: Bill Gates
  affiliation: Gates Foundation
  category: investors
  keywords:
  - Bill Gates
  - Gates
  - BillGates
  - Bill Gates says
  - Gates Foundation
  - Билл Гейтс
  - Гейтс
  sources:
  - NPR — World
  - CBS News — World
  - Our World in Data
  note: Co-founder of Microsoft, philanthropist
- name: Vitalik Buterin
  affiliation: Ethereum
  category: crypto
  keywords:
  - Vitalik Buterin
  - Buterin
  - Vitalik
  - VitalikButerin
  - Виталик Бутерин
  sources:
  - The Verge — AI
  - Ars Technica — AI
  note: Co-founder of Ethereum
- name: Alex Karp
  affiliation: Palantir
  category: enterprise
  keywords:
  - Alex Karp
  - Karp
  - Palantir CEO
  - Palantir's CEO
  - Palantir chief
  sources:
  - Politico — Technology
  - The Hill — Policy
  - CBS News — Technology
  note: CEO of Palantir
- name: Mira Murati
  affiliation: Thinking Machines Lab, ex-OpenAI CTO
  category: frontier_labs
  keywords:
  - Mira Murati
  - Murati
  - Мира Мурати
  sources: []
  note: CEO of Thinking Machines Lab, ex-OpenAI CTO
- name: Mustafa Suleyman
  affiliation: Microsoft AI
  category: frontier_labs
  keywords:
  - Mustafa Suleyman
  - Suleyman
  sources: []
  note: CEO of Microsoft AI, co-founder of DeepMind
- name: Greg Brockman
  affiliation: OpenAI
  category: frontier_labs
  keywords:
  - Greg Brockman
  - Brockman
  sources: []
  note: President of OpenAI
- name: Jakub Pachocki
  affiliation: OpenAI
  category: frontier_labs
  keywords:
  - Jakub Pachocki
  - Pachocki
  - Якуб Пачоцки
  sources: []
  note: Chief Scientist at OpenAI
- name: Sundar Pichai
  affiliation: Google, Alphabet
  category: frontier_labs
  keywords:
  - Sundar Pichai
  - Pichai
  - Google CEO
  - Google's CEO
  - Google chief
  - Alphabet CEO
  - Сундар Пичаи
  sources: []
  note: CEO of Google and Alphabet
- name: Satya Nadella
  affiliation: Microsoft
  category: frontier_labs
  keywords:
  - Satya Nadella
  - Nadella
  - Microsoft CEO
  - Microsoft's CEO
  - Microsoft chief
  - Сатья Наделла
  sources: []
  note: CEO of Microsoft
- name: Fei-Fei Li
  affiliation: Stanford HAI
  category: researchers
  keywords:
  - Fei-Fei Li
  - Фей-Фей Ли
  sources: []
  note: Co-director Stanford HAI, ImageNet creator
- name: Yoshua Bengio
  affiliation: Mila, Universite de Montreal
  category: researchers
  keywords:
  - Yoshua Bengio
  - Bengio
  sources: []
  note: Turing Award 2018, AI safety researcher
- name: Max Tegmark
  affiliation: MIT, Future of Life Institute
  category: researchers
  keywords:
  - Max Tegmark
  - Tegmark
  - Макс Тегмарк
  sources: []
  note: MIT physicist, FLI co-founder, author of Life 3.0
- name: Nick Bostrom
  affiliation: Oxford
  category: safety_philosophy
  keywords:
  - Nick Bostrom
  - Bostrom
  - Ник Бостром
  sources: []
  note: Author of Superintelligence, FHI founder
- name: Sergey Brin
```

## 6. Прочие конфиги — исходный YAML (кроме sources_human.yaml)
(нет)

## 7. sources_human.yaml — исходный YAML
```yaml
rss:
- name: Benton Institute for Broadband & Society
  url: https://www.benton.org/blog/feed
  lang: en
  tier: 1
- name: Reuters Institute
  url: https://reutersinstitute.politics.ox.ac.uk/rss.xml
  lang: en
  tier: 1

- name: Noema Magazine
  url: https://www.noemamag.com/feed/
  lang: en
  tier: 2
- name: Politico — Politics
  url: https://rss.politico.com/politics-news.xml
  lang: en
  tier: 1
  note: US politics, Congress, democratic institutions
- name: NPR — World
  url: https://feeds.npr.org/1004/rss.xml
  lang: en
  tier: 1
  note: World news, UNGA, international relations
- name: Pew Research Center
  url: https://www.pewresearch.org/feed/
  lang: en
  tier: 1
  note: Исследования общественного мнения, доверие, технологии

- name: EFF (Electronic Frontier Foundation)
  url: https://www.eff.org/rss/updates.xml
  lang: en
  tier: 1
  note: Цифровые права, приватность, свобода выражения

- name: Our World in Data
  url: https://ourworldindata.org/feed
  lang: en
  tier: 1
  note: Глобальные данные о здоровье, неравенстве, благополучии

- name: ТАСС
  url: https://tass.ru/rss/v2.xml
  lang: ru
  tier: 1
  note: Российское информагентство, экономика, политика

- name: FT Chinese (FT中文网)
  url: https://www.ftchinese.com/rss/news
  lang: zh
  tier: 1
  note: Китайская версия Financial Times — экономика, неравенство

- name: Al Jazeera
  url: https://www.aljazeera.com/xml/rss/all.xml
  lang: en
  tier: 1
  note: Global South perspective, конфликты, права

- name: The Hindu — International
  url: https://www.thehindu.com/news/international/feeder/default.rss
  lang: en
  tier: 2
  note: Индийская газета, Global South perspective

- name: Aeon
  url: https://aeon.co/feed.rss
  lang: en
  tier: 1
  note: Философия, культура, смысл жизни, критическое мышление

- name: Psyche
  url: https://psyche.co/feed.rss
  lang: en
  tier: 1
  note: Психология, внутренняя жизнь, смысл

- name: 3 Quarks Daily
  url: https://3quarksdaily.com/feed
  lang: en
  tier: 2
  note: Curated essays on culture, philosophy, science - AI and humanity angle
- name: Axios
  url: https://api.axios.com/feed/
  lang: en
  tier: 1
  note: Insider scoops on AI policy, national security, politics, tech industry

- name: Science
  url: https://feeds.science.org/rss/science.xml
  lang: en
  tier: 1
- name: MIT News (Engineering)
  url: https://news.mit.edu/rss/topic/engineering
  lang: en
  tier: 1
- name: SpaceNews
  url: https://spacenews.com/feed/
  lang: en
  tier: 1
- name: The Atlantic
  url: https://www.theatlantic.com/feed/all/
  lang: en
  tier: 1
- name: Inside Higher Ed
  url: https://www.insidehighered.com/news/feed
  lang: en
  tier: 1
- name: Issues in Science and Technology
  url: https://issues.org/feed/
  lang: en
  tier: 1
- name: STAT News
  url: https://www.statnews.com/feed/
  lang: en
  tier: 1
- name: IEEE Spectrum
  url: https://spectrum.ieee.org/feeds/feed.rss
  lang: en
  tier: 1
- name: Phys.org
  url: https://phys.org/rss-feed/
  lang: en
  tier: 1
- name: Nature
  url: https://www.nature.com/nature.rss
  lang: en
  tier: 1
- name: Quanta Magazine
  url: https://www.quantamagazine.org/feed/
  lang: en
  tier: 1
- name: New Scientist
  url: https://www.newscientist.com/feed/
  lang: en
  tier: 1

- name: Business & Human Rights Resource Centre
  url: https://www.business-humanrights.org/en/feeds/latest-news/3/

- name: Haber 7
  url: https://i12.haber7.net/sondakika/newsstand/latest.xml
  lang: tr
  tier: 2
```

## 8. Хранилище (per-source счётчики)
- (хранилище не найдено: нет *.db/*.sqlite*/jsonl)

## 9. Примеры заголовков (первые 3 из каждого фида)
