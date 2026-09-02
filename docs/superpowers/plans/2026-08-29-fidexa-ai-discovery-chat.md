# Fidexa AI Discovery Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Fidexa's AI chat to the latest installed AI SDK, use `gpt-5-mini`, and provide a fast guided discovery interview for prospective clients.

**Architecture:** Keep the existing Next.js App Router `/api/chat` endpoint and modal. The server will translate AI SDK UI messages into model messages and return a UI message stream; the client will use `DefaultChatTransport` and render message text parts. A deterministic initial assistant message provides zero-latency greeting while the model handles subsequent discovery turns.

**Tech Stack:** Next.js App Router, React, AI SDK 7, `@ai-sdk/react` 4, `@ai-sdk/openai` 4, TypeScript, OpenAI `gpt-5-mini`.

---

### Task 1: Migrate the chat endpoint to the current AI SDK protocol

**Files:**
- Modify: `src/app/api/chat/route.ts`
- Test: `pnpm --config.store-dir=/private/tmp/fidexa-pnpm-store/v11 exec tsc --noEmit`

- [x] **Step 1: Convert UI messages before model invocation**

Use `convertToModelMessages` on the request's `messages` array, keep the server-owned system prompt, and select `process.env.OPENAI_CHAT_MODEL ?? "gpt-5-mini"`.

- [x] **Step 2: Return a UI message stream**

Use `toUIMessageStream({ stream: result.stream })` with `createUIMessageStreamResponse` so the route matches the upgraded `useChat` transport.

- [x] **Step 3: Verify the endpoint types**

Run `pnpm --config.store-dir=/private/tmp/fidexa-pnpm-store/v11 exec tsc --noEmit` and confirm no endpoint errors remain.

### Task 2: Migrate the chat modal and seed the instant greeting

**Files:**
- Modify: `src/components/chat-modal.tsx`
- Test: `pnpm --config.store-dir=/private/tmp/fidexa-pnpm-store/v11 exec tsc --noEmit`

- [x] **Step 1: Replace removed AI SDK v4 helpers**

Use `DefaultChatTransport`, `sendMessage`, local `input` state, and a submit handler instead of `api`, `handleSubmit`, and `handleInputChange`.

- [x] **Step 2: Add the zero-latency opening message**

Initialize `useChat` with one assistant UI message containing the Fidexa welcome and first question. Do not call the API when the modal opens.

- [x] **Step 3: Render current UI message parts**

Render only text parts from each message and preserve the existing markdown presentation, focus trap, close behavior, loading state, and accessible labels.

### Task 3: Verify the integrated change

**Files:**
- Test: `pnpm --config.store-dir=/private/tmp/fidexa-pnpm-store/v11 exec tsc --noEmit`
- Test: `pnpm --config.store-dir=/private/tmp/fidexa-pnpm-store/v11 build`

- [x] **Step 1: Run TypeScript verification**

Confirm the command exits 0 with no diagnostics.

- [x] **Step 2: Run the production build**

Confirm Next.js compiles the migrated endpoint and client bundle successfully.

- [x] **Step 3: Review the diff and status**

Confirm only the AI SDK dependency files, chat files, and this design/plan documentation are part of the intended change; preserve unrelated user changes.
