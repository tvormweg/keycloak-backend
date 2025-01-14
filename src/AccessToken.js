'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const qs = require('querystring');

class AccessToken {
  constructor(cfg, request) {
    this.config = cfg;
    this.request = request;
  }

  info(accessToken) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const response = yield _this.request.get(`/auth/realms/${_this.config.realm}/protocol/openid-connect/userinfo`, {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      });

      return response.data;
    })();
  }

  refresh(refreshToken) {
    const cfg = this.config;

    return this.request.post(`/auth/realms/${cfg.realm}/protocol/openid-connect/token`, qs.stringify({
      grant_type: 'refresh_token',
      client_id: cfg.client_id,
      client_secret: cfg.client_secret,
      refresh_token: refreshToken
    }));
  }

  get() {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const cfg = _this2.config;

      if (!_this2.data) {
        const response = yield _this2.request.post(`/auth/realms/${cfg.realm}/protocol/openid-connect/token`, qs.stringify({
          grant_type: 'password',
          username: cfg.username,
          password: cfg.password,
          client_id: cfg.client_id,
          client_secret: cfg.client_secret
        }));
        _this2.data = response.data;

        return _this2.data.access_token;
      } else {
        try {
          yield _this2.info(_this2.data.access_token);

          return _this2.data.access_token;
        } catch (err) {
          try {
            const response = yield _this2.refresh(_this2.data.refresh_token);
            _this2.data = response.data;

            return _this2.data.access_token;
          } catch (err) {
            delete _this2.data;

            return _this2.get();
          }
        }
      }
    })();
  }
}

module.exports = AccessToken;