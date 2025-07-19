import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

//Create server
const server = new McpServer({
  name: "My MCP Server",
  version: "1.0.0",
});

//Define a tool
server.tool(
    "Cityweather", 
    "Tool to get the weather in a city",
    {
        city: z.string().describe("The name of the city to get the weather for") 
    },
    async ({ city }) => {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`);
        const data = await response.json();
        if(data.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No weather data found for ${city}.`
                    }
                ]
            }
        }

        const {latitude, longitude} = data.results[0];
        const foreCastResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,precipitation,apparent_temperature,relative_humidity_2m&current=is_day`);
        const foreCastData = await foreCastResponse.json();

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(foreCastData, null, 2)
                }
            ]
        }
    }
);

//Start the server and hear connections
const transport = new StdioServerTransport();
await server.connect(transport);