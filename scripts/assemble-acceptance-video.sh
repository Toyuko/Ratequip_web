#!/usr/bin/env bash
# Assemble narrated Phase 2 acceptance video (1920x1080, 60fps target)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VID="$ROOT/docs/acceptance-phase2/videos"
WORK="$ROOT/docs/acceptance-phase2/raw/video-build"
COMMIT=$(git -C "$ROOT" rev-parse --short HEAD)
RELEASE="phase2-mvp-m1-$(date +%Y-%m-%d)"
DEPLOY="https://ratequip-web.vercel.app"
mkdir -p "$WORK/segments" "$WORK/audio" "$WORK/cards"

VOICE="Daniel"
# Fall back if Daniel missing
if ! say -v '?' 2>&1 | grep -q "^Daniel "; then VOICE="Albert"; fi

say_clip() {
  local id="$1" text="$2"
  # aiff then wav via afconvert for ffmpeg
  say -v "$VOICE" -o "$WORK/audio/${id}.aiff" "$text"
  afconvert -f WAVE -d LEI16 "$WORK/audio/${id}.aiff" "$WORK/audio/${id}.wav"
}

make_card() {
  local id="$1" title="$2" subtitle="$3" dur="$4"
  # Generate silent video card with drawtext via lavfi
  ffmpeg -y -f lavfi -i "color=c=0x0f3d2e:s=1920x1080:r=60:d=${dur}" \
    -vf "drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial Bold.ttf:text='${title}':fontcolor=white:fontsize=48:x=(w-text_w)/2:y=h*0.38,drawtext=fontfile=/System/Library/Fonts/Supplemental/Arial.ttf:text='${subtitle}':fontcolor=0xd4e8df:fontsize=28:x=(w-text_w)/2:y=h*0.52" \
    -c:v libx264 -pix_fmt yuv420p -r 60 "$WORK/cards/${id}.mp4" 2>/dev/null
}

echo "Generating narration..."
say_clip intro "This is the RateQuip Phase 2 M V P Core acceptance demonstration for Robin Lionstone. We will present repository identity, remediation evidence, and live workflow proof. Acceptance should be based on independent verification of the attached evidence package."
say_clip repo "Repository RateQuip web. Commit ${COMMIT}. Release identifier ${RELEASE}. Live deployment ${DEPLOY}. Production health reports demo mode false and database true."
say_clip auth "Authentication uses Clerk hosted sign up and sign in. Email verification, password reset, and M F A are platform provided. The application enforces session gating for private routes and server side mutation actors."
say_clip db "Database evidence: Neon Postgres with forty two migrations applied, two hundred seventy six tables in schema R Q, seed data present, and a temporary change safely rolled back. Full Neon point in time restore was not re-executed in this package."
say_clip company "Company management: Add Company draft recovery closes the submission not found defect. Claim company and admin approval are demonstrated. Continue, back, and resume paths recover after store misses."
say_clip reviews "Reviews: submit with evidence upload, admin moderation approve or reject, supplier response, and appeal re-queue. Automated checks R E V one through four passed."
say_clip rfq "R F Q marketplace: validation rejects nonsensical titles and budgets. Buyers create, list, revise, compare quotes, award and close with audit. Signed out users no longer see owner controls."
say_clip billing "Billing: Stripe test mode checkout, webhook credit grants, R F Q debit of twenty five credits, refunds, and ledger reconciliation. Isolated ledger checks passed. Production demo wallet showed a pre-existing drift of minus two hundred fifty credits; session net for the smoke run was correct."
say_clip security "Security and R B A C: protected dashboards block guests. Unauthenticated refund, procurement, and AI assist APIs are rejected. Demo role headers cannot elevate to admin in production."
say_clip tests "Automated evidence: nineteen of nineteen acceptance checks passed. Playwright acceptance audit thirty one of thirty one passed. Lighthouse reports are attached for homepage, dashboard, R F Q, company, profile, and pricing."
say_clip outro "Final status: ready for client U A T. All original P zero defects are closed on evidence. Please verify independently before written acceptance. Thank you."

# Durations from wav
dur_of() {
  ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$1"
}

echo "Building title cards..."
# Use slightly longer than audio
make_card 00_intro "RateQuip Phase 2 Acceptance" "MVP Core · Milestone 1" "$(python3 -c "print(max(8, float('$(dur_of "$WORK/audio/intro.wav")')+1))")"
make_card 01_repo "Repository · Commit · Release" "${COMMIT} · ${RELEASE}" "$(python3 -c "print(max(6, float('$(dur_of "$WORK/audio/repo.wav")')+1))")"
make_card 02_auth "Authentication" "Clerk · Roles · Session gating" "$(python3 -c "print(max(6, float('$(dur_of "$WORK/audio/auth.wav")')+1))")"
make_card 03_db "Database Evidence" "Migrate · Seed · Rollback" "$(python3 -c "print(max(6, float('$(dur_of "$WORK/audio/db.wav")')+1))")"
make_card 04_co "Company Management" "Create · Claim · Recover" "$(python3 -c "print(max(6, float('$(dur_of "$WORK/audio/company.wav")')+1))")"
make_card 05_rev "Reviews Lifecycle" "Evidence · Moderate · Appeal" "$(python3 -c "print(max(6, float('$(dur_of "$WORK/audio/reviews.wav")')+1))")"
make_card 06_rfq "RFQ Marketplace" "Validate · Quote · Award" "$(python3 -c "print(max(6, float('$(dur_of "$WORK/audio/rfq.wav")')+1))")"
make_card 07_bill "Billing & Credits" "Checkout · Webhook · Ledger" "$(python3 -c "print(max(6, float('$(dur_of "$WORK/audio/billing.wav")')+1))")"
make_card 08_sec "Security · RBAC · Isolation" "Negative tests" "$(python3 -c "print(max(6, float('$(dur_of "$WORK/audio/security.wav")')+1))")"
make_card 09_qa "Automated Tests" "Playwright · Lighthouse · Counter" "$(python3 -c "print(max(6, float('$(dur_of "$WORK/audio/tests.wav")')+1))")"
make_card 10_end "READY FOR CLIENT UAT" "Independent verification requested" "$(python3 -c "print(max(8, float('$(dur_of "$WORK/audio/outro.wav")')+1))")"

