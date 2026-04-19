"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.t = buildGatewayConnectionDetailsWithResolvers;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _pathsDvv9VRAc = require("./paths-Dvv9VRAc.js");
var _netLBInRHnX = require("./net-lBInRHnX.js");
//#region src/gateway/connection-details.ts
function buildGatewayConnectionDetailsWithResolvers(options = {}, resolvers = {}) {
  const config = options.config ?? resolvers.loadConfig?.() ?? {};
  const configPath = options.configPath ?? resolvers.resolveConfigPath?.(process.env) ?? (0, _pathsDvv9VRAc.o)(process.env);
  const isRemoteMode = config.gateway?.mode === "remote";
  const remote = isRemoteMode ? config.gateway?.remote : void 0;
  const tlsEnabled = config.gateway?.tls?.enabled === true;
  const localPort = resolvers.resolveGatewayPort?.(config, process.env) ?? (0, _pathsDvv9VRAc.u)(config);
  const bindMode = config.gateway?.bind ?? "loopback";
  const localUrl = `${tlsEnabled ? "wss" : "ws"}://127.0.0.1:${localPort}`;
  const cliUrlOverride = (0, _stringCoerceBUSzWgUA.s)(options.url);
  const envUrlOverride = cliUrlOverride ? void 0 : (0, _stringCoerceBUSzWgUA.s)(process.env.OPENCLAW_GATEWAY_URL);
  const urlOverride = cliUrlOverride ?? envUrlOverride;
  const remoteUrl = (0, _stringCoerceBUSzWgUA.s)(remote?.url);
  const remoteMisconfigured = isRemoteMode && !urlOverride && !remoteUrl;
  const urlSourceHint = options.urlSource ?? (cliUrlOverride ? "cli" : envUrlOverride ? "env" : void 0);
  const url = urlOverride || remoteUrl || localUrl;
  const urlSource = urlOverride ? urlSourceHint === "env" ? "env OPENCLAW_GATEWAY_URL" : "cli --url" : remoteUrl ? "config gateway.remote.url" : remoteMisconfigured ? "missing gateway.remote.url (fallback local)" : "local loopback";
  const bindDetail = !urlOverride && !remoteUrl ? `Bind: ${bindMode}` : void 0;
  const remoteFallbackNote = remoteMisconfigured ? "Warn: gateway.mode=remote but gateway.remote.url is missing; set gateway.remote.url or switch gateway.mode=local." : void 0;
  const allowPrivateWs = process.env.OPENCLAW_ALLOW_INSECURE_PRIVATE_WS === "1";
  if (!(0, _netLBInRHnX.c)(url, { allowPrivateWs })) throw new Error([
  `SECURITY ERROR: Gateway URL "${url}" uses plaintext ws:// to a non-loopback address.`,
  "Both credentials and chat data would be exposed to network interception.",
  `Source: ${urlSource}`,
  `Config: ${configPath}`,
  "Fix: Use wss:// for remote gateway URLs.",
  "Safe remote access defaults:",
  "- keep gateway.bind=loopback and use an SSH tunnel (ssh -N -L 18789:127.0.0.1:18789 user@gateway-host)",
  "- or use Tailscale Serve/Funnel for HTTPS remote access",
  allowPrivateWs ? void 0 : "Break-glass (trusted private networks only): set OPENCLAW_ALLOW_INSECURE_PRIVATE_WS=1",
  "Doctor: openclaw doctor --fix",
  "Docs: https://docs.openclaw.ai/gateway/remote"].
  join("\n"));
  return {
    url,
    urlSource,
    bindDetail,
    remoteFallbackNote,
    message: [
    `Gateway target: ${url}`,
    `Source: ${urlSource}`,
    `Config: ${configPath}`,
    bindDetail,
    remoteFallbackNote].
    filter(Boolean).join("\n")
  };
}
//#endregion /* v9-2281fad7a3ca549e */
