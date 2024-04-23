const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

const checkAuthUser = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, 'xanhduong');
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };
    next();
  } catch (err) {
    console.log('auth', err)
    const error = new HttpError('Authentication failed!', 401);
    return next(error);
  }
};

const checkAuthAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, 'xanhduong');
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };

    const isAdmin = req.userData.role === 'AD';
    if (!isAdmin) throw '';
    next();
  } catch (err) {
    const error = new HttpError('Authentication admin failed!', 401);
    return next(error);
  }
};

const decodeToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    const decodedToken = jwt.verify(token, 'xanhduong');
    req.userData = { userId: decodedToken.userId, role: decodedToken.role };
    next();
  } catch (err) {
    next();
  }
}

module.exports = { checkAuthUser, checkAuthAdmin, decodeToken }