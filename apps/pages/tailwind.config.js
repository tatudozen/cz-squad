export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary, #06164A)',
          secondary: 'var(--brand-secondary, #6220FF)',
          accent: 'var(--brand-accent, #ED145B)',
          neutral: 'var(--brand-neutral, #999)',
        },
      },
      fontFamily: {
        heading: 'var(--font-heading, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif)',
        body: 'var(--font-body, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif)',
      },
    },
  },
  plugins: [],
};
