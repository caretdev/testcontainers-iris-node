testcontainers-iris-node
===

Install
---

```shell
npm install testcontainers-iris --save-dev
```

Usage
---


```typescript
import { IRISContainer } from "testcontainers-iris";
import { createConnection } from "@intersystems/intersystems-iris-native";

const IMAGE = "containers.intersystems.com/intersystems/iris-community:latest-preview";
const container = await new IRISContainer(IMAGE).start();
const connection = createConnection(container.getConnectionOptions());
const iris = connection.createIris();
const version = iris.classMethodString("%SYSTEM.Version", "GetNumber");

```