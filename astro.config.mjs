import { defineConfig } from 'astro/config';

// Static output for Netlify. Site URL is used for sitemap/canonical and is the
// production domain for this project.
export default defineConfig({
  site: 'https://potts10k.com',
  output: 'static',
  build: {
    // Keep asset filenames stable-ish and inline nothing huge.
    assets: 'assets',
  },
});
