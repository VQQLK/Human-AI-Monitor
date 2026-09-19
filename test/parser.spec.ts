import { describe, it, expect } from "vitest";
import { parseRSS, cleanTitle, decodeEntities, extractTag } from "../src/index";

describe("decodeEntities", () => {
	it("decodes basic HTML entities", () => {
		expect(decodeEntities("A &amp; B")).toBe("A & B");
		expect(decodeEntities("it&#39;s")).toBe("it's");
		expect(decodeEntities("x &quot;y&quot;")).toBe('x "y"');
	});

	it("unwraps CDATA sections", () => {
		expect(decodeEntities("<![CDATA[Hello World]]>")).toBe("Hello World");
		expect(decodeEntities("<![CDATA[it's a test]]>")).toBe("it's a test");
	});

	it("strips HTML tags", () => {
		expect(decodeEntities("<p>Hello</p>")).toBe("Hello");
		expect(decodeEntities("<a href='#'>Link</a>")).toBe("Link");
	});

	it("collapses whitespace", () => {
		expect(decodeEntities("Hello    World")).toBe("Hello World");
		expect(decodeEntities("  trimmed  ")).toBe("trimmed");
	});
});

describe("cleanTitle", () => {
	it("strips date-first prefixes", () => {
		expect(cleanTitle("Sep 17, 2026ScienceHow Claude is uplifting"))
			.toBe("How Claude is uplifting");
		expect(cleanTitle("Sep 10, 2026Frontier Red TeamMeasuring tactical"))
			.toBe("Measuring tactical");
	});

	it("strips category-first prefixes", () => {
		expect(cleanTitle("AlignmentSep 9, 2026An alignment assessment"))
			.toBe("An alignment assessment");
	});

	it("keeps clean titles unchanged", () => {
		expect(cleanTitle("Introducing Astra for Law")).toBe("Introducing Astra for Law");
		expect(cleanTitle("Tiny Aya Vision")).toBe("Tiny Aya Vision");
	});
});

describe("extractTag", () => {
	it("extracts simple XML tags", () => {
		expect(extractTag("<title>Hello</title>", "title")).toBe("Hello");
		expect(extractTag("<link>https://x.com</link>", "link")).toBe("https://x.com");
	});

	it("handles CDATA inside tags", () => {
		expect(extractTag("<title><![CDATA[OpenAI News]]></title>", "title"))
			.toBe("OpenAI News");
	});

	it("returns empty string for missing tags", () => {
		expect(extractTag("<title>Hi</title>", "author")).toBe("");
	});
});

describe("parseRSS", () => {
	const rssXml = `<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <item>
      <title>Test Article</title>
      <link>https://example.com/article</link>
      <description>Test description</description>
    </item>
    <item>
      <title><![CDATA[Second Article]]></title>
      <link>https://example.com/second</link>
      <description><![CDATA[Desc]]></description>
    </item>
  </channel>
</rss>`;

	it("parses RSS 2.0 feed", () => {
		const items = parseRSS(rssXml, 10);
		expect(items).toHaveLength(2);
		expect(items[0].title).toBe("Test Article");
		expect(items[0].url).toBe("https://example.com/article");
		expect(items[1].title).toBe("Second Article");
	});

	it("respects maxItems limit", () => {
		const items = parseRSS(rssXml, 1);
		expect(items).toHaveLength(1);
	});

	it("handles empty feed", () => {
		const items = parseRSS("<rss><channel></channel></rss>", 10);
		expect(items).toHaveLength(0);
	});

	it("parses Atom feed as fallback", () => {
		const atomXml = `<?xml version="1.0"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <entry>
    <title>Atom Entry</title>
    <link href="https://example.com/entry"/>
    <summary>Summary</summary>
  </entry>
</feed>`;
		const items = parseRSS(atomXml, 10);
		expect(items).toHaveLength(1);
		expect(items[0].title).toBe("Atom Entry");
		expect(items[0].url).toBe("https://example.com/entry");
	});
});
