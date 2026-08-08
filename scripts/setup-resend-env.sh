#!/usr/bin/env bash
# Push Resend env vars to local .env.local and Vercel.
# Usage:
#   RESEND_API_KEY=re_xxx ./scripts/setup-resend-env.sh
#   RESEND_API_KEY=re_xxx RESEND_FROM_EMAIL='RateQuip <noreply@ratequip.com>' OPS_EMAIL=ops@ratequip.com ./scripts/setup-resend-env.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

KEY="${RESEND_API_KEY:-}"
FROM="${RESEND_FROM_EMAIL:-RateQuip <noreply@ratequip.com>}"
OPS="${OPS_EMAIL:-ops@ratequip.com}"

if [[ -z "$KEY" ]]; then
  echo "Set RESEND_API_KEY first, e.g.:"
  echo "  RESEND_API_KEY=re_xxx ./scripts/setup-resend-env.sh"
  exit 1
fi

if [[ ! "$KEY" =~ ^re_ ]]; then
  echo "RESEND_API_KEY should start with re_"
  exit 1
fi

ENV_FILE=".env.local"
touch "$ENV_FILE"

upsert_env() {
  local file="$1" name="$2" value="$3"
  if grep -q "^${name}=" "$file" 2>/dev/null; then
    # portable in-place replace
    local tmp
    tmp="$(mktemp)"
    awk -v n="$name" -v v="$value" 'BEGIN{FS=OFS="="} $1==n{$0=n"="v} {print}' "$file" >"$tmp"
    mv "$tmp" "$file"
  else
    printf '%s=%s\n' "$name" "$value" >>"$file"
  fi
}

upsert_env "$ENV_FILE" "RESEND_API_KEY" "$KEY"
upsert_env "$ENV_FILE" "RESEND_FROM_EMAIL" "$FROM"
upsert_env "$ENV_FILE" "OPS_EMAIL" "$OPS"

echo "Updated $ENV_FILE"

if command -v vercel >/dev/null 2>&1; then
  echo "Adding to Vercel (Production, Preview, Development)..."
  # Remove existing quietly, then add fresh values for all targets
  for name in RESEND_API_KEY RESEND_FROM_EMAIL OPS_EMAIL; do
    vercel env rm "$name" production --yes 2>/dev/null || true
    vercel env rm "$name" preview --yes 2>/dev/null || true
    vercel env rm "$name" development --yes 2>/dev/null || true
  done

  printf '%s' "$KEY" | vercel env add RESEND_API_KEY production
  printf '%s' "$KEY" | vercel env add RESEND_API_KEY preview
  printf '%s' "$KEY" | vercel env add RESEND_API_KEY development

  printf '%s' "$FROM" | vercel env add RESEND_FROM_EMAIL production
  printf '%s' "$FROM" | vercel env add RESEND_FROM_EMAIL preview
  printf '%s' "$FROM" | vercel env add RESEND_FROM_EMAIL development

  printf '%s' "$OPS" | vercel env add OPS_EMAIL production
  printf '%s' "$OPS" | vercel env add OPS_EMAIL preview
  printf '%s' "$OPS" | vercel env add OPS_EMAIL development

  echo "Vercel env vars set. Redeploy production for them to take effect:"
  echo "  vercel --prod"
else
  echo "vercel CLI not found — skipped remote env push"
fi

echo
echo "Next: send a test email"
echo "  npm run email:test -- your@email.com"
