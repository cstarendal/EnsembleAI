#!/usr/bin/env node

/**
 * Design Token Validation Script
 * 
 * Checks for hardcoded values that should use design tokens instead.
 * 
 * Usage: npm run lint:design-tokens
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, "../src");

// Patterns to detect hardcoded values
const patterns = {
  // Hardcoded colors
  colors: [
    /#[0-9a-fA-F]{3,6}\b/g, // Hex colors (#fff, #ffffff)
    /rgb\([^)]+\)/g, // rgb() colors
    /rgba\([^)]+\)/g, // rgba() colors
    /hsl\([^)]+\)/g, // hsl() colors (not using var())
    /hsla\([^)]+\)/g, // hsla() colors
    /\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey)\b/g, // Named colors (context-dependent)
  ],

  // Hardcoded spacing (px, rem, em without var())
  spacing: [
    /\b\d+px\b/g, // Pixels
    /\b\d+\.?\d*rem\b/g, // Rem units (check if not using var())
    /\b\d+\.?\d*em\b/g, // Em units
  ],

  // Hardcoded shadows
  shadows: [
    /box-shadow:\s*[^v][^a][^r]/g, // box-shadow without var()
    /drop-shadow:\s*[^v][^a][^r]/g, // drop-shadow without var()
  ],
};

// Files/directories to ignore
const ignorePatterns = [
  /node_modules/,
  /dist/,
  /build/,
  /coverage/,
  /\.test\./,
  /\.spec\./,
  /design-tokens\.css/, // The tokens file itself
  /test/, // Test utilities
];

// Allowed contexts (where hardcoded values might be OK)
const allowedContexts = [
  "var(--", // CSS variable usage
  "hsl(var(", // HSL with var
  "rgba(var(", // RGBA with var
  "//", // Comments
  "/*", // CSS comments
  "design-tokens", // Token definitions
  "test", // Test files
  "mock", // Mock data
];

function shouldIgnoreFile(filePath) {
  return ignorePatterns.some((pattern) => pattern.test(filePath));
}

function isAllowedContext(line, match) {
  const beforeMatch = line.substring(0, match.index);
  return allowedContexts.some((context) => beforeMatch.includes(context));
}

function checkFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const issues = [];

  lines.forEach((line, lineNumber) => {
    // Check each pattern category
    Object.entries(patterns).forEach(([category, patternList]) => {
      patternList.forEach((pattern) => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach((match) => {
          // Skip if in allowed context
          if (isAllowedContext(line, match)) {
            return;
          }

          // Skip if it's a comment explaining why
          if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
            return;
          }

          issues.push({
            file: filePath.replace(srcDir, ""),
            line: lineNumber + 1,
            category,
            match: match[0],
            context: line.trim().substring(0, 80),
          });
        });
      });
    });
  });

  return issues;
}

function scanDirectory(dir) {
  const files = [];
  const entries = readdirSync(dir);

  entries.forEach((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!shouldIgnoreFile(fullPath)) {
        files.push(...scanDirectory(fullPath));
      }
    } else if (stat.isFile()) {
      const ext = extname(fullPath);
      if (
        [".ts", ".tsx", ".js", ".jsx", ".css"].includes(ext) &&
        !shouldIgnoreFile(fullPath)
      ) {
        files.push(fullPath);
      }
    }
  });

  return files;
}

function main() {
  console.log("🔍 Checking for hardcoded design values...\n");

  const files = scanDirectory(srcDir);
  const allIssues = [];

  files.forEach((file) => {
    const issues = checkFile(file);
    allIssues.push(...issues);
  });

  if (allIssues.length === 0) {
    console.log("✅ No hardcoded values found! All design tokens are used correctly.\n");
    process.exit(0);
  }

  // Group issues by category
  const byCategory = {};
  allIssues.forEach((issue) => {
    if (!byCategory[issue.category]) {
      byCategory[issue.category] = [];
    }
    byCategory[issue.category].push(issue);
  });

  // Print issues
  console.log(`❌ Found ${allIssues.length} potential hardcoded value(s):\n`);

  Object.entries(byCategory).forEach(([category, issues]) => {
    console.log(`\n📦 ${category.toUpperCase()} (${issues.length} issue(s)):`);
    console.log("─".repeat(80));

    issues.forEach((issue) => {
      console.log(`\n  ${issue.file}:${issue.line}`);
      console.log(`  Found: "${issue.match}"`);
      console.log(`  Context: ${issue.context}`);
      console.log(`  💡 Suggestion: Use a design token instead`);
    });
  });

  console.log("\n\n📚 See docs/CSS_GUIDE.md for how to use design tokens.");
  console.log("\n❌ Validation failed. Please replace hardcoded values with design tokens.\n");

  process.exit(1);
}

main();

