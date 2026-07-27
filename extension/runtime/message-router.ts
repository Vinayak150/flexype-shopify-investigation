/**
 * Typed extension command boundary — validates and routes Chrome messages.
 * Forwards to ExtensionRuntime; no Detection/Evidence/Reporting decisions.
 */
import type { ExtensionRuntime } from "./extension-runtime.js";

export const ExtensionCommand = {
  START_INVESTIGATION: "START_INVESTIGATION",
  GET_STATUS: "GET_STATUS",
  GET_PRESENTATION_VIEW: "GET_PRESENTATION_VIEW",
} as const;

export type ExtensionCommand =
  (typeof ExtensionCommand)[keyof typeof ExtensionCommand];

export interface ExtensionMessage {
  readonly command: ExtensionCommand;
}

export type ExtensionResponse =
  | {
      readonly ok: true;
      readonly command: ExtensionCommand;
      readonly payload: unknown;
    }
  | {
      readonly ok: false;
      readonly command?: ExtensionCommand;
      readonly error: string;
    };

export function isExtensionMessage(value: unknown): value is ExtensionMessage {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const command = (value as ExtensionMessage).command;
  return (
    command === ExtensionCommand.START_INVESTIGATION ||
    command === ExtensionCommand.GET_STATUS ||
    command === ExtensionCommand.GET_PRESENTATION_VIEW
  );
}

export class MessageRouter {
  constructor(private readonly runtime: ExtensionRuntime) {}

  async initialize(): Promise<void> {
    await this.runtime.initialize();
  }

  async handle(message: unknown): Promise<ExtensionResponse> {
    if (!isExtensionMessage(message)) {
      return Object.freeze({
        ok: false,
        error: "Invalid extension message shape",
      });
    }

    try {
      switch (message.command) {
        case ExtensionCommand.START_INVESTIGATION: {
          await this.runtime.initialize();
          const payload = await this.runtime.startInvestigation();
          return Object.freeze({
            ok: true,
            command: message.command,
            payload,
          });
        }
        case ExtensionCommand.GET_STATUS: {
          await this.runtime.initialize();
          const payload = this.runtime.getStatus();
          return Object.freeze({
            ok: true,
            command: message.command,
            payload,
          });
        }
        case ExtensionCommand.GET_PRESENTATION_VIEW: {
          await this.runtime.initialize();
          const payload = this.runtime.getPresentationView();
          return Object.freeze({
            ok: true,
            command: message.command,
            payload,
          });
        }
        default: {
          const _exhaustive: never = message.command;
          return Object.freeze({
            ok: false,
            command: message.command,
            error: `Unhandled command: ${String(_exhaustive)}`,
          });
        }
      }
    } catch (error) {
      return Object.freeze({
        ok: false,
        command: message.command,
        error: error instanceof Error ? error.message : "Extension command failed",
      });
    }
  }
}

export function createMessageRouter(runtime: ExtensionRuntime): MessageRouter {
  return new MessageRouter(runtime);
}
