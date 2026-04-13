/**
 * Strips common markdown syntax from AI-generated text so it renders
 * as clean plain text in textareas and playbook display fields.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([\s\S]*?)\*\*/g, '$1')   // **bold**
    .replace(/\*([\s\S]*?)\*/g, '$1')        // *italic*
    .replace(/__([\s\S]*?)__/g, '$1')        // __bold__
    .replace(/_([\s\S]*?)_/g, '$1')          // _italic_
    .replace(/`([\s\S]*?)`/g, '$1')          // `code`
    .replace(/^#+\s+/gm, '')                 // ## headings
    .trim()
}
