import type { APIRoute } from "astro";
import { getEmDashCollection, getEntryTerms, getSiteSettings } from "emdash";

export const GET: APIRoute = async ({ url }) => {
	const settings = await getSiteSettings();
	const siteTitle = settings?.title || "Signal & Noise";
	const tagline = settings?.tagline || "Conversations at the intersection of tech, design and culture";
	const siteUrl = url.origin;

	const { entries: episodes } = await getEmDashCollection("episodes", {
		status: "published",
		orderBy: { published_at: "desc" },
		limit: 50,
	});

	const published = episodes.filter((e) => e.data.publishedAt);

	// Build items (with season taxonomy lookup per episode)
	const items = await Promise.all(
		published.map(async (ep) => {
			const episodeUrl = `${siteUrl}/episodes/${ep.id}`;
			const d = ep.data;
			const seasonTerms = await getEntryTerms("episodes", d.id, "season");
			const seasonLabel = seasonTerms[0]?.slug ?? "";
			const seasonNum = /season-(\d+)/.exec(seasonLabel)?.[1] ?? "";
			const cover = d.cover_image?.src ? `${siteUrl.replace(/\/$/, "")}${d.cover_image.src.startsWith("http") ? "" : d.cover_image.src}` : "";
			const coverFinal = d.cover_image?.src?.startsWith("http") ? d.cover_image.src : cover;
			const durationSec = d.duration_seconds ?? durationToSeconds(d.duration);
			const audioUrl = d.audio_url || "";

			return `    <item>
      <title>${escapeXml(d.title)}</title>
      <link>${episodeUrl}</link>
      <guid isPermaLink="true">${episodeUrl}</guid>
      <pubDate>${new Date(d.publishedAt!).toUTCString()}</pubDate>
      <description>${escapeXml(d.description || "")}</description>
      <content:encoded><![CDATA[${d.description || ""}]]></content:encoded>
      ${audioUrl ? `<enclosure url="${escapeXml(audioUrl)}" type="audio/mpeg" length="0" />` : ""}
      ${d.episode_number ? `<itunes:episode>${d.episode_number}</itunes:episode>` : ""}
      ${seasonNum ? `<itunes:season>${seasonNum}</itunes:season>` : ""}
      <itunes:episodeType>full</itunes:episodeType>
      ${durationSec ? `<itunes:duration>${durationSec}</itunes:duration>` : ""}
      ${coverFinal ? `<itunes:image href="${escapeXml(coverFinal)}" />` : ""}
      <itunes:explicit>false</itunes:explicit>
    </item>`;
		}),
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(tagline)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <itunes:author>${escapeXml(siteTitle)}</itunes:author>
    <itunes:summary>${escapeXml(tagline)}</itunes:summary>
    <itunes:owner>
      <itunes:name>${escapeXml(siteTitle)}</itunes:name>
      <itunes:email>hello@signalnoise.fm</itunes:email>
    </itunes:owner>
    <itunes:category text="Technology" />
    <itunes:category text="Society &amp; Culture" />
    <itunes:explicit>false</itunes:explicit>
    <itunes:type>episodic</itunes:type>
${items.join("\n")}
  </channel>
</rss>`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	});
};

function escapeXml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function durationToSeconds(d?: string | null): number | null {
	if (!d) return null;
	const parts = d.split(":").map((p) => parseInt(p, 10));
	if (parts.some(isNaN)) return null;
	if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
	if (parts.length === 2) return parts[0] * 60 + parts[1];
	return parts[0];
}
