/**
 * MV3 service worker — extension lifecycle and message forwarding only.
 * Does not inspect DOM, detect products, or assemble Reports.
 */
import { createExtensionRuntime } from "./extension-runtime.js";
import {
  createMessageRouter,
  ExtensionCommand,
} from "./message-router.js";

const extensionRuntime = createExtensionRuntime();
const router = createMessageRouter(extensionRuntime);

chrome.runtime.onInstalled.addListener(() => {
  void router.initialize().catch(() => {
    // Non-blocking startup; commands retry initialization.
  });
});

chrome.runtime.onMessage.addListener((_message, _sender, sendResponse) => {
  void router.handle(_message).then((response) => {
    sendResponse(response);
  });
  return true;
});

chrome.action.onClicked.addListener(() => {
  void router
    .handle({ command: ExtensionCommand.START_INVESTIGATION })
    .catch(() => undefined);
});
