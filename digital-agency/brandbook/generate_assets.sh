#!/bin/bash
API_KEY="sk_promto_C-E_PaJkExFjx5iv7STM_lAWisniKm5bF36dCEsBQ2o"
API_URL="https://api.promto.ai/v1/images/generations"
OUT_DIR="/home/user/digital-agency/brandbook"

generate() {
  local name=$1
  local prompt=$2
  echo "Generating: $name"
  curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"black-forest-labs/flux.2-max\",\"prompt\":\"$prompt\",\"size\":\"1024x1024\"}" \
    > "$OUT_DIR/${name}_response.json"
  
  # Parse URL from response
  local url=$(cat "$OUT_DIR/${name}_response.json" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('data',[{}])[0].get('url',''))" 2>/dev/null)
  if [ -n "$url" ]; then
    echo "  Download URL: $url"
    curl -s "$url" -o "$OUT_DIR/${name}.png" 2>/dev/null && echo "  Saved: $OUT_DIR/${name}.png" || echo "  Download failed"
  else
    echo "  No URL in response"
  fi
}

# Generate brand identity elements
generate "logo_main" "modern tech company logo for OnlinePro.RF digital agency, dark background with purple and cyan neon glow effects, geometric abstract symbol combining 'OP' letters, professional minimal design, transparent background, PNG"
generate "icon_web" "service icon for web development, dark tech style, purple neon glow, geometric minimalist design on dark background"
generate "icon_mvp" "service icon for MVP launch, dark tech style, cyan neon glow, rocket geometric icon on dark background"
generate "icon_ai" "service icon for AI implementation, dark tech style, purple and cyan gradient neon, brain circuit icon on dark background"
generate "icon_automation" "service icon for business automation, dark tech style, purple neon glow, gear with digital elements on dark background"
generate "hero_illustration" "hero section illustration for digital agency website, futuristic cityscape with neon purple and cyan lights, floating holographic interfaces, abstract geometric shapes, dark background, professional tech atmosphere"
generate "about_illustration" "team collaboration illustration for about us page, dark tech style, purple and cyan neon accents, modern workspace with holographic displays, professional atmosphere"
generate "pattern_bg" "seamless tech pattern background, dark background, purple and cyan geometric lines, digital grid, futuristic style, for brandbook use"

echo "Done!"
