#!/usr/bin/env node

console.log("=".repeat(60));
console.log("📱 FAVICON SETUP UNTUK PALETTESTREAM");
console.log("=".repeat(60));

console.log(`
🎯 LANGKAH-LANGKAH SETUP FAVICON:

1. 🌐 Buka website favicon generator:
   https://favicon.io/favicon-generator/

2. ⚙️ Gunakan setting berikut:
   - Text: "PS" (atau logo PaletteStream)
   - Background: Rounded
   - Font Family: Leckerli One (atau font modern lainnya)
   - Font Size: 50-60
   - Font Color: White (#FFFFFF)
   - Background Color: Linear Gradient
     • Start: #8B5CF6 (Purple)
     • End: #EC4899 (Pink)

3. 📥 Download favicon package

4. 📋 Extract dan copy file berikut ke folder /public:
   ✅ favicon.ico
   ✅ favicon-16x16.png  
   ✅ favicon-32x32.png
   ✅ apple-touch-icon.png
   ✅ android-chrome-192x192.png
   ✅ android-chrome-512x512.png

5. 🔄 Restart development server:
   npm run dev

ALTERNATIF CEPAT:
💡 Gunakan emoji sebagai favicon sementara dengan mengganti di index.html:
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎨</text></svg>">
`);

console.log("=".repeat(60));
console.log("✨ SELESAI! Favicon PaletteStream siap digunakan");
console.log("=".repeat(60));
