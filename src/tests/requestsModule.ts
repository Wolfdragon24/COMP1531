// Imports
import request from 'sync-request';
import { Options } from 'sync-request';

// Type Definitions
export type GenericReqOutput = {
  data: Record<string, any>,
  code: number
  headers: Record<string, any>
};

// Request wrapper class
export class Requests {
  get(url: string, data: Options): GenericReqOutput {
    const res = request(
      'GET',
      url,
      data
    );

    return {
      data: JSON.parse(res.body as string),
      code: res.statusCode,
      headers: res.headers
    };
  }

  post(url: string, data: Options): GenericReqOutput {
    const res = request(
      'POST',
      url,
      data
    );

    return {
      data: JSON.parse(res.body as string),
      code: res.statusCode,
      headers: res.headers
    };
  }

  put(url: string, data: Options): GenericReqOutput {
    const res = request(
      'PUT',
      url,
      data
    );

    return {
      data: JSON.parse(res.body as string),
      code: res.statusCode,
      headers: res.headers
    };
  }

  delete(url: string, data: Options): GenericReqOutput {
    const res = request(
      'DELETE',
      url,
      data
    );

    return {
      data: JSON.parse(res.body as string),
      code: res.statusCode,
      headers: res.headers
    };
  }
}
