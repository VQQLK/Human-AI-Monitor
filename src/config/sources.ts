import aiSources from './generated/sources_ai';
import humanSources from './generated/sources_human';

export interface Source {
  name: string;
  url: string;
  kind: "ai" | "human";
  type: "rss" | "html";
  htmlSelector?: string;
  lang?: string;
  tier?: number;
  axes?: string[];
}

// Конвертируем YAML структуру в формат, ожидаемый кодом
function convertYamlSources(yamlSources: any, kind: "ai" | "human"): Source[] {
  const sources: Source[] = [];
  
  // RSS источники
  if (yamlSources.rss && Array.isArray(yamlSources.rss)) {
    for (const src of yamlSources.rss) {
      // Пропустить отключённые источники
      if (src.enabled === false) continue;
      
      sources.push({
        name: src.name,
        url: src.url,
        kind,
        type: "rss",
        lang: src.lang,
        tier: src.tier,
        axes: src.axes
      });
    }
  }
  
  // HTML источники
  if (yamlSources.html_sources && Array.isArray(yamlSources.html_sources)) {
    for (const src of yamlSources.html_sources) {
      // Пропустить отключённые источники
      if (src.enabled === false) continue;
      
      sources.push({
        name: src.name,
        url: src.url,
        kind,
        type: "html",
        htmlSelector: src.selector,
        lang: src.lang,
        tier: src.tier,
        axes: src.axes
      });
    }
  }
  
  return sources;
}

export const SOURCES: Source[] = [
  ...convertYamlSources(aiSources, "ai"),
  ...convertYamlSources(humanSources, "human")
];

// Экспорт для отладки
export const AI_SOURCES = convertYamlSources(aiSources, "ai");
export const HUMAN_SOURCES = convertYamlSources(humanSources, "human");
