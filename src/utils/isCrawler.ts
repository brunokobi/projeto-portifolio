const CRAWLER_UA =
  /bot|crawl|spider|slurp|bingpreview|mediapartners|facebookexternalhit|linkedinapp|whatsapp|telegram|discord|embedly|lighthouse|headlesschrome/i;

export function isCrawler(userAgent: string = typeof navigator !== "undefined" ? navigator.userAgent : ""): boolean {
  return CRAWLER_UA.test(userAgent);
}
