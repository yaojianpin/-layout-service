# @layout/service
Simply create service api calling actions from JSON config

## Installation
### NPM

```bash
npm install @layout/service
# or
yarn add @layout/service
```


```js
import Service from '@layout/service'

const service = Service.create(
  {
    response: {
      code: "number",
      data: "object"
    },
    modules: [{
      name: "test",
      baseUrl: "/api/test",
      actions: [
        {
          route: "/list",
          name: "getList",
          method: "get",
          params: ["a", "b"]
        },
        {
          route: "/{id}",
          name: "getInfo",
          method: "get",
          params: ["id"]
        },
        {
          route: "/{id}",
          name: "updateInfo",
          method: "put",
          params: ["id"]
        },
        {
          route: "",
          name: "createInfo",
          method: "post",
          params: ["a", "b"]
        }]
    }]
  }
]);

await service.test.getList({ a: 1, b: 1 });
await service.test.getInfo({ id: 1 });
await service.test.createInfo({ a: 1, b: 1 });
await service.test.putInfo({ id: 1, a: 1, b: 1 });

```