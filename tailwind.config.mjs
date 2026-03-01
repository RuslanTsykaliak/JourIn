/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',  // iPhone 11 and similar
        'sm': '640px',  // Small tablets and large phones
        'md': '768px',  // Tablets
        'lg': '1024px', // Small laptops and desktops
        'xl': '1280px', // Large laptops and small desktops
        '2xl': '1536px', // Large desktops
        '3xl': '1920px', // 4K monitors
        '4xl': '2560px', // Ultra-wide monitors
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
