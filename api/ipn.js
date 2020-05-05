'use strict';

module.exports = ({ db }) => async function ipn(params) {
  return { ok: 1 };
};