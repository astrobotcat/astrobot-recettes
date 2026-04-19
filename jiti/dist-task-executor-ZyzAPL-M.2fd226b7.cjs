"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.a = createRunningTaskRun;exports.c = recordTaskRunProgressByRunId;exports.d = startTaskRunByRunId;exports.f = findLatestTaskFlowForOwner;exports.h = resolveTaskFlowForLookupTokenForOwner;exports.i = createQueuedTaskRun;exports.l = runTaskInFlowForOwner;exports.m = listTaskFlowsForOwner;exports.n = cancelFlowByIdForOwner;exports.o = failTaskRunByRunId;exports.p = getTaskFlowByIdForOwner;exports.r = completeTaskRunByRunId;exports.s = getFlowTaskSummary;exports.t = cancelFlowById;exports.u = setDetachedTaskDeliveryStatusByRunId;var _stringCoerceBUSzWgUA = require("./string-coerce-BUSzWgUA.js");
var _subsystemCgmckbux = require("./subsystem-Cgmckbux.js");
var _taskRegistryBO2EMqj = require("./task-registry-BO2EMqj7.js");
var _taskRegistrySummaryCcv1tBd = require("./task-registry.summary-Ccv1tBd5.js");
require("./runtime-internal-tfNsv16F.js");
//#region src/tasks/task-flow-owner-access.ts
function getTaskFlowByIdForOwner(params) {
  const flow = (0, _taskRegistryBO2EMqj.j)(params.flowId);
  return flow && (0, _stringCoerceBUSzWgUA.s)(flow.ownerKey) === (0, _stringCoerceBUSzWgUA.s)(params.callerOwnerKey) ? flow : void 0;
}
function listTaskFlowsForOwner(params) {
  const ownerKey = (0, _stringCoerceBUSzWgUA.s)(params.callerOwnerKey);
  return ownerKey ? (0, _taskRegistryBO2EMqj.P)(ownerKey) : [];
}
function findLatestTaskFlowForOwner(params) {
  const ownerKey = (0, _stringCoerceBUSzWgUA.s)(params.callerOwnerKey);
  return ownerKey ? (0, _taskRegistryBO2EMqj.k)(ownerKey) : void 0;
}
function resolveTaskFlowForLookupTokenForOwner(params) {
  const direct = getTaskFlowByIdForOwner({
    flowId: params.token,
    callerOwnerKey: params.callerOwnerKey
  });
  if (direct) return direct;
  const normalizedToken = (0, _stringCoerceBUSzWgUA.s)(params.token);
  const normalizedCallerOwnerKey = (0, _stringCoerceBUSzWgUA.s)(params.callerOwnerKey);
  if (!normalizedToken || normalizedToken !== normalizedCallerOwnerKey) return;
  return findLatestTaskFlowForOwner({ callerOwnerKey: normalizedCallerOwnerKey });
}
//#endregion
//#region src/tasks/task-executor.ts
const log = (0, _subsystemCgmckbux.t)("tasks/executor");
function isOneTaskFlowEligible(task) {
  if (task.parentFlowId?.trim() || task.scopeKind !== "session") return false;
  if (task.deliveryStatus === "not_applicable") return false;
  return task.runtime === "acp" || task.runtime === "subagent";
}
function ensureSingleTaskFlow(params) {
  if (!isOneTaskFlowEligible(params.task)) return params.task;
  try {
    const flow = (0, _taskRegistryBO2EMqj.E)({
      task: params.task,
      requesterOrigin: params.requesterOrigin
    });
    const linked = (0, _taskRegistryBO2EMqj.c)({
      taskId: params.task.taskId,
      flowId: flow.flowId
    });
    if (!linked) {
      (0, _taskRegistryBO2EMqj.D)(flow.flowId);
      return params.task;
    }
    if (linked.parentFlowId !== flow.flowId) {
      (0, _taskRegistryBO2EMqj.D)(flow.flowId);
      return linked;
    }
    return linked;
  } catch (error) {
    log.warn("Failed to create one-task flow for detached run", {
      taskId: params.task.taskId,
      runId: params.task.runId,
      error
    });
    return params.task;
  }
}
function createQueuedTaskRun(params) {
  return ensureSingleTaskFlow({
    task: (0, _taskRegistryBO2EMqj.n)({
      ...params,
      status: "queued"
    }),
    requesterOrigin: params.requesterOrigin
  });
}
function getFlowTaskSummary(flowId) {
  return (0, _taskRegistrySummaryCcv1tBd.n)((0, _taskRegistryBO2EMqj.d)(flowId));
}
function createRunningTaskRun(params) {
  return ensureSingleTaskFlow({
    task: (0, _taskRegistryBO2EMqj.n)({
      ...params,
      status: "running"
    }),
    requesterOrigin: params.requesterOrigin
  });
}
function startTaskRunByRunId(params) {
  return (0, _taskRegistryBO2EMqj.g)(params);
}
function recordTaskRunProgressByRunId(params) {
  return (0, _taskRegistryBO2EMqj.b)(params);
}
function completeTaskRunByRunId(params) {
  return (0, _taskRegistryBO2EMqj.v)({
    runId: params.runId,
    runtime: params.runtime,
    sessionKey: params.sessionKey,
    status: "succeeded",
    endedAt: params.endedAt,
    lastEventAt: params.lastEventAt,
    progressSummary: params.progressSummary,
    terminalSummary: params.terminalSummary,
    terminalOutcome: params.terminalOutcome
  });
}
function failTaskRunByRunId(params) {
  return (0, _taskRegistryBO2EMqj.v)({
    runId: params.runId,
    runtime: params.runtime,
    sessionKey: params.sessionKey,
    status: params.status ?? "failed",
    endedAt: params.endedAt,
    lastEventAt: params.lastEventAt,
    error: params.error,
    progressSummary: params.progressSummary,
    terminalSummary: params.terminalSummary
  });
}
function setDetachedTaskDeliveryStatusByRunId(params) {
  return (0, _taskRegistryBO2EMqj.C)(params);
}
function isActiveTaskStatus(status) {
  return status === "queued" || status === "running";
}
function isTerminalFlowStatus(status) {
  return status === "succeeded" || status === "failed" || status === "cancelled" || status === "lost";
}
function markFlowCancelRequested(flow) {
  if (flow.cancelRequestedAt != null) return flow;
  const result = (0, _taskRegistryBO2EMqj.F)({
    flowId: flow.flowId,
    expectedRevision: flow.revision
  });
  if (result.applied) return result.flow;
  return {
    reason: result.reason === "revision_conflict" ? "Flow changed while cancellation was in progress." : "Flow not found.",
    flow: result.current ?? (0, _taskRegistryBO2EMqj.j)(flow.flowId)
  };
}
function cancelManagedFlowAfterChildrenSettle(flow, endedAt) {
  const result = (0, _taskRegistryBO2EMqj.z)({
    flowId: flow.flowId,
    expectedRevision: flow.revision,
    patch: {
      status: "cancelled",
      blockedTaskId: null,
      blockedSummary: null,
      waitJson: null,
      endedAt,
      updatedAt: endedAt
    }
  });
  if (result.applied) return result.flow;
  return {
    reason: result.reason === "revision_conflict" ? "Flow changed while cancellation was in progress." : "Flow not found.",
    flow: result.current ?? (0, _taskRegistryBO2EMqj.j)(flow.flowId)
  };
}
function mapRunTaskInFlowCreateError(params) {
  const flow = (0, _taskRegistryBO2EMqj.j)(params.flowId);
  if ((0, _taskRegistryBO2EMqj.s)(params.error)) {
    if (params.error.code === "cancel_requested") return {
      found: true,
      created: false,
      reason: "Flow cancellation has already been requested.",
      ...(flow ? { flow } : {})
    };
    if (params.error.code === "terminal") return {
      found: true,
      created: false,
      reason: `Flow is already ${flow?.status ?? params.error.details?.status ?? "terminal"}.`,
      ...(flow ? { flow } : {})
    };
    if (params.error.code === "parent_flow_not_found") return {
      found: false,
      created: false,
      reason: "Flow not found."
    };
  }
  throw params.error;
}
function runTaskInFlow(params) {
  const flow = (0, _taskRegistryBO2EMqj.j)(params.flowId);
  if (!flow) return {
    found: false,
    created: false,
    reason: "Flow not found."
  };
  if (flow.syncMode !== "managed") return {
    found: true,
    created: false,
    reason: "Flow does not accept managed child tasks.",
    flow
  };
  if (flow.cancelRequestedAt != null) return {
    found: true,
    created: false,
    reason: "Flow cancellation has already been requested.",
    flow
  };
  if (isTerminalFlowStatus(flow.status)) return {
    found: true,
    created: false,
    reason: `Flow is already ${flow.status}.`,
    flow
  };
  const common = {
    runtime: params.runtime,
    sourceId: params.sourceId,
    ownerKey: flow.ownerKey,
    scopeKind: "session",
    requesterOrigin: flow.requesterOrigin,
    parentFlowId: flow.flowId,
    childSessionKey: params.childSessionKey,
    parentTaskId: params.parentTaskId,
    agentId: params.agentId,
    runId: params.runId,
    label: params.label,
    task: params.task,
    preferMetadata: params.preferMetadata,
    notifyPolicy: params.notifyPolicy,
    deliveryStatus: params.deliveryStatus ?? "pending"
  };
  let task;
  try {
    task = params.status === "running" ? createRunningTaskRun({
      ...common,
      startedAt: params.startedAt,
      lastEventAt: params.lastEventAt,
      progressSummary: params.progressSummary
    }) : createQueuedTaskRun(common);
  } catch (error) {
    return mapRunTaskInFlowCreateError({
      error,
      flowId: flow.flowId
    });
  }
  return {
    found: true,
    created: true,
    flow: (0, _taskRegistryBO2EMqj.j)(flow.flowId) ?? flow,
    task
  };
}
function runTaskInFlowForOwner(params) {
  const flow = getTaskFlowByIdForOwner({
    flowId: params.flowId,
    callerOwnerKey: params.callerOwnerKey
  });
  if (!flow) return {
    found: false,
    created: false,
    reason: "Flow not found."
  };
  return runTaskInFlow({
    flowId: flow.flowId,
    runtime: params.runtime,
    sourceId: params.sourceId,
    childSessionKey: params.childSessionKey,
    parentTaskId: params.parentTaskId,
    agentId: params.agentId,
    runId: params.runId,
    label: params.label,
    task: params.task,
    preferMetadata: params.preferMetadata,
    notifyPolicy: params.notifyPolicy,
    deliveryStatus: params.deliveryStatus,
    status: params.status,
    startedAt: params.startedAt,
    lastEventAt: params.lastEventAt,
    progressSummary: params.progressSummary
  });
}
async function cancelFlowById(params) {
  const flow = (0, _taskRegistryBO2EMqj.j)(params.flowId);
  if (!flow) return {
    found: false,
    cancelled: false,
    reason: "Flow not found."
  };
  if (isTerminalFlowStatus(flow.status)) return {
    found: true,
    cancelled: false,
    reason: `Flow is already ${flow.status}.`,
    flow,
    tasks: (0, _taskRegistryBO2EMqj.d)(flow.flowId)
  };
  const cancelRequestedFlow = markFlowCancelRequested(flow);
  if ("reason" in cancelRequestedFlow) return {
    found: true,
    cancelled: false,
    reason: cancelRequestedFlow.reason,
    flow: cancelRequestedFlow.flow,
    tasks: (0, _taskRegistryBO2EMqj.d)(flow.flowId)
  };
  const activeTasks = (0, _taskRegistryBO2EMqj.d)(flow.flowId).filter((task) => isActiveTaskStatus(task.status));
  for (const task of activeTasks) await (0, _taskRegistryBO2EMqj.t)({
    cfg: params.cfg,
    taskId: task.taskId
  });
  const refreshedTasks = (0, _taskRegistryBO2EMqj.d)(flow.flowId);
  if (refreshedTasks.filter((task) => isActiveTaskStatus(task.status)).length > 0) return {
    found: true,
    cancelled: false,
    reason: "One or more child tasks are still active.",
    flow: (0, _taskRegistryBO2EMqj.j)(flow.flowId) ?? cancelRequestedFlow,
    tasks: refreshedTasks
  };
  const now = Date.now();
  const refreshedFlow = (0, _taskRegistryBO2EMqj.j)(flow.flowId) ?? cancelRequestedFlow;
  if (isTerminalFlowStatus(refreshedFlow.status)) return {
    found: true,
    cancelled: refreshedFlow.status === "cancelled",
    reason: refreshedFlow.status === "cancelled" ? void 0 : `Flow is already ${refreshedFlow.status}.`,
    flow: refreshedFlow,
    tasks: refreshedTasks
  };
  const updatedFlow = cancelManagedFlowAfterChildrenSettle(refreshedFlow, now);
  if ("reason" in updatedFlow) return {
    found: true,
    cancelled: false,
    reason: updatedFlow.reason,
    flow: updatedFlow.flow,
    tasks: refreshedTasks
  };
  return {
    found: true,
    cancelled: true,
    flow: updatedFlow,
    tasks: refreshedTasks
  };
}
async function cancelFlowByIdForOwner(params) {
  const flow = getTaskFlowByIdForOwner({
    flowId: params.flowId,
    callerOwnerKey: params.callerOwnerKey
  });
  if (!flow) return {
    found: false,
    cancelled: false,
    reason: "Flow not found."
  };
  return cancelFlowById({
    cfg: params.cfg,
    flowId: flow.flowId
  });
}
//#endregion /* v9-dca038e6b8013564 */
