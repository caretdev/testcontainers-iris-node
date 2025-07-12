import {
  AbstractStartedContainer,
  GenericContainer,
  StartedTestContainer,
  InspectResult,
  Wait,
} from "testcontainers";

const IRIS_PORT = 1972;

export class IRISContainer extends GenericContainer {
  private namespace = "USER";
  private username = "test";
  private password = "test";

  constructor(
    image: string = "containers.intersystems.com/intersystems/iris-community:latest-em"
  ) {
    super(image);
    this.withExposedPorts(IRIS_PORT);
    this.withWaitStrategy(
      Wait.forAll([
        Wait.forLogMessage("Enabling logons"),
        Wait.forListeningPorts(),
      ])
    );
    this.withCommand([
      "--after",
      `iris session iris -U%SYS '##class(Security.Users).UnExpireUserPasswords("*")'`,
    ])
    this.withStartupTimeout(120_000);
    this.withResourcesQuota({ cpu: 8, memory: 4 * 1024 * 1024 * 1024 });
  }

  public withNamespace(namespace: string): this {
    this.namespace = namespace;
    return this;
  }

  public withUsername(username: string): this {
    this.username = username;
    return this;
  }

  public withPassword(password: string): this {
    this.password = password;
    return this;
  }

  public withLicenseKey(licenseKey: string): this {
    console.log(`Using license key: ${licenseKey}`);
    this.withBindMounts([{
      source: licenseKey,
      target: "/usr/irissys/mgr/iris.key",
      mode: "ro",
    }])
    return this;
  }

  protected override async containerCreated(
    containerId: string
  ): Promise<void> {
    return Promise.resolve();
  }

  protected override async containerStarted?(
    container: StartedTestContainer,
    inspectResult: InspectResult,
    reused: boolean
  ): Promise<void> {
    await container.exec([
      "iris",
      "session",
      "iris",
      "-U",
      "%SYS",
      `##class(Security.Users).Create("${this.username}","%ALL","${this.password}")`,
    ]);
    if (this.namespace !== "USER") {
      await container.exec([
        "iris",
        "session",
        "iris",
        "-U",
        "%SYS",
        `##class(%SQL.Statement).%ExecDirect(,"CREATE DATABASE ${this.namespace}")`,
      ]);
    }
    return Promise.resolve();
  }

  public override async start(): Promise<StartedIRISContainer> {
    this.withEnvironment({
      IRIS_DB: this.namespace,
      IRIS_USER: this.username,
      IRIS_PASSWORD: this.password,
    });
    return new StartedIRISContainer(
      await super.start(),
      this.namespace,
      this.username,
      this.password
    );
  }
}

export class StartedIRISContainer extends AbstractStartedContainer {
  constructor(
    startedTestContainer: StartedTestContainer,
    private readonly namespace: string,
    private readonly username: string,
    private readonly password: string
  ) {
    super(startedTestContainer);
  }

  public getPort(): number {
    return super.getMappedPort(IRIS_PORT);
  }

  public getNamespace(): string {
    return this.namespace;
  }

  public getUsername(): string {
    return this.username;
  }

  public getPassword(): string {
    return this.password;
  }

  /**
   * @returns A connection URI in the form of `iris://[username[:password]@][host[:port],]/namespace`
   */
  public getConnectionUri(): string {
    const url = new URL("", "iris://");
    url.hostname = this.getHost();
    url.port = this.getPort().toString();
    url.pathname = this.getNamespace();
    url.username = this.getUsername();
    url.password = this.getPassword();
    return url.toString();
  }

  public getConnectionOptions(): {
    host: string;
    port: number;
    ns: string;
    user: string;
    pwd: string;
    sharedmemory: boolean;
  } {
    return {
      host: this.getHost(),
      port: this.getPort(),
      ns: this.getNamespace(),
      user: this.getUsername(),
      pwd: this.getPassword(),
      sharedmemory: false,
    };
  }
}
