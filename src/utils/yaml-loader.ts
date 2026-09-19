import yaml from 'js-yaml';

export interface YamlLoadOptions {
  fallback?: any;
  cacheKey?: string;
  cacheTtl?: number;
}

/**
 * Загружает YAML текст (string) и парсит его.
 * Для Cloudflare Workers используем build-time конвертацию YAML→JSON,
 * чтобы избежать runtime fetch и парсинга.
 */
export function parseYamlText(yamlText: string): any {
  return yaml.load(yamlText);
}

/**
 * Загружает YAML из URL с кэшированием в KV (опционально).
 * Используется только для динамических конфигов, не для основных.
 */
export async function loadYamlFromUrl(
  url: string,
  env: Env,
  options: YamlLoadOptions = {}
): Promise<any> {
  const { fallback = null, cacheKey, cacheTtl = 3600 } = options;

  // Попытка загрузить из кэша (KV)
  if (cacheKey && (env as any).YAML_CACHE) {
    try {
      const cached = await (env as any).YAML_CACHE.get(cacheKey);
      if (cached) {
        console.log(`[yaml-loader] Cache hit: ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn(`[yaml-loader] Cache read failed: ${e}`);
    }
  }

  // Загрузка из URL
  try {
    console.log(`[yaml-loader] Fetching: ${url}`);
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Human-AI-Monitor/1.0' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const yamlText = await response.text();
    const parsed = yaml.load(yamlText);

    // Сохранить в кэш
    if (cacheKey && (env as any).YAML_CACHE) {
      try {
        await (env as any).YAML_CACHE.put(
          cacheKey,
          JSON.stringify(parsed),
          { expirationTtl: cacheTtl }
        );
        console.log(`[yaml-loader] Cached: ${cacheKey} (TTL: ${cacheTtl}s)`);
      } catch (e) {
        console.warn(`[yaml-loader] Cache write failed: ${e}`);
      }
    }

    return parsed;
  } catch (error) {
    console.error(`[yaml-loader] Failed to load ${url}:`, error);

    if (fallback) {
      console.log(`[yaml-loader] Using fallback for ${url}`);
      return fallback;
    }

    throw error;
  }
}

/**
 * Загружает несколько YAML URL параллельно
 */
export async function loadMultipleYaml(
  urls: string[],
  env: Env,
  options: YamlLoadOptions = {}
): Promise<any[]> {
  const results = await Promise.allSettled(
    urls.map((url, i) =>
      loadYamlFromUrl(url, env, {
        ...options,
        cacheKey: options.cacheKey ? `${options.cacheKey}_${i}` : undefined
      })
    )
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(`[yaml-loader] Failed to load ${urls[i]}:`, result.reason);
      return options.fallback || null;
    }
  });
}
