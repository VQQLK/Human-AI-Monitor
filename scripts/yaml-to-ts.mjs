#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const configDir = join(projectRoot, 'config');
const generatedDir = join(projectRoot, 'src', 'config', 'generated');

// Создать директорию если нет
if (!existsSync(generatedDir)) {
  mkdirSync(generatedDir, { recursive: true });
  console.log(`✓ Создана директория: ${generatedDir}`);
}

const yamlFiles = [
  { yaml: 'axes_ai.yaml', ts: 'axes_ai.ts' },
  { yaml: 'axes_human.yaml', ts: 'axes_human.ts' },
  { yaml: 'sources_ai.yaml', ts: 'sources_ai.ts' },
  { yaml: 'sources_human.yaml', ts: 'sources_human.ts' }
];

console.log('\n🔄 Конвертация YAML → TypeScript...\n');

for (const { yaml: yamlFile, ts: tsFile } of yamlFiles) {
  const yamlPath = join(configDir, yamlFile);
  const tsPath = join(generatedDir, tsFile);

  try {
    const yamlContent = readFileSync(yamlPath, 'utf8');
    const parsed = yaml.load(yamlContent);
    
    const tsContent = `// Auto-generated from ${yamlFile}
// DO NOT EDIT MANUALLY — run: node scripts/yaml-to-ts.mjs

export default ${JSON.stringify(parsed, null, 2)} as const;
`;
    
    writeFileSync(tsPath, tsContent);
    console.log(`✓ ${yamlFile} → ${tsFile} (${tsContent.length} байт)`);
  } catch (error) {
    console.error(`✗ Ошибка конвертации ${yamlFile}:`, error.message);
    process.exit(1);
  }
}

console.log('\n✅ Все YAML файлы конвертированы в TypeScript\n');
