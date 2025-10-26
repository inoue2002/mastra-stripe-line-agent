import { MCPClient } from "@mastra/mcp";

export const lineMCPClient = new MCPClient({
  id: "line-tools",
  servers: {
    "line-tools": {
      "command": "npx",
      "args": [
        "@line/line-bot-mcp-server"
      ],
      "env": {
        "CHANNEL_ACCESS_TOKEN" : process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
        "DESTINATION_USER_ID" : process.env.LINE_DESTINATION_USER_ID || ''
      }
    }
  },
  timeout: 30000,
});
