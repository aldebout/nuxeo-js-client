'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _workflow = require('./workflow');

var _workflow2 = _interopRequireDefault(_workflow);

var _task = require('./task');

var _task2 = _interopRequireDefault(_task);

var _join = require('../deps/utils/join');

var _join2 = _interopRequireDefault(_join);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WORKFLOW_PATH = 'workflow';
var TASK_PATH = 'task';

/**
 * The `Workflows` class allows to work with workflows on a Nuxeo Platform instance.
 *
 * **Cannot directly be instantiated**
 *
 * @example
 * var Nuxeo = require('nuxeo')
 * var nuxeo = new Nuxeo({
 *  baseUrl: 'http://localhost:8080/nuxeo',
 *  auth: {
 *    method: 'basic',
 *    username: 'Administrator',
 *    password: 'Administrator',
 *  }
 * });
 * nuxeo.workflows()
 *   .start('SerialDocumentReview')
 *   .then(function(res) {
 *     // res['entity-type'] === 'workflow'
 *     // res.workflowModelName === 'SerialDocumentReview'
 *   })
 *   .catch(function(error) {
 *     throw new Error(error);
 *   });
 */

var Workflows = function (_Base) {
  _inherits(Workflows, _Base);

  /**
   * Creates a Workflows object.
   * @param {object} opts - The configuration options.
   * @param {string} opts.nuxeo - The {@link Nuxeo} object linked to this Workflows object.
   */
  function Workflows() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Workflows);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Workflows).call(this, opts));

    _this._nuxeo = opts.nuxeo;
    return _this;
  }

  /**
   * Starts a workflow given a workflow model name.
   * @param {string} workflowModelName - The workflow model name.
   * @param {object} [workflowOpts] - Configuration options for the start of the workflow.
   * @param {Array} [workflowOpts.attachedDocumentIds] - The attached documents id for the workflow.
   * @param {object} [workflowOpts.variables] - The initial variables of the workflow.
   * @param {object} [opts] - Options overriding the ones from this object.
   * @returns {Promise} A promise object resolved with the started `Workflow` object.
   */


  _createClass(Workflows, [{
    key: 'start',
    value: function start(workflowModelName) {
      var _this2 = this;

      var workflowOpts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      opts.body = {
        workflowModelName: workflowModelName,
        'entity-type': 'workflow',
        attachedDocumentIds: workflowOpts.attachedDocumentIds,
        variables: workflowOpts.variables
      };
      var options = this._computeOptions(opts);
      return this._nuxeo.request(WORKFLOW_PATH).post(options).then(function (res) {
        options.nuxeo = _this2._nuxeo;
        return new _workflow2.default(res, options);
      });
    }

    /**
     * Fetches a workflow given a workflow instance id.
     * @param {string} workflowInstanceId - The workflow instance id.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A promise object resolved with the `Workflow` object.
     */

  }, {
    key: 'fetch',
    value: function fetch(workflowInstanceId) {
      var _this3 = this;

      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var options = this._computeOptions(opts);
      var path = (0, _join2.default)(WORKFLOW_PATH, workflowInstanceId);
      return this._nuxeo.request(path).get(options).then(function (res) {
        options.nuxeo = _this3._nuxeo;
        return new _workflow2.default(res, options);
      });
    }

    /**
     * Deletes a workflow instance given a workflow instance id.
     * @param {string} workflowInstanceId - The workflow instance id.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A Promise object resolved with the result of the DELETE request.
     */

  }, {
    key: 'delete',
    value: function _delete(workflowInstanceId) {
      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var options = this._computeOptions(opts);
      var path = (0, _join2.default)(WORKFLOW_PATH, workflowInstanceId);
      return this._nuxeo.request(path).delete(options);
    }

    /**
     * Fetches the workflows started by the current user.
     * @param {string} workflowModelName - The workflow model name.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A promise object resolved with the started workflows.
     */

  }, {
    key: 'fetchStartedWorkflows',
    value: function fetchStartedWorkflows(workflowModelName) {
      var _this4 = this;

      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var options = this._computeOptions(opts);
      return this._nuxeo.request(WORKFLOW_PATH).queryParams({ workflowModelName: workflowModelName }).get(options).then(function (_ref) {
        var entries = _ref.entries;

        options.nuxeo = _this4._nuxeo;
        var workflows = entries.map(function (workflow) {
          return new _workflow2.default(workflow, options);
        });
        return workflows;
      });
    }

    /**
     * Fetches the tasks for a given workflow id and/or workflow model name and/or actor id.
     * @param {object} [tasksOpts] - Configuration options for the tasks fetch.
     * @param {object} [tasksOpts.actorId] - The actor id.
     * @param {object} [tasksOpts.workflowInstanceId] - The workflow id.
     * @param {object} [tasksOpts.workflowModelName] - The workflow model name.
     * @param {object} [opts] - Options overriding the ones from this object.
     * @returns {Promise} A promise object resolved with the tasks.
     */

  }, {
    key: 'fetchTasks',
    value: function fetchTasks() {
      var _this5 = this;

      var tasksOpts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var options = this._computeOptions(opts);
      return this._nuxeo.request(TASK_PATH).queryParams({
        userId: tasksOpts.actorId,
        workflowInstanceId: tasksOpts.workflowInstanceId,
        workflowModelName: tasksOpts.workflowModelName
      }).get(options).then(function (_ref2) {
        var entries = _ref2.entries;

        options.nuxeo = _this5._nuxeo;
        var tasks = entries.map(function (task) {
          return new _task2.default(task, options);
        });
        return tasks;
      });
    }
  }]);

  return Workflows;
}(_base2.default);

exports.default = Workflows;
module.exports = exports['default'];