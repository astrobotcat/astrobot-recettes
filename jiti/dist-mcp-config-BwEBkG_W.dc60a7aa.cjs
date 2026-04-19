"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.i = unsetConfiguredMcpServer;exports.n = normalizeConfiguredMcpServers;exports.r = setConfiguredMcpServer;exports.t = listConfiguredMcpServers;var _utilsD5DtWkEu = require("./utils-D5DtWkEu.js");
var _io5pxHCi7V = require("./io-5pxHCi7V.js");
var _configQ9XZc_2I = require("./config-Q9XZc_2I.js");
//#region src/config/mcp-config.ts
function normalizeConfiguredMcpServers(value) {
  if (!(0, _utilsD5DtWkEu.l)(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, server]) => (0, _utilsD5DtWkEu.l)(server)).map(([name, server]) => [name, { ...server }]));
}
async function listConfiguredMcpServers() {
  const snapshot = await (0, _io5pxHCi7V.f)();
  if (!snapshot.valid) return {
    ok: false,
    path: snapshot.path,
    error: "Config file is invalid; fix it before using MCP config commands."
  };
  const sourceConfig = snapshot.sourceConfig ?? snapshot.resolved;
  return {
    ok: true,
    path: snapshot.path,
    config: structuredClone(sourceConfig),
    mcpServers: normalizeConfiguredMcpServers(sourceConfig.mcp?.servers),
    baseHash: snapshot.hash
  };
}
async function setConfiguredMcpServer(params) {
  const name = params.name.trim();
  if (!name) return {
    ok: false,
    path: "",
    error: "MCP server name is required."
  };
  if (!(0, _utilsD5DtWkEu.l)(params.server)) return {
    ok: false,
    path: "",
    error: "MCP server config must be a JSON object."
  };
  const loaded = await listConfiguredMcpServers();
  if (!loaded.ok) return loaded;
  const next = structuredClone(loaded.config);
  const servers = normalizeConfiguredMcpServers(next.mcp?.servers);
  servers[name] = { ...params.server };
  next.mcp = {
    ...next.mcp,
    servers
  };
  const validated = (0, _io5pxHCi7V.S)(next);
  if (!validated.ok) {
    const issue = validated.issues[0];
    return {
      ok: false,
      path: loaded.path,
      error: `Config invalid after MCP set (${issue.path}: ${issue.message}).`
    };
  }
  await (0, _configQ9XZc_2I.r)({
    nextConfig: validated.config,
    baseHash: loaded.baseHash
  });
  return {
    ok: true,
    path: loaded.path,
    config: validated.config,
    mcpServers: servers
  };
}
async function unsetConfiguredMcpServer(params) {
  const name = params.name.trim();
  if (!name) return {
    ok: false,
    path: "",
    error: "MCP server name is required."
  };
  const loaded = await listConfiguredMcpServers();
  if (!loaded.ok) return loaded;
  if (!Object.hasOwn(loaded.mcpServers, name)) return {
    ok: true,
    path: loaded.path,
    config: loaded.config,
    mcpServers: loaded.mcpServers,
    removed: false
  };
  const next = structuredClone(loaded.config);
  const servers = normalizeConfiguredMcpServers(next.mcp?.servers);
  delete servers[name];
  if (Object.keys(servers).length > 0) next.mcp = {
    ...next.mcp,
    servers
  };else
  if (next.mcp) {
    delete next.mcp.servers;
    if (Object.keys(next.mcp).length === 0) delete next.mcp;
  }
  const validated = (0, _io5pxHCi7V.S)(next);
  if (!validated.ok) {
    const issue = validated.issues[0];
    return {
      ok: false,
      path: loaded.path,
      error: `Config invalid after MCP unset (${issue.path}: ${issue.message}).`
    };
  }
  await (0, _configQ9XZc_2I.r)({
    nextConfig: validated.config,
    baseHash: loaded.baseHash
  });
  return {
    ok: true,
    path: loaded.path,
    config: validated.config,
    mcpServers: servers,
    removed: true
  };
}
//#endregion /* v9-39fa0511f9faaa8b */
