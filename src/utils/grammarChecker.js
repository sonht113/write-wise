/**
 * Rule-based grammar checker for IELTS Writing Task 1.
 * Based on Section 15-16 of the IELTS Writing Task 1 Master Rulebook.
 *
 * Returns an array of error objects with position, suggestion, and rule reference.
 */

const RULES = [
  // --- Subject-Verb Agreement ---
  {
    pattern:
      /\b(the number|the amount|the percentage|the proportion) of \w+\s+(are|were|have)\b/gi,
    suggestion: (m) =>
      m[0].replace(
        m[2],
        m[2] === "are" ? "is" : m[2] === "were" ? "was" : "has",
      ),
    rule: "Section 16.1 — Subject-verb agreement (singular subject)",
    severity: "error",
    category: "agreement",
  },
  {
    pattern:
      /\b(the figures|the data|the numbers|the results|the statistics) (shows|indicates|demonstrates|reveals)\b/gi,
    suggestion: (m) => m[0].replace(m[2], m[2].replace(/s$/, "")),
    rule: "Section 16.1 — Subject-verb agreement (plural subject)",
    severity: "error",
    category: "agreement",
  },

  // --- Wrong Prepositions ---
  {
    pattern: /\bbetween\s+(\d{4})\s+to\s+(\d{4})\b/gi,
    suggestion: (m) => `between ${m[1]} and ${m[2]}`,
    rule: 'Section 16.6 — Use "between X and Y" not "between X to Y"',
    severity: "error",
    category: "preposition",
  },
  {
    pattern: /\bfrom\s+(\d{4})\s+and\s+(\d{4})\b/gi,
    suggestion: (m) => `from ${m[1]} to ${m[2]}`,
    rule: 'Section 16.6 — Use "from X to Y" not "from X and Y"',
    severity: "error",
    category: "preposition",
  },
  {
    pattern: /\bon\s+(\d{4})\b/gi,
    suggestion: (m) => `in ${m[1]}`,
    rule: 'Section 16.6 — Use "in" with years, not "on"',
    severity: "error",
    category: "preposition",
  },
  {
    pattern: /\bin the other hand\b/gi,
    suggestion: () => "on the other hand",
    rule: 'Section 16.6 — Fixed expression: "on the other hand"',
    severity: "error",
    category: "preposition",
  },
  {
    pattern: /\bdifferent with\b/gi,
    suggestion: () => "different from",
    rule: 'Section 16.6 — Use "different from" not "different with"',
    severity: "error",
    category: "preposition",
  },
  {
    pattern: /\bdepend of\b/gi,
    suggestion: () => "depend on",
    rule: 'Section 16.6 — Use "depend on" not "depend of"',
    severity: "error",
    category: "preposition",
  },

  // --- Article Errors ---
  {
    pattern:
      /\ba (overview|increase|upward|obvious|overall|enormous|average)\b/gi,
    suggestion: (m) => `an ${m[1]}`,
    rule: 'Section 16.7 — Use "an" before vowel sounds',
    severity: "error",
    category: "article",
  },
  {
    pattern: /\ban (university|user|European|one-|uniform|united)\b/gi,
    suggestion: (m) => `a ${m[1]}`,
    rule: 'Section 16.7 — Use "a" before consonant sounds (u=/juː/)',
    severity: "error",
    category: "article",
  },

  // --- Countable/Uncountable ---
  {
    pattern:
      /\bmany (information|advice|equipment|furniture|research|evidence|knowledge|traffic)\b/gi,
    suggestion: (m) => `much ${m[1]}`,
    rule: 'Section 16.2 — Use "much" with uncountable nouns',
    severity: "error",
    category: "noun",
  },
  {
    pattern:
      /\bless (people|students|countries|cities|workers|users|inhabitants)\b/gi,
    suggestion: (m) => `fewer ${m[1]}`,
    rule: 'Section 16.2 — Use "fewer" with countable nouns',
    severity: "error",
    category: "noun",
  },
  {
    pattern:
      /\ba large amount of (people|students|countries|workers|users)\b/gi,
    suggestion: (m) => `a large number of ${m[1]}`,
    rule: 'Section 16.2 — Use "number of" with countable nouns',
    severity: "error",
    category: "noun",
  },
  {
    pattern:
      /\bthe number of (\w+[^s\s])\b(?!\s+(is|was|has|rose|fell|increased|decreased|stood|remained|dropped))/gi,
    suggestion: (m) => {
      const word = m[1].toLowerCase();
      // Skip uncountable nouns common in IELTS Task 1
      const uncountable = [
        "internet",
        "energy",
        "electricity",
        "water",
        "traffic",
        "transport",
        "research",
        "information",
        "data",
        "evidence",
        "knowledge",
        "advice",
        "equipment",
        "consumption",
        "production",
        "growth",
        "decline",
        "unemployment",
        "population",
        "immigration",
        "tourism",
        "education",
        "pollution",
        "infrastructure",
        "technology",
        "agriculture",
        "industry",
        "furniture",
        "money",
        "music",
        "news",
        "progress",
        "software",
        "hardware",
        "feedback",
        "luggage",
        "machinery",
        "waste",
        "fuel",
      ];
      if (uncountable.includes(word)) return null;
      // Skip if already ends in s or is a known plural-form word
      if (
        word.endsWith("s") ||
        word.endsWith("ies") ||
        word === "people" ||
        word === "children" ||
        word === "men" ||
        word === "women"
      )
        return null;
      return `the number of ${m[1]}s`;
    },
    rule: 'Section 16.2 — "The number of" requires plural countable noun',
    severity: "warning",
    category: "noun",
  },

  // --- Adjective/Adverb Confusion ---
  {
    pattern:
      /\b(increased|decreased|rose|fell|dropped|declined|grew|surged|plummeted|fluctuated)\s+(significant|dramatic|sharp|steady|gradual|considerable|substantial|rapid|slight|moderate)\b/gi,
    suggestion: (m) => {
      const adverbMap = {
        significant: "significantly",
        dramatic: "dramatically",
        sharp: "sharply",
        steady: "steadily",
        gradual: "gradually",
        considerable: "considerably",
        substantial: "substantially",
        rapid: "rapidly",
        slight: "slightly",
        moderate: "moderately",
      };
      return `${m[1]} ${adverbMap[m[2].toLowerCase()] || m[2] + "ly"}`;
    },
    rule: "Section 16.5 — Use adverb (not adjective) to modify a verb",
    severity: "error",
    category: "adverb",
  },
  {
    pattern:
      /\ba\s+(significantly|dramatically|sharply|steadily|gradually|considerably|substantially|rapidly|slightly|moderately)\s+(rise|increase|decrease|decline|drop|fall|growth|reduction)\b/gi,
    suggestion: (m) => {
      const adjMap = {
        significantly: "significant",
        dramatically: "dramatic",
        sharply: "sharp",
        steadily: "steady",
        gradually: "gradual",
        considerably: "considerable",
        substantially: "substantial",
        rapidly: "rapid",
        slightly: "slight",
        moderately: "moderate",
      };
      return `a ${adjMap[m[1].toLowerCase()] || m[1].replace(/ly$/, "")} ${m[2]}`;
    },
    rule: "Section 16.4 — Use adjective (not adverb) before a noun",
    severity: "error",
    category: "adjective",
  },

  // --- Double Comparative ---
  {
    pattern:
      /\bmore (higher|lower|bigger|smaller|greater|faster|slower|larger|fewer)\b/gi,
    suggestion: (m) => m[1],
    rule: 'Section 16.4 — Do not use double comparative (remove "more")',
    severity: "error",
    category: "comparative",
  },
  {
    pattern:
      /\bmost (highest|lowest|biggest|smallest|greatest|fastest|slowest|largest)\b/gi,
    suggestion: (m) => m[1],
    rule: 'Section 16.4 — Do not use double superlative (remove "most")',
    severity: "error",
    category: "comparative",
  },

  // --- Verb Form Errors ---
  {
    pattern: /\brised\b/gi,
    suggestion: () => "rose",
    rule: "Section 16.3 — Irregular verb: rise → rose → risen",
    severity: "error",
    category: "verb",
  },
  {
    pattern: /\bstanded\b/gi,
    suggestion: () => "stood",
    rule: "Section 16.3 — Irregular verb: stand → stood → stood",
    severity: "error",
    category: "verb",
  },
  {
    pattern: /\bfalled\b/gi,
    suggestion: () => "fell",
    rule: "Section 16.3 — Irregular verb: fall → fell → fallen",
    severity: "error",
    category: "verb",
  },
  {
    pattern: /\bwas (rose|fell|grew|stood|declined)\b/gi,
    suggestion: (m) => m[1],
    rule: "Section 16.3 — Intransitive verbs do not use passive voice",
    severity: "error",
    category: "verb",
  },
  {
    pattern:
      /\b(before|after|by|without)\s+(increase|decrease|reach|compare|rise|fall|drop|grow)\b/gi,
    suggestion: (m) => `${m[1]} ${m[2]}ing`,
    rule: "Section 16.3 — Use V-ing after prepositions",
    severity: "error",
    category: "verb",
  },

  // --- Common IELTS Informal Vocabulary (warnings) ---
  {
    pattern: /\bwent up\b/gi,
    suggestion: () => "rose",
    rule: 'Section 5.1 — Use academic vocabulary: "rose" instead of "went up"',
    severity: "warning",
    category: "vocabulary",
  },
  {
    pattern: /\bwent down\b/gi,
    suggestion: () => "declined",
    rule: 'Section 5.2 — Use academic vocabulary: "declined" instead of "went down"',
    severity: "warning",
    category: "vocabulary",
  },
  {
    pattern: /\ba lot\b/gi,
    suggestion: () => "significantly",
    rule: 'Section 6 — "A lot" is too informal for IELTS Writing',
    severity: "warning",
    category: "vocabulary",
  },
  {
    pattern: /\bIn conclusion\b/g,
    suggestion: () => "Overall",
    rule: 'Section 3.1 — Task 1 uses "Overall" not "In conclusion"',
    severity: "warning",
    category: "structure",
  },
];

let idCounter = 0;

/**
 * Run all grammar rules against the given text.
 * @param {string} text - The student's answer text
 * @returns {Array} Array of error objects
 */
export default function checkGrammar(text) {
  if (!text || text.trim().length === 0) return [];

  const errors = [];
  idCounter = 0;

  for (const rule of RULES) {
    // Reset regex lastIndex for global patterns
    rule.pattern.lastIndex = 0;

    let match;
    while ((match = rule.pattern.exec(text)) !== null) {
      const suggestion = rule.suggestion(match);
      // If suggestion returns null, skip this match (false positive filter)
      if (suggestion === null) continue;
      // Skip if suggestion is same as original
      if (suggestion === match[0]) continue;

      errors.push({
        id: `err-${++idCounter}`,
        start: match.index,
        end: match.index + match[0].length,
        original: match[0],
        suggestion,
        rule: rule.rule,
        severity: rule.severity,
        category: rule.category,
      });
    }
  }

  // Sort by position (start)
  errors.sort((a, b) => a.start - b.start);
  return errors;
}
