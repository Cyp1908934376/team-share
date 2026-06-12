/**
 * Generate a URL-friendly slug from a given string.
 * Handles Chinese characters by converting them to pinyin-like slugs
 * or falling back to a random string.
 *
 * Examples:
 *   "Hello World" -> "hello-world"
 *   "API 提示词模板" -> falls back to random slug with timestamp
 */
export function generateSlug(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    // Replace non-ASCII characters with a dash
    .replace(/[^\x00-\x7F]+/g, '-')
    // Replace non-alphanumeric characters with dashes
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
    // Collapse multiple dashes
    .replace(/-+/g, '-')

  // If the slug is empty (e.g., pure Chinese name), generate a random one
  if (!slug || slug.length < 2) {
    return `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  }

  return slug
}

/**
 * Ensure a slug is unique by appending a counter if needed.
 * Used when creating resources with potentially duplicate names.
 */
export function uniqueSlug(baseSlug: string, existingSlugs: Set<string>): string {
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
