# Fidexa AI Discovery Chat Design

## Goal

Make Fidexa's public AI chat fast to open and useful for converting qualified visitors into well-scoped project conversations.

## Approved approach

Use a deterministic opening message rendered immediately in the modal, then use the current OpenAI provider with `gpt-5-mini` for the interactive conversation. Keep the existing Next.js App Router endpoint and avoid adding a database, CRM write, scheduler, or automatic lead email in this iteration.

## Behavior

- Opening the modal shows an immediate Fidexa welcome and the first discovery question without an API request.
- The model asks one question at a time and adapts to the visitor's answers.
- The model learns about the visitor's role/company, problem, users, workflows, platforms, integrations, data/compliance constraints, launch timeline, success measures, budget, decision process, and preferred next step.
- The model accurately presents Fidexa as an international product-engineering studio with fintech and financial-operations expertise.
- The model may reference Rishi's Apple-only production deployment and the production inventory and accounting-ledger money-lending systems, without claiming Android availability for Rishi or inventing metrics.
- The model presents the free fit call and limited Penpot concept only after qualification, and describes the paid pilot as a one-month, 40-hour engagement billed monthly in advance with weekly priorities and Friday reviews.
- At the end, the model summarizes the opportunity for confirmation, asks for contact details, and directs the prospect to Fidexa's contact handoff. It does not automatically persist or email the details.
- The model must not request passwords, API keys, payment details, or other unnecessary sensitive data.

## SDK migration

- `ai`, `@ai-sdk/react`, and `@ai-sdk/openai` remain installed at the latest compatible versions selected by pnpm.
- The server converts UI messages with `convertToModelMessages` and returns the current UI message stream response.
- The client uses `DefaultChatTransport`, `sendMessage`, controlled local input state, and UI message `parts`.
- The model is configurable through `OPENAI_CHAT_MODEL`, defaulting to `gpt-5-mini`.
- The OpenAI provider uses low reasoning effort and a bounded output to keep discovery turns responsive and cost-conscious.

## Verification

- TypeScript must pass with no errors.
- The production build must pass.
- The diff must contain only the intended dependency and chat changes plus this design/plan documentation.
