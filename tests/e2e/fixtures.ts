import {
  createMemoryConfigurationRetriever,
  type ConfigurationElection,
  type ConfigurationRetriever,
} from "../../src/configuration/index.js";
import {
  createMemoryBrowserPorts,
  createMemoryDomPorts,
  type BrowserDiscoveryPorts,
  type DomDiscoveryPorts,
} from "../../src/observation/index.js";
import {
  createSystemRuntime,
  type IntegratedInvestigationResult,
  type SystemRuntime,
  type SystemRuntimeOptions,
} from "../../extension/index.js";

export const E2E_STOREFRONT_URL = "https://e2e-demo.myshopify.com";

export function createPartialDiscoveryPorts(): {
  readonly browser: BrowserDiscoveryPorts;
  readonly dom: DomDiscoveryPorts;
} {
  return {
    browser: createMemoryBrowserPorts({
      documentReachable: false,
      metadataReachable: false,
    }),
    dom: createMemoryDomPorts({
      traversalCapable: false,
      queryCapable: false,
    }),
  };
}

export function createUnavailableConfigurationRetriever(): ConfigurationRetriever {
  return createMemoryConfigurationRetriever({
    failWith: "E-012 configuration source unavailable",
  });
}

export async function runE2E(
  options: SystemRuntimeOptions = {},
  storefrontUrl = E2E_STOREFRONT_URL,
): Promise<{
  readonly runtime: SystemRuntime;
  readonly result: IntegratedInvestigationResult;
}> {
  const runtime = createSystemRuntime();
  runtime.startup(options);
  const result = await runtime.runInvestigation(storefrontUrl, {
    kind: "OperatorIntent",
    label: "e2e-operator",
  });
  return { runtime, result };
}

export async function runCorePathE2E(): Promise<{
  readonly runtime: SystemRuntime;
  readonly result: IntegratedInvestigationResult;
}> {
  return runE2E({
    configurationElection: "deferred" satisfies ConfigurationElection,
    enableTraceability: true,
  });
}

export async function runPartialPathE2E(): Promise<{
  readonly runtime: SystemRuntime;
  readonly result: IntegratedInvestigationResult;
}> {
  const ports = createPartialDiscoveryPorts();
  return runE2E({
    browser: ports.browser,
    dom: ports.dom,
    configurationElection: "deferred",
    enableTraceability: true,
  });
}
