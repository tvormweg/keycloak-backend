'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class UserManager {
  constructor(config, request, token) {
    this.config = config;
    this.request = request;
    this.token = token;
  }

  details(id) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const response = yield _this.request.get(`/auth/admin/realms/${_this.config.realm}/users/${id}`, {
        headers: {
          Authorization: 'Bearer ' + (yield _this.token.get())
        }
      });

      return response.data;
    })();
  }

  roles(id, clients = [], includeRealmRoles = false) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const promises = [];
      const accessToken = yield _this2.token.get();

      // retrieve roles from each target client
      clients.forEach((() => {
        var _ref = _asyncToGenerator(function* (cid) {
          return promises.push(_this2.request.get(`/auth/admin/realms/${_this2.config.realm}/users/${id}/role-mappings/clients/${cid}/composite`, {
            headers: {
              Authorization: 'Bearer ' + accessToken
            }
          }));
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })());
      // retrieve roles from realm
      if (includeRealmRoles) {
        promises.push(_this2.request.get(`/auth/admin/realms/${_this2.config.realm}/users/${id}/role-mappings/realm/composite`, {
          headers: {
            Authorization: 'Bearer ' + accessToken
          }
        }));
      }

      return (yield Promise.all(promises)).map(function (response) {
        return response.data.map(function (role) {
          return role.name;
        });
      }).reduce(function (arr, names) {
        arr.push(...names);
        return arr;
      }, []);
    })();
  }
}

module.exports = UserManager;