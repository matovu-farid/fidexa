# Fidexa Invoice Letterhead and Signature Design

## Objective

Extend the shared Fidexa invoice renderer so client-facing invoices and quotations use one reusable letterhead and authorized-signature treatment.

## Design

- Keep the existing Fidexa identity: navy wordmark, mint top rule, purple document accent, white A4 paper, and slate supporting text.
- Treat the existing header and footer as a reusable letterhead shared by invoices and quotations.
- Keep the phone number in the footer contact block alongside the website and sender email: `+256 705 222 144`.
- Place the supplied transparent signature image in the final-page closing area above `Authorized Signature`.
- Include the signature on client-facing invoices and quotations only. Internal statements remain calculation records and do not carry the signature.
- Keep the signature at a restrained size with sufficient whitespace so it reads as an authorization mark rather than a decorative graphic.

## Acceptance criteria

- Invoice and quotation PDFs contain the Fidexa phone number and `Authorized Signature` label.
- Both client PDFs use the same letterhead geometry and contact hierarchy.
- The signature has no opaque background box and does not overlap totals or footer content.
- Internal statements remain free of the signature.
- The generated documents remain A4 and pass the existing TypeScript and Vitest checks.

## Implementation note

The signature is stored as `public/fidexa-signature.png` and embedded by the PDF renderer. The MCP contract remains unchanged: `create_invoice` and `create_quotation` automatically apply the shared design.
