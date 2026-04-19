"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.ToolExecutionComponent = void 0;var _piTui = require("@mariozechner/pi-tui");
var _index = require("../../../core/tools/index.js");
var _renderUtils = require("../../../core/tools/render-utils.js");
var _imageConvert = require("../../../utils/image-convert.js");
var _theme = require("../theme/theme.js");
class ToolExecutionComponent extends _piTui.Container {
  contentBox;
  contentText;
  callRendererComponent;
  resultRendererComponent;
  rendererState = {};
  imageComponents = [];
  imageSpacers = [];
  toolName;
  toolCallId;
  args;
  expanded = false;
  showImages;
  isPartial = true;
  toolDefinition;
  builtInToolDefinition;
  ui;
  cwd;
  executionStarted = false;
  argsComplete = false;
  result;
  convertedImages = new Map();
  hideComponent = false;
  constructor(toolName, toolCallId, args, options = {}, toolDefinition, ui, cwd = process.cwd()) {
    super();
    this.toolName = toolName;
    this.toolCallId = toolCallId;
    this.args = args;
    this.toolDefinition = toolDefinition;
    this.builtInToolDefinition = _index.allToolDefinitions[toolName];
    this.showImages = options.showImages ?? true;
    this.ui = ui;
    this.cwd = cwd;
    this.addChild(new _piTui.Spacer(1));
    // Always create both. contentBox is used for tools with renderer-based call/result composition.
    // contentText is reserved for generic fallback rendering when no tool definition exists.
    this.contentBox = new _piTui.Box(1, 1, (text) => _theme.theme.bg("toolPendingBg", text));
    this.contentText = new _piTui.Text("", 1, 1, (text) => _theme.theme.bg("toolPendingBg", text));
    if (this.hasRendererDefinition()) {
      this.addChild(this.contentBox);
    } else
    {
      this.addChild(this.contentText);
    }
    this.updateDisplay();
  }
  getCallRenderer() {
    if (!this.builtInToolDefinition) {
      return this.toolDefinition?.renderCall;
    }
    if (!this.toolDefinition) {
      return this.builtInToolDefinition.renderCall;
    }
    return this.toolDefinition.renderCall ?? this.builtInToolDefinition.renderCall;
  }
  getResultRenderer() {
    if (!this.builtInToolDefinition) {
      return this.toolDefinition?.renderResult;
    }
    if (!this.toolDefinition) {
      return this.builtInToolDefinition.renderResult;
    }
    return this.toolDefinition.renderResult ?? this.builtInToolDefinition.renderResult;
  }
  hasRendererDefinition() {
    return this.builtInToolDefinition !== undefined || this.toolDefinition !== undefined;
  }
  getRenderContext(lastComponent) {
    return {
      args: this.args,
      toolCallId: this.toolCallId,
      invalidate: () => {
        this.invalidate();
        this.ui.requestRender();
      },
      lastComponent,
      state: this.rendererState,
      cwd: this.cwd,
      executionStarted: this.executionStarted,
      argsComplete: this.argsComplete,
      isPartial: this.isPartial,
      expanded: this.expanded,
      showImages: this.showImages,
      isError: this.result?.isError ?? false
    };
  }
  createCallFallback() {
    return new _piTui.Text(_theme.theme.fg("toolTitle", _theme.theme.bold(this.toolName)), 0, 0);
  }
  createResultFallback() {
    const output = this.getTextOutput();
    if (!output) {
      return undefined;
    }
    return new _piTui.Text(_theme.theme.fg("toolOutput", output), 0, 0);
  }
  updateArgs(args) {
    this.args = args;
    this.updateDisplay();
  }
  markExecutionStarted() {
    this.executionStarted = true;
    this.updateDisplay();
    this.ui.requestRender();
  }
  setArgsComplete() {
    this.argsComplete = true;
    this.updateDisplay();
    this.ui.requestRender();
  }
  updateResult(result, isPartial = false) {
    this.result = result;
    this.isPartial = isPartial;
    this.updateDisplay();
    this.maybeConvertImagesForKitty();
  }
  maybeConvertImagesForKitty() {
    const caps = (0, _piTui.getCapabilities)();
    if (caps.images !== "kitty")
    return;
    if (!this.result)
    return;
    const imageBlocks = this.result.content.filter((c) => c.type === "image");
    for (let i = 0; i < imageBlocks.length; i++) {
      const img = imageBlocks[i];
      if (!img.data || !img.mimeType)
      continue;
      if (img.mimeType === "image/png")
      continue;
      if (this.convertedImages.has(i))
      continue;
      const index = i;
      (0, _imageConvert.convertToPng)(img.data, img.mimeType).then((converted) => {
        if (converted) {
          this.convertedImages.set(index, converted);
          this.updateDisplay();
          this.ui.requestRender();
        }
      });
    }
  }
  setExpanded(expanded) {
    this.expanded = expanded;
    this.updateDisplay();
  }
  setShowImages(show) {
    this.showImages = show;
    this.updateDisplay();
  }
  invalidate() {
    super.invalidate();
    this.updateDisplay();
  }
  render(width) {
    if (this.hideComponent) {
      return [];
    }
    return super.render(width);
  }
  updateDisplay() {
    const bgFn = this.isPartial ?
    (text) => _theme.theme.bg("toolPendingBg", text) :
    this.result?.isError ?
    (text) => _theme.theme.bg("toolErrorBg", text) :
    (text) => _theme.theme.bg("toolSuccessBg", text);
    let hasContent = false;
    this.hideComponent = false;
    if (this.hasRendererDefinition()) {
      this.contentBox.setBgFn(bgFn);
      this.contentBox.clear();
      const callRenderer = this.getCallRenderer();
      if (!callRenderer) {
        this.contentBox.addChild(this.createCallFallback());
        hasContent = true;
      } else
      {
        try {
          const component = callRenderer(this.args, _theme.theme, this.getRenderContext(this.callRendererComponent));
          this.callRendererComponent = component;
          this.contentBox.addChild(component);
          hasContent = true;
        }
        catch {
          this.callRendererComponent = undefined;
          this.contentBox.addChild(this.createCallFallback());
          hasContent = true;
        }
      }
      if (this.result) {
        const resultRenderer = this.getResultRenderer();
        if (!resultRenderer) {
          const component = this.createResultFallback();
          if (component) {
            this.contentBox.addChild(component);
            hasContent = true;
          }
        } else
        {
          try {
            const component = resultRenderer({ content: this.result.content, details: this.result.details }, { expanded: this.expanded, isPartial: this.isPartial }, _theme.theme, this.getRenderContext(this.resultRendererComponent));
            this.resultRendererComponent = component;
            this.contentBox.addChild(component);
            hasContent = true;
          }
          catch {
            this.resultRendererComponent = undefined;
            const component = this.createResultFallback();
            if (component) {
              this.contentBox.addChild(component);
              hasContent = true;
            }
          }
        }
      }
    } else
    {
      this.contentText.setCustomBgFn(bgFn);
      this.contentText.setText(this.formatToolExecution());
      hasContent = true;
    }
    for (const img of this.imageComponents) {
      this.removeChild(img);
    }
    this.imageComponents = [];
    for (const spacer of this.imageSpacers) {
      this.removeChild(spacer);
    }
    this.imageSpacers = [];
    if (this.result) {
      const imageBlocks = this.result.content.filter((c) => c.type === "image");
      const caps = (0, _piTui.getCapabilities)();
      for (let i = 0; i < imageBlocks.length; i++) {
        const img = imageBlocks[i];
        if (caps.images && this.showImages && img.data && img.mimeType) {
          const converted = this.convertedImages.get(i);
          const imageData = converted?.data ?? img.data;
          const imageMimeType = converted?.mimeType ?? img.mimeType;
          if (caps.images === "kitty" && imageMimeType !== "image/png")
          continue;
          const spacer = new _piTui.Spacer(1);
          this.addChild(spacer);
          this.imageSpacers.push(spacer);
          const imageComponent = new _piTui.Image(imageData, imageMimeType, { fallbackColor: (s) => _theme.theme.fg("toolOutput", s) }, { maxWidthCells: 60 });
          this.imageComponents.push(imageComponent);
          this.addChild(imageComponent);
        }
      }
    }
    if (this.hasRendererDefinition() && !hasContent && this.imageComponents.length === 0) {
      this.hideComponent = true;
    }
  }
  getTextOutput() {
    return (0, _renderUtils.getTextOutput)(this.result, this.showImages);
  }
  formatToolExecution() {
    let text = _theme.theme.fg("toolTitle", _theme.theme.bold(this.toolName));
    const content = JSON.stringify(this.args, null, 2);
    if (content) {
      text += `\n\n${content}`;
    }
    const output = this.getTextOutput();
    if (output) {
      text += `\n${output}`;
    }
    return text;
  }
}exports.ToolExecutionComponent = ToolExecutionComponent; /* v9-841239ccd7acea67 */
