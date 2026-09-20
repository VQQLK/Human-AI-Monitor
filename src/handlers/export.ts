export async function handleExport(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const format = url.searchParams.get('format') || 'json';
  const weeksParam = url.searchParams.get('weeks');
  const weeks = weeksParam ? parseInt(weeksParam) : 52;

  // Получить протоколы из D1
  const query = `
    SELECT week_start, week_end, ai_score, human_score, gap_index, 
           items_count, shifts_count, generated_at, content, path
    FROM protocols 
    ORDER BY week_start DESC
    LIMIT ?
  `;
  
  const result = await env.DB.prepare(query).bind(weeks).all();
  const protocols = result.results || [];

  if (protocols.length === 0) {
    return new Response(JSON.stringify({ error: 'No protocols found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Формат JSON (по умолчанию)
  if (format === 'json') {
    return new Response(JSON.stringify({
      exported_at: new Date().toISOString(),
      count: protocols.length,
      protocols: protocols
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="protocols-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  }

  // Формат Markdown (один большой файл)
  if (format === 'md') {
    const header = `# Human-AI Monitor — Protocol Archive

**Exported:** ${new Date().toISOString()}
**Protocols:** ${protocols.length}

---

`;
    const content = protocols.map((p: any) => {
      return `## Week: ${p.week_start} — ${p.week_end}

**Generated:** ${p.generated_at}
**Items:** ${p.items_count} | **Shifts:** ${p.shifts_count}
**AI Score:** ${p.ai_score} | **Human Score:** ${p.human_score} | **Gap:** ${p.gap_index}

${p.content || '_No content available_'}

---

`;
    }).join('\n');

    return new Response(header + content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="protocols-${new Date().toISOString().split('T')[0]}.md"`
      }
    });
  }

  // Неизвестный формат
  return new Response(JSON.stringify({ 
    error: `Unknown format: ${format}`,
    available_formats: ['json', 'md']
  }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' }
  });
}
