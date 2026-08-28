// GitHub Pages only serves static files (no Node server), so this app is
// built as a static export. It's a fully client-side, localStorage-backed
// game with no server data needs, so `output: 'export'` costs nothing.
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

let basePath = '';
let assetPrefix = '';
if (isGithubActions && process.env.GITHUB_REPOSITORY) {
  // Project pages are served under /<repo-name>/, not the domain root.
  const repo = process.env.GITHUB_REPOSITORY.replace(/.*\//, '');
  basePath = `/${repo}`;
  assetPrefix = `/${repo}/`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't auto-generate AGENTS.md/CLAUDE.md — out of scope for this project.
  agentRules: false,
  output: 'export',
  // GitHub Pages resolves /foo to a literal "foo" file, not "foo/index.html",
  // unless URLs end in a trailing slash.
  trailingSlash: true,
  basePath,
  assetPrefix
};

module.exports = nextConfig;
