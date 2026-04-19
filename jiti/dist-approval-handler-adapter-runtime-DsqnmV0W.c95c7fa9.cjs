"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.n = createLazyChannelApprovalNativeRuntimeAdapter;exports.t = void 0;var _lazyRuntimeDQGYmUDC = require("./lazy-runtime-DQGYmUDC.js");
//#region src/infra/approval-handler-adapter-runtime.ts
const CHANNEL_APPROVAL_NATIVE_RUNTIME_CONTEXT_CAPABILITY = exports.t = "approval.native";
function createLazyChannelApprovalNativeRuntimeAdapter(params) {
  const loadRuntime = (0, _lazyRuntimeDQGYmUDC.r)(params.load);
  let loadedRuntime = null;
  const loadResolvedRuntime = async () => {
    const runtime = await loadRuntime();
    loadedRuntime = runtime;
    return runtime;
  };
  const loadRequired = async (select) => select(await loadResolvedRuntime());
  const loadOptional = async (select) => select(await loadResolvedRuntime());
  return {
    ...(params.eventKinds ? { eventKinds: params.eventKinds } : {}),
    ...(params.resolveApprovalKind ? { resolveApprovalKind: params.resolveApprovalKind } : {}),
    availability: {
      isConfigured: params.isConfigured,
      shouldHandle: params.shouldHandle
    },
    presentation: {
      buildPendingPayload: async (runtimeParams) => (await loadRequired((runtime) => runtime.presentation.buildPendingPayload))(runtimeParams),
      buildResolvedResult: async (runtimeParams) => (await loadRequired((runtime) => runtime.presentation.buildResolvedResult))(runtimeParams),
      buildExpiredResult: async (runtimeParams) => (await loadRequired((runtime) => runtime.presentation.buildExpiredResult))(runtimeParams)
    },
    transport: {
      prepareTarget: async (runtimeParams) => (await loadRequired((runtime) => runtime.transport.prepareTarget))(runtimeParams),
      deliverPending: async (runtimeParams) => (await loadRequired((runtime) => runtime.transport.deliverPending))(runtimeParams),
      updateEntry: async (runtimeParams) => await (await loadOptional((runtime) => runtime.transport.updateEntry))?.(runtimeParams),
      deleteEntry: async (runtimeParams) => await (await loadOptional((runtime) => runtime.transport.deleteEntry))?.(runtimeParams)
    },
    interactions: {
      bindPending: async (runtimeParams) => (await loadOptional((runtime) => runtime.interactions?.bindPending))?.(runtimeParams) ?? null,
      unbindPending: async (runtimeParams) => await (await loadOptional((runtime) => runtime.interactions?.unbindPending))?.(runtimeParams),
      clearPendingActions: async (runtimeParams) => await (await loadOptional((runtime) => runtime.interactions?.clearPendingActions))?.(runtimeParams)
    },
    observe: {
      onDeliveryError: (runtimeParams) => loadedRuntime?.observe?.onDeliveryError?.(runtimeParams),
      onDuplicateSkipped: (runtimeParams) => loadedRuntime?.observe?.onDuplicateSkipped?.(runtimeParams),
      onDelivered: (runtimeParams) => loadedRuntime?.observe?.onDelivered?.(runtimeParams)
    }
  };
}
//#endregion /* v9-bf1c505e9a0c51e3 */
