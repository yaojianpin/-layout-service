import Service from "../";
import chai from "chai";
import sinon from "sinon";

const sandbox = sinon.createSandbox();
describe("service", () => {
  beforeEach(() => {});

  afterEach(function () {
    sandbox.restore();
  });

  it("service api inject", async () => {
    const service = Service.create({
      modules: [
        {
          name: "test",
          baseUrl: "/api/test",
          actions: [
            {
              route: "/list/{a}",
              name: "getList",
              method: "post",
              params: ["a", "b"]
            }
          ]
        }
      ]
    });
    chai.expect(!!service.test.getList).to.be.true;
  });

  it("service call params", async () => {
    const service = Service.create({
      modules: [
        {
          name: "test",
          baseUrl: "/api/test",
          actions: [
            {
              route: "/list",
              name: "getList",
              method: "post",
              params: ["a", "b"]
            }
          ]
        }
      ]
    });

    const mock = sandbox.mock(service.api);
    mock
      .expects("request")
      .withArgs({
        url: "/api/test/list",
        method: "post",
        params: {
          a: 1,
          b: 2
        }
      })
      .returns(new Promise((r) => r({ data: 5 })));

    await service.test.getList({ a: 1, b: 2 });
    mock.verify();
  });

  it("service call url replace", async () => {
    const service = Service.create({
      modules: [
        {
          name: "test",
          baseUrl: "/api/test",
          actions: [
            {
              route: "/list/{a}",
              name: "getList",
              method: "post"
            }
          ]
        }
      ]
    });

    const mock = sandbox.mock(service.api);
    mock
      .expects("request")
      .withArgs({
        url: "/api/test/list/1",
        method: "post",
        params: { a: 1 }
      })
      .returns(new Promise((r) => r({ data: 5 })));

    await service.test.getList({ a: 1 });
    mock.verify();
  });

  it("service call params throw", async () => {
    const service = Service.create({
      modules: [
        {
          name: "test",
          baseUrl: "/api/test",
          actions: [
            {
              route: "/list",
              name: "getList",
              method: "post",
              params: ["a", "b"]
            }
          ]
        }
      ]
    });

    try {
      await service.test.getList({ a: 1 });
      chai.expect(true).to.be.false;
    } catch (e) {
      chai.expect(true).to.be.true;
    }
  });
});
