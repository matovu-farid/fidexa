import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createInvoiceMcpServer } from "../src/mcp/invoice-server";

const server = createInvoiceMcpServer();
const transport = new StdioServerTransport();

await server.connect(transport);
