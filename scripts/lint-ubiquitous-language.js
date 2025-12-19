#!/usr/bin/env node

/**
 * Ubiquitous Language Validation Script
 * 
 * Checks that code uses registered domain terms consistently.
 * 
 * Usage: npm run lint:ubiquitous-language
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Forbidden terms (generic terms that should be replaced)
const FORBIDDEN_TERMS = {
  // Generic terms that should use domain terms
  query: ["research", "question"],
  "processQuery": ["startResearch"],
  "runQuery": ["startResearch"],
  model: ["agent"],
  "AI model": ["agent"],
  chat: ["debate"],
  "chat message": ["agent message", "message"],
  discussion: ["debate"],
  conversation: ["debate"],
  summary: ["synthesis"],
  "create summary": ["synthesize"],
  reference: ["source"],
  citation: ["source"], // Only use "citation" for in-text references
  link: ["source"],
  response: ["message", "answer"],
  output: ["message", "answer"],
  phase: ["round"],
  step: ["round"],
  stage: ["round"],
  job: ["session"],
  task: ["session"],
  request: ["session"],
  input: ["question"],
  prompt: ["question"],
  analysis: ["research"],
  investigation: ["research"],
};

// Required terms (must be used instead of alternatives)
const REQUIRED_TERMS = {
  research: ["query", "analysis", "investigation"],
  question: ["input", "prompt", "query"],
  session: ["job", "task", "request"],
  agent: ["model", "AI", "bot"],
  debate: ["chat", "discussion", "conversation"],
  round: ["phase", "step", "stage"],
  source: ["reference", "link"],
  synthesis: ["summary"],
  message: ["response", "output"],
};

// Files/directories to ignore
const ignorePatterns = [
  /node_modules/,
  /dist/,
  /build/,
  /coverage/,
  /\.test\./,
  /\.spec\./,
  /ubiquitousLanguage\.ts/, // The registry file itself
  /test/, // Test utilities
  /scripts/, // Scripts
];

function shouldIgnoreFile(filePath) {
  return ignorePatterns.some((pattern) => pattern.test(filePath));
}

function checkForbiddenTerms(content, filePath) {
  const issues = [];
  const lines = content.split("\n");

  lines.forEach((line, lineNumber) => {
    // Skip comments and strings (basic check)
    if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
      return;
    }

    Object.entries(FORBIDDEN_TERMS).forEach(([forbidden, alternatives]) => {
      // Case-insensitive regex
      const regex = new RegExp(`\\b${forbidden}\\b`, "gi");
      const matches = [...line.matchAll(regex)];

      matches.forEach((match) => {
        // Skip if it's part of a domain term (e.g., "researchSession" contains "search")
        const context = line.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20);
        if (context.match(/[a-zA-Z]/)) {
          // Might be part of a compound word, check more carefully
          const before = line.substring(Math.max(0, match.index - 1), match.index);
          const after = line.substring(match.index + match[0].length, match.index + match[0].length + 1);
          if (/[a-zA-Z]/.test(before) || /[a-zA-Z]/.test(after)) {
            return; // Part of compound word, skip
          }
        }

        issues.push({
          file: filePath,
          line: lineNumber + 1,
          type: "forbidden",
          term: match[0],
          alternatives: alternatives,
          context: line.trim().substring(0, 80),
        });
      });
    });
  });

  return issues;
}

function scanDirectory(dir, baseDir = dir) {
  const files = [];
  const entries = readdirSync(dir);

  entries.forEach((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!shouldIgnoreFile(fullPath)) {
        files.push(...scanDirectory(fullPath, baseDir));
      }
    } else if (stat.isFile()) {
      const ext = extname(fullPath);
      if (
        [".ts", ".tsx", ".js", ".jsx"].includes(ext) &&
        !shouldIgnoreFile(fullPath)
      ) {
        files.push(fullPath);
      }
    }
  });

  return files;
}

function main() {
  console.log("🔍 Checking for ubiquitous language violations...\n");

  const frontendSrc = join(__dirname, "../frontend/src");
  const backendSrc = join(__dirname, "../backend/src");
  
  const allFiles = [
    ...scanDirectory(frontendSrc),
    ...scanDirectory(backendSrc),
  ];

  const allIssues = [];

  allFiles.forEach((file) => {
    try {
      const content = readFileSync(file, "utf-8");
      const issues = checkForbiddenTerms(content, file.replace(process.cwd(), ""));
      allIssues.push(...issues);
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  });

  if (allIssues.length === 0) {
    console.log("✅ No ubiquitous language violations found!\n");
    console.log("All code uses registered domain terms correctly.\n");
    process.exit(0);
  }

  // Group issues by type
  const byType = {};
  allIssues.forEach((issue) => {
    if (!byType[issue.type]) {
      byType[issue.type] = [];
    }
    byType[issue.type].push(issue);
  });

  // Print issues
  console.log(`❌ Found ${allIssues.length} ubiquitous language violation(s):\n`);

  Object.entries(byType).forEach(([type, issues]) => {
    console.log(`\n📦 ${type.toUpperCase()} (${issues.length} violation(s)):`);
    console.log("─".repeat(80));

    issues.forEach((issue) => {
      console.log(`\n  ${issue.file}:${issue.line}`);
      console.log(`  Found: "${issue.term}"`);
      if (issue.alternatives) {
        console.log(`  💡 Use instead: ${issue.alternatives.join(", ")}`);
      }
      console.log(`  Context: ${issue.context}`);
    });
  });

  console.log("\n\n📚 See docs/UBIQUITOUS_LANGUAGE.md for domain terms.");
  console.log("\n❌ Validation failed. Please use registered domain terms.\n");

  process.exit(1);
}

main();

