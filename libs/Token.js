'use strict';

/**
 * Inspired from source: http://www.keycloak.org/keycloak-nodejs-auth-utils/token.js.html
 */
function Token(token) {
    this.token = token;

    var parts = token.split('.');
    this.header = JSON.parse(new Buffer(parts[0], 'base64').toString());
    this.content = JSON.parse(new Buffer(parts[1], 'base64').toString());
    this.signature = new Buffer(parts[2], 'base64');
    this.signed = parts[0] + '.' + parts[1];
}

Token.prototype.isExpired = function () {
    if (this.content.exp * 1000 > Date.now()) {
        return false;
    }
    return true;
};

Token.prototype.hasApplicationRole = function (appName, roleName) {
    var appRoles = this.content.resource_access[appName];

    if (!appRoles) {
        return false;
    }

    return appRoles.roles.indexOf(roleName) >= 0;
};

Token.prototype.getRoles = function() {
    return this.content.realm_access.roles
}

/**
 * @typedef {Object} User
 * @property {string} id - Users uuid
 * @property {string} name - Computed name
 * @property {string} email - email
 * @property {boolean} isAdmin - Is admin
 * @property {string} preferred_username - preferred_username
 * @property {string} first_name - First name
 * @property {string} last_name - Last name
 */

/**
 * @returns {User}
 */
Token.prototype.getUser = function() {
    return {
        id: this.content.sub,
        name: this.content.name || "",
        email: this.content.email || "",
        isAdmin: this.content.realm_access.roles.indexOf("admin") >= 0,
        preferred_username: this.content.preferred_username || "",
        first_name: this.content.given_name,
        last_name: this.content.family_name
    }
}

Token.prototype.hasRealmRole = function (roleName) {
    return this.content.realm_access.roles.indexOf(roleName) >= 0;
};

module.exports = Token;