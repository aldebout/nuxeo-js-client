'use strict';

import extend from 'extend';
import Base from './base';
import fetch from './deps/fetch';
import join from './deps/utils/join';
import Blob from './blob';
import BatchBlob from './upload/blob';
import BatchUpload from './upload/batch';
import FormData from './deps/form-data';

/**
 * The `Operation` class allows to execute an operation on a Nuxeo Platform instance.
 *
 * **Cannot directly be instantiated**
 *
 * @example
 * var Nuxeo = require('nuxeo')
 * var nuxeo = new Nuxeo({
 *  baseUrl: 'http://localhost:8080/nuxeo',
 *  auth: {
 *    username: 'Administrator',
 *    password: 'Administrator',
 *  }
 * });
 * nuxeo.operation('Document.GetChild')
 *   .input('/default-domain')
 *   .params({
 *     name: 'workspaces',
 *   })
 *   .execute().then((res) => {
       // res.uid !== null
 *     // res.title === 'Workspaces'
 *   }).catch(error => throw new Error(error));
 */
class Operation extends Base {
  /**
   * Creates an Operation.
   * @param {string} opts - The configuration options.
   * @param {string} opts.id - The ID of the operation.
   * @param {string} opts.url - The automation URL.
   */
  constructor(opts = {}) {
    const options = extend(true, {}, opts);
    super(options);
    this._nuxeo = options.nuxeo;
    this._id = options.id;
    this._url = options.url;
    this._automationParams = {
      params: {},
      context: {},
      input: undefined,
    };
  }

  /**
   * Adds an operation param.
   * @param {string} name - The param name.
   * @param {string} value - The param value.
   * @returns {Operation} The operation itself.
   */
  param(name, value) {
    this._automationParams.params[name] = value;
    return this;
  }

  /**
   * Adds operation params. The given params are merged with the existing ones if any.
   * @param {object} params - The params to be merge with the existing ones.
   * @returns {Operation} The operation itself.
   */
  params(params) {
    this._automationParams.params = extend(true, {}, this._automationParams.params, params);
    return this;
  }

  /**
   * Sets this operation context.
   * @param {object} context - The operation context.
   * @returns {Operation} The operation itself.
   */
  context(context) {
    this._automationParams.context = context;
    return this;
  }

  /**
   * Sets this operation input.
   * @param {string|Array|Blob|BatchBlob|BatchUpload} input - The operation input.
   * @returns {Operation} The operation itself.
   */
  input(input) {
    this._automationParams.input = input;
    return this;
  }

  /**
   * Executes this operation.
   * @param {object} opts - Options overriding the ones from the Operation object.
   * @returns {Promise} A Promise object resolved with the result of the Operation.
   */
  execute(opts = {}) {
    const schemas = opts.schemas || this._schemas;

    let headers = extend(true, {}, this._headers);
    if (schemas.length > 0) {
      headers['X-NXDocumentProperties'] = schemas.join(',');
    }
    const repositoryName = opts.repositoryName || this._repositoryName;
    if (repositoryName !== undefined) {
      headers['X-NXRepository'] = repositoryName;
    }
    headers['Content-Type'] = this._computeContentTypeHeader(this._automationParams.input);
    headers = extend(true, headers, opts.headers);

    let finalOptions = {
      headers,
      method: 'POST',
      url: this._computeRequestURL(),
      body: this._computeRequestBody(),
      timeout: this._timeout,
      transactionTimeout: this._transactionTimeout,
      httpTimeout: this._httpTimeout,
      auth: this._auth,
    };
    finalOptions = extend(true, finalOptions, opts);

    return fetch(finalOptions);
  }

  _computeContentTypeHeader(input) {
    let contentType = 'application/json+nxrequest';
    if (this._isMultipartInput(input)) {
      contentType = 'multipart/form-data';
    } else if (this._isBatchInput(input)) {
      contentType = 'application/json';
    }
    return contentType;
  }

  _computeRequestURL() {
    const input = this._automationParams.input;
    if (input instanceof BatchBlob) {
      return join(this._nuxeo._restURL, 'upload', input['upload-batch'], input['upload-fileId'], 'execute', this._id);
    } else if (input instanceof BatchUpload) {
      return join(this._nuxeo._restURL, 'upload', input._batchId, 'execute', this._id);
    }
    return join(this._url, this._id);
  }

  _computeRequestBody() {
    const input = this._automationParams.input;
    if (this._isBatchInput(input)) {
      // no input needed
      const body = extend(true, {}, this._automationParams);
      body.input = undefined;
      return body;
    }

    if (input instanceof Array) {
      if (input.length > 0) {
        const first = input[0];
        if (typeof first === 'string') {
          // assume ref list
          this._automationParams.input = `docs:${input.join(',')}`;
          return this._automationParams;
        } else if (first instanceof Blob) {
          // blob list => multipart
          const automationParams = {
            params: this._automationParams.params,
            context: this._automationParams.context,
          };
          const form = new FormData();
          form.append('params', JSON.stringify(automationParams));

          let inputIndex = 0;
          for (const blob of input) {
            form.append(`input#${inputIndex++}`, blob.content, blob.name);
          }
          return form;
        }
      }
    } else if (this._automationParams.input instanceof Blob) {
      const automationParams = {
        params: this._automationParams.params,
        context: this._automationParams.context,
      };
      const form = new FormData();
      form.append('params', JSON.stringify(automationParams));
      form.append('input', input.content, input.name);
      return form;
    }
    return this._automationParams;
  }

  _isMultipartInput(input) {
    if (input instanceof Array) {
      if (input.length > 0) {
        const first = input[0];
        if (first instanceof Blob) {
          return true;
        }
      }
    } else if (input instanceof Blob) {
      return true;
    }
    return false;
  }

  _isBatchInput(input) {
    return input instanceof BatchUpload || input instanceof BatchBlob;
  }
}

export default Operation;