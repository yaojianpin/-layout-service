import axios, { AxiosInstance, Method } from "axios";

interface Action {
  route: string;
  name: string;
  method: Method;
  params?: Array<string>;
  url?: string;
}

export interface ControllerConfigModule {
  baseUrl: string;
  name: string;
  actions: Array<Action>;
}
export interface ControllerConfig {
  modules: Array<ControllerConfigModule>;
}

interface ActionMap {
  [name: string]: any;
}

interface IService {
  //invoke(params: any): Promise<any>;
  [name: string]: any;
}

class Service implements IService {
  static _instance: Service;

  _onError: (e: Error) => void = (_) => _;
  api: AxiosInstance;
  actions: ActionMap = {};
  [name: string]: any;

  constructor(private config: ControllerConfig) {
    this.api = axios.create();

    const { modules = [] } = this.config;
    for (let module of modules) {
      this.actions[module.name] = {};
      this[module.name] = {};
      for (let action of module.actions) {
        action.url = `${module.baseUrl}${action.route}`;

        this.actions[module.name][action.name] = action;

        // binding index function to invoke
        this[module.name][action.name] = this.invoke.bind(
          this,
          module.name,
          action.name
        );
        console.log("serivce.action", action.name, action.method, action.url);
      }
    }
  }
  public static create(config: ControllerConfig): Service {
    console.log("service.create", config);
    let instance = new Service(config);
    Service._instance = instance;
    return instance;
  }

  public onError(cb: (e: Error) => void) {
    this._onError = cb;
    return Service._instance;
  }

  private invoke(module: string, name: string, params?: any): Promise<any> {
    console.log("service.invoke", module, name, params);
    let action: Action = this.actions[module][name];
    if (!action) throw new Error(`not found action "${name}"`);

    // check url
    if (!action.url) throw new Error(`not found url for "${name}"`);

    // check params
    if (params && action.params) {
      for (let p of action.params) {
        if (!params[p]) {
          throw new Error(
            `not found param "${p}" in ${JSON.stringify(params)}`
          );
        }
      }
    }
    // replace url with params pattern
    let url = action.url.replace(/\{([^\}]+)\}/g, (v, key) => {
      if (!params[key]) throw new Error(`not found params "${key}"`);
      return params[key];
    });
    return this.api
      .request({
        url: url,
        method: action.method,
        params: params
      })
      .then((resp) => {
        return resp.data;
      })
      .catch((e) => {
        if (this._onError) {
          this._onError(e);
        } else {
          throw e;
        }
      });
  }
}

export const version = __VERSION__;
export default Service;
