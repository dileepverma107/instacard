const BOT_PATTERNS =
  /bot|spider|crawl|facebookexternalhit|whatsapp|telegrambot|slackbot|discordbot|linkedinbot|twitterbot|pinterest|googlebot|bingbot|duckduckbot|ahrefsbot|semrushbot|yandexbot|ia_archiver|petalbot|mj12bot|applebot|preview|headless/i;

export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return true;
  return BOT_PATTERNS.test(userAgent);
}
