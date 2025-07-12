import { assert, describe, it } from "vitest";
import { createConnection } from "@intersystems/intersystems-iris-native";
import { IRISContainer, StartedIRISContainer } from "./iris-container";
const os = require("os");
const path = require("path");

const namespace = "TEST";
const username = "test";
const password = "test";

function testConnection(container: StartedIRISContainer) {
  const connection = createConnection(container.getConnectionOptions());
  const iris = connection.createIris();
  const ns = iris.classMethodString("%SYSTEM.Process", "NameSpace");
  assert.equal(ns, namespace, "Namespace should match");
}

describe("IRISContainer", () => {
  it("community version preview", async () => {
    const container = new IRISContainer(
      "containers.intersystems.com/intersystems/iris-community:latest-preview"
    )
      .withNamespace(namespace)
      .withUsername(username)
      .withPassword(password);

    const startedContainer = await container.start();
    testConnection(startedContainer);
  });

  it("dccommunity version", async () => {
    const container = new IRISContainer("intersystemsdc/iris-community:latest")
      .withNamespace(namespace)
      .withUsername(username)
      .withPassword(password);
    const startedContainer = await container.start();
    testConnection(startedContainer);
  });

  it("enterprise version", async () => {
    const licenseKey = path.join(os.homedir(), "iris.key");
    const container = new IRISContainer(
      "containers.intersystems.com/intersystems/iris:latest-em"
    )
      .withNamespace(namespace)
      .withUsername(username)
      .withPassword(password)
      .withLicenseKey(licenseKey);
    const startedContainer = await container.start();
    testConnection(startedContainer);
  });
});