mux_card() {
  local id="$1" audio="$2"
  ffmpeg -y -i "$WORK/cards/${id}.mp4" -i "$WORK/audio/${audio}.wav" \
    -c:v copy -c:a aac -shortest "$WORK/segments/${id}.mp4" 2>/dev/null
}

echo "Muxing cards + narration..."
mux_card 00_intro intro
mux_card 01_repo repo
mux_card 02_auth auth
mux_card 03_db db
mux_card 04_co company
mux_card 05_rev reviews
mux_card 06_rfq rfq
mux_card 07_bill billing
mux_card 08_sec security
mux_card 09_qa tests
mux_card 10_end outro

# Scale helper for source clips to 1920x1080 60fps
scale_clip() {
  local in="$1" out="$2" maxdur="${3:-0}"
  local args=(-y -i "$in")
  if [[ "$maxdur" != "0" ]]; then args+=(-t "$maxdur"); fi
  ffmpeg "${args[@]}" -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=60,setsar=1" \
    -c:v libx264 -pix_fmt yuv420p -an "$out" 2>/dev/null
}

echo "Preparing demo segments from recorded evidence..."
# Intro UAT (full ~346s) — keep full for substance
scale_clip "$VID/uat-full-walkthrough.mp4" "$WORK/segments/uat_main.mp4" 0
# P0 close-ups (trim long ones)
scale_clip "$VID/01-signed-out-rfq-controls.mp4" "$WORK/segments/clip01.mp4" 25
scale_clip "$VID/02-add-company-contacts.mp4" "$WORK/segments/clip02.mp4" 40
scale_clip "$VID/05-billing-reconciliation.mp4" "$WORK/segments/clip05.mp4" 35
scale_clip "$VID/07-create-valid-rfq.mp4" "$WORK/segments/clip07.mp4" 40
scale_clip "$VID/09-submit-review-with-evidence.mp4" "$WORK/segments/clip09.mp4" 30
scale_clip "$VID/10-admin-moderation-queue.mp4" "$WORK/segments/clip10.mp4" 30
scale_clip "$VID/12-supplier-quote-builder.mp4" "$WORK/segments/clip12.mp4" 30
scale_clip "$VID/13-compare-quotes.mp4" "$WORK/segments/clip13.mp4" 25
scale_clip "$VID/14-pricing-and-checkout.mp4" "$WORK/segments/clip14.mp4" 25
scale_clip "$VID/19-award-or-close-rfq.mp4" "$WORK/segments/clip19.mp4" 40
scale_clip "$VID/20-onboarding-roles.mp4" "$WORK/segments/clip20.mp4" 25

# Add soft narration bed under silent demo sections (optional ambient voice between cards already spoken)
# Concat list in video order per PART 13
cat > "$WORK/concat.txt" <<EOF
file '$WORK/segments/00_intro.mp4'
file '$WORK/segments/01_repo.mp4'
file '$WORK/segments/02_auth.mp4'
file '$WORK/segments/clip20.mp4'
file '$WORK/segments/03_db.mp4'
file '$WORK/segments/04_co.mp4'
file '$WORK/segments/clip02.mp4'
file '$WORK/segments/05_rev.mp4'
file '$WORK/segments/clip09.mp4'
file '$WORK/segments/clip10.mp4'
file '$WORK/segments/06_rfq.mp4'
file '$WORK/segments/clip07.mp4'
file '$WORK/segments/clip12.mp4'
file '$WORK/segments/clip13.mp4'
file '$WORK/segments/clip19.mp4'
file '$WORK/segments/clip01.mp4'
file '$WORK/segments/07_bill.mp4'
file '$WORK/segments/clip14.mp4'
file '$WORK/segments/clip05.mp4'
file '$WORK/segments/08_sec.mp4'
file '$WORK/segments/09_qa.mp4'
file '$WORK/segments/uat_main.mp4'
file '$WORK/segments/10_end.mp4'
EOF

echo "Concatenating final narrated acceptance video..."
ffmpeg -y -f concat -safe 0 -i "$WORK/concat.txt" -c:v libx264 -r 60 -pix_fmt yuv420p -c:a aac -movflags +faststart \
  "$VID/phase2-acceptance-narrated.mp4" 2>"$WORK/ffmpeg-final.log"

ffprobe -v error -show_entries format=duration,size -show_streams -select_streams v:0 \
  -of default=noprint_wrappers=1 "$VID/phase2-acceptance-narrated.mp4" | tee "$WORK/final-probe.txt"

echo "DONE: $VID/phase2-acceptance-narrated.mp4"
