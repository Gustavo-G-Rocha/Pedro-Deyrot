import { onRequestPost as __api_submit_js_onRequestPost } from "C:\\Users\\Felipi\\Pictures\\Deyrot\\Pedro-Deyrot\\functions\\api\\submit.js"
import { onRequest as __api_submit_js_onRequest } from "C:\\Users\\Felipi\\Pictures\\Deyrot\\Pedro-Deyrot\\functions\\api\\submit.js"
import { onRequest as ____path___js_onRequest } from "C:\\Users\\Felipi\\Pictures\\Deyrot\\Pedro-Deyrot\\functions\\[[path]].js"

export const routes = [
    {
      routePath: "/api/submit",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_submit_js_onRequestPost],
    },
  {
      routePath: "/api/submit",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_submit_js_onRequest],
    },
  {
      routePath: "/:path*",
      mountPath: "/",
      method: "",
      middlewares: [],
      modules: [____path___js_onRequest],
    },
  ]