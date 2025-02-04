'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const Token = require('./Token');
const jwt = require('jsonwebtoken');

class Jwt {
  constructor(config, request) {
    this.config = config;
    this.request = request;
  }

  verifyOffline(accessToken, cert, options = {}) {
    return new Promise((resolve, reject) => {
      jwt.verify(accessToken, cert, options, (err, payload) => {
        if (err) reject(err);
        resolve(new Token(accessToken));
      });
    });
  }

  decode(accessToken) {
    return new Promise((resolve, reject) => {
      resolve(new Token(accessToken));
    });
  }

  verify(accessToken) {
    var _this = this;

    return _asyncToGenerator(function* () {
      yield _this.request.get(`/auth/realms/${_this.config.realm}/protocol/openid-connect/userinfo`, {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      });

      return new Token(accessToken);
    })();
  }
}

module.exports = Jwt;