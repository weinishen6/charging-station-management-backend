import base from "./base-v30.js";
import { V31_SCRIPT_1 } from "./v31-1.js";
import { V31_SCRIPT_2 } from "./v31-2.js";
import { V31_SCRIPT_3 } from "./v31-3.js";
import { V31_SCRIPT_4 } from "./v31-4.js";

const V31_SCRIPT = V31_SCRIPT_1 + "\n" + V31_SCRIPT_2 + "\n" + V31_SCRIPT_3 + "\n" + V31_SCRIPT_4;

export default {
  async fetch(request, env, ctx) {
    const response = await base.fetch(request, env, ctx);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;
    const html = await response.text();
    const headers = new Headers(response.headers);
    return new Response(html.replace("</body>", "<script>" + V31_SCRIPT + "</script></body>"), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
