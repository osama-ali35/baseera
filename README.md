# Baseera v0.1 — pre-challenge baseline
Created 2026-09-29 for Dr. Osama Sayed Abdelkawi. Individual participation.

## Run
Serve `dist/` using any static web server. There are no dependencies, secret keys, or build step.

## Implemented
Five English lessons, before/after MCQs, answer-specific reference feedback, optional ungraded reflection, source links, session summary, responsive layout. State lives only in memory and resets on reload.

## Important limitations
No LLM, no RAG, no automatic free-text assessment. Feedback is explicitly deterministic. Lesson content is an original introductory paraphrase pending specialist review and validation against the challenge's approved source package. No claim of measured educational effectiveness. Original answers are retained per session; review cannot change submitted scores.

## Source ledger (checked 2026-09-29)
Salah: https://quran.com/4/103
Sawm: https://quran.com/2/183
Zakat: https://quran.com/9/60
Sadaqah: https://quran.com/2/261
Hajj: https://quran.com/3/97
External pages are linked, not copied or bundled. No copyrighted translation text is reproduced. The narrow voluntary-giving usage of Sadaqah is explicitly qualified.

## Challenge provenance
This whole version is pre-existing work as of 29 September. Disclose it and retain its Git commit as baseline. Only additions during 4–6 October are new challenge work. This private Sites repository is not the public GitHub repository required for final submission.

## Next milestone
Confirm approved source package and content review; connect server-side language model with source IDs and bounded retrieval; test abstention, contradiction, unsupported claims and multilingual input; measure cost and quality; prepare public licensed code and required deliverables.

## Version 0.2 — 2026-09-30 (also pre-challenge work)
Adds five source-linked concept maps with expandable explanatory branches, a decision flow explaining the existing feedback rules, and three conceptual AI illustrations in the Salah, Sawm and Hajj lessons. Illustrations are explicitly labeled and are not procedural religious instructions or factual photographs. No new AI assessment is claimed. Image generation prompts and asset provenance are recorded in `ASSETS.md`.

## Version 0.3 — installable PWA (30 September 2026)
One responsive application supports mobile and Windows installation through compatible browsers. This is not a signed APK, EXE, or app-store release. Manifest includes standalone display and 192/512 PNG icons based on the existing favicon. Installation guide is included in Arabic.

A versioned service worker downloads a fixed allowlist of lesson files and images. It rejects redirected/non-app HTML and mismatched asset types, never caches external references, arbitrary URLs, API responses, or personal answers. Root navigation tries the network first and uses the cached app only on a network failure; an online sign-in or access-denied response is not replaced with a cached page. Offline content remains on the device; a remove-offline control unregisters this worker and deletes its named caches. New app versions wait for user confirmation before activation to avoid discarding an active practice session. Session answers remain ephemeral.

Installation and offline readiness must be confirmed on real supported devices and the private hosting gateway. A manifest or a successful deployment alone does not prove browser installation eligibility. Offline readiness is reported only after verifying every required asset in the active cache. AI services remain unconnected and future live inference will require internet.
