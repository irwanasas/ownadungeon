/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't auto-generate AGENTS.md/CLAUDE.md — out of scope for this migration.
  agentRules: false
};

module.exports = nextConfig;
