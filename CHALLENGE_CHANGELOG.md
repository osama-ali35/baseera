# Challenge work — 4 October 2026

Baseline: main commit e3eba8b1104fbf8ae3aaab0f7d6c477f137284b3. Preserve BASELINE.md and BASELINE_MANIFEST.json as historical evidence; the old manifest does not describe modified v0.4 files.

Added: measurable Salah objective; optional consent-based written-answer feedback; curated retrieval by concept ID from one Dorar passage; structured AI output with reference-ID validation; timeout and bounded server requests; instance-wide request budget; updated source/privacy/status labels; offline cache version bump.

Source selection: organizer PDF “المرجعية و الحزمة العلمية و البيانات”, pages 4–5 lists dorar.net/feqhia and requires traceable sources, separation of quotations from generated explanation, and referral for personal rulings. Source: https://dorar.net/feqhia/831 — heading “المطلب الأول: اشتراط دخول الوقت”, Qur’an evidence and “وجه الدلالة”. Checked 4 October. A minimal Arabic excerpt is embedded; English explanation is project paraphrasing. Full source is linked, not copied. Source verification is not specialist approval; no specialist review has been recorded.

Uses OpenAI Chat Completions and Node built-ins, with no new dependencies. Only Salah is covered by the AI endpoint; other concepts retain baseline feedback. Retrieval is a curated lookup, not embedding search or a broad knowledge corpus.

Validation: npm run build; npm test (mocked provider, request validation, fail-closed output handling). Actual provider response quality, human agreement, learner gains, and production activation have NOT been verified. Do not present mocked tests as live AI evidence.

Configuration does not prove operational readiness. No API key is committed. No participant test outcomes are fabricated.
