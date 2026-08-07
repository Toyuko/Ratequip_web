#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path

ROOT = Path("/Users/Microsoft/Documents/Github/Ratequip_web")
VID = ROOT / "docs/acceptance-phase2/videos"
SEG = ROOT / "docs/acceptance-phase2/raw/video-build/segments"
LIST = ROOT / "docs/acceptance-phase2/raw/video-build/concat-final.txt"

order = [
    "00_intro.mp4",
    "01_repo.mp4",
    "02_auth.mp4",
    "17-auth-signup-entry.mp4",
    "20-onboarding-roles.mp4",
    "03_db.mp4",
    "04_co.mp4",
    "02-add-company-contacts.mp4",
    "11-company-claim-submit.mp4",
    "05_rev.mp4",
    "06-reviews-lifecycle.mp4",
    "09-submit-review-with-evidence.mp4",
    "10-admin-moderation-queue.mp4",
    "06_rfq.mp4",
    "15-rfq-marketplace-list.mp4",
    "07-create-valid-rfq.mp4",
    "04-rfq-validation-and-edit.mp4",
    "03-buyer-dashboard-rfqs.mp4",
    "18-revise-rfq-save.mp4",
    "12-supplier-quote-builder.mp4",
    "13-compare-quotes.mp4",
    "19-award-or-close-rfq.mp4",
    "08-signed-in-rfq-owner-controls.mp4",
    "01-signed-out-rfq-controls.mp4",
    "07_bill.mp4",
    "14-pricing-and-checkout.mp4",
    "05-billing-reconciliation.mp4",
    "08_sec.mp4",
    "16-supplier-directory-profile.mp4",
    "09_qa.mp4",
    "screenshot_review.mp4",
    "uat_main.mp4",
    "10_end.mp4",
]

lines = []
total = 0.0
for name in order:
    p = SEG / name
    if not p.exists():
        raise SystemExit(f"missing {p}")
    d = float(
        subprocess.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "default=noprint_wrappers=1:nokey=1",
                str(p),
            ],
            text=True,
        ).strip()
        or 0
    )
    total += d
    print(f"{d:7.1f}  {name}")
    lines.append(f"file '{p}'")

print(f"TOTAL {total/60:.1f} min ({total:.1f}s)")
LIST.write_text("\n".join(lines) + "\n")

out = VID / "phase2-acceptance-narrated.mp4"
cmd = [
    "ffmpeg",
    "-y",
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    str(LIST),
    "-c:v",
    "libx264",
    "-r",
    "60",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-movflags",
    "+faststart",
    str(out),
]
print("Running ffmpeg concat...")
subprocess.check_call(cmd)
subprocess.check_call(
    [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration,size",
        "-show_entries",
        "stream=width,height,r_frame_rate",
        "-select_streams",
        "v:0",
        "-of",
        "default=noprint_wrappers=1",
        str(out),
    ]
)
print("Wrote", out, "bytes", out.stat().st_size)
