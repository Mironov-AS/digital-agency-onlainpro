#!/bin/bash
# Генерация современных иконок для ОнлайнПро.РФ
# Модель: Gemini 3 Pro

API_KEY="sk_promto_C-E_PaJkExFjx5iv7STM_lAWisniKm5bF36dCEsBQ2o"
API_URL="https://api.promto.ai/v1/images/generations"
OUT_DIR="/home/user/digital-agency/brandbook"

generate_icon() {
  local name=$1
  local prompt=$2
  echo "🎨 Generating: $name"
  
  local response=$(curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"google/gemini-3-pro-image-preview\",\"prompt\":\"$prompt\",\"size\":\"1024x1024\"}" \
    2>/dev/null)
  
  echo "   Response: $response" >&2
  
  local url=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',[{}])[0].get('url',''))" 2>/dev/null)
  
  if [ -n "$url" ]; then
    echo "   📥 Downloading from: $url"
    curl -s "$url" -o "$OUT_DIR/${name}.png" 2>/dev/null
    if [ -f "$OUT_DIR/${name}.png" ]; then
      local size=$(stat -f%z "$OUT_DIR/${name}.png" 2>/dev/null || stat -c%s "$OUT_DIR/${name}.png" 2>/dev/null)
      echo "   ✅ Saved: $OUT_DIR/${name}.png ($size bytes)"
    else
      echo "   ❌ Download failed"
    fi
  else
    echo "   ❌ No URL in response"
    echo "   Full response: $response" >&2
  fi
  echo ""
}

# Очистка старых иконок
rm -f "$OUT_DIR"/icon-*.png 2>/dev/null

# Генерируем иконки с детальными промптами для Gemini 3 Pro
generate_icon "icon-web-dev" "modern app icon for web development service, minimalist design, dark purple background with neon cyan glow effects, abstract laptop with floating code lines, geometric shapes, clean modern style, iOS app icon aesthetic, no text, transparent-friendly, square format"

generate_icon "icon-mvp-launch" "modern app icon for MVP launch service, dark tech style, purple and cyan gradient, rocket launching from geometric shapes, speed lines, futuristic minimal design, neon glow effects, iOS app icon style, no text, square format"

generate_icon "icon-ai-brain" "modern app icon for AI artificial intelligence service, dark background, purple cyan gradient, stylized brain with neural network connections, glowing circuit patterns, futuristic tech aesthetic, neon glow effects, iOS app icon style, no text, square format"

generate_icon "icon-automation" "modern app icon for business automation service, dark tech style, purple neon glow, abstract robot arm or gears with digital elements, automation workflow concept, geometric minimalist design, iOS app icon aesthetic, no text, square format"

generate_icon "icon-crm-analytics" "modern app icon for CRM and ERP analytics service, dark purple background, cyan accents, abstract charts and graphs, data visualization concept, floating dashboard elements, clean modern design, neon glow, iOS app icon style, no text, square format"

generate_icon "icon-queue-system" "modern app icon for digital queue ticket system, dark tech style, purple cyan neon glow, abstract ticket or queue numbers, digital waiting room concept, geometric shapes, clean futuristic minimal design, iOS app icon style, no text, square format"

generate_icon "icon-mobile-app" "modern app icon for mobile app development, dark gradient background purple to cyan, floating smartphone with app interface, geometric abstract elements, neon glow effects, clean minimalist tech style, iOS app icon aesthetic, no text, square format"

generate_icon "icon-consulting" "modern app icon for digital consulting service, dark tech background, purple cyan gradient, abstract lightbulb with digital elements, strategic thinking concept, geometric shapes, neon glow effects, clean futuristic design, iOS app icon style, no text, square format"

echo "🎉 Generation complete!"
ls -la "$OUT_DIR"/icon-*.png 2>/dev/null
