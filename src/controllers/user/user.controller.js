import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';
import { User } from '../../models';
import { successResponse, errorResponse, uniqueId } from '../../helpers';
const { Op } = require("sequelize");

export const allUsers = async (req, res) => {
  try {
    const page = req.params.page || 1;
    const limit = 2;
    const users = await User.findAndCountAll({
      order: [['createdAt', 'DESC'], ['firstName', 'ASC']],
      offset: (page - 1) * limit,
      limit,
    });
    return successResponse(req, res, { users });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const register = async (req, res) => {
  try {
    const {
      email, password, firstName, lastName, mobile
    } = req.body;
    if (!mobile && !email) {
      throw new Error('Mobile or email required');
    }
    if (process.env.IS_GOOGLE_AUTH_ENABLE === 'true') {
      if (!req.body.code) {
        throw new Error('code must be defined');
      }
      const { code } = req.body;
      const customUrl = `${process.env.GOOGLE_CAPTCHA_URL}?secret=${process.env.GOOGLE_CAPTCHA_SECRET_SERVER
        }&response=${code}`;
      const response = await axios({
        method: 'post',
        url: customUrl,
        data: {
          secret: process.env.GOOGLE_CAPTCHA_SECRET_SERVER,
          response: code,
        },
        config: { headers: { 'Content-Type': 'multipart/form-data' } },
      });
      if (!(response && response.data && response.data.success === true)) {
        throw new Error('Google captcha is not valid');
      }
    }

    const params = [];
    if (email) {
      params.push({
        email: email
      });
    }

    if (mobile) {
      params.push({
        mobile: mobile
      });
    }

    const user = await User.scope('withSecretColumns').findOne({
      where: {
        [Op.or]: params
      },
    });
    if (user) {
      throw new Error('User already exists with same email');
    }
    const reqPass = crypto
      .createHash('md5')
      .update(password)
      .digest('hex');
    const payload = {
      email,
      mobile,
      firstName,
      lastName,
      password: reqPass,
      isVerified: false,
      verifyToken: uniqueId(),
    };

    const newUser = await User.create(payload);
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const login = async (req, res) => {
  const {
    email, password, mobile
  } = req.body;
  const params = [];
    if (email) {
      params.push({
        email: email
      });
    }

    if (mobile) {
      params.push({
        mobile: mobile
      });
    }
  try {
    console.log("params",params);
    const users = await User.scope('withSecretColumns').findAll({
      where: {
        [Op.or]: params
      },
    });
    if (!users || users.length < 1) {
      throw new Error('Incorrect Email/Mobile');
    }
    const user = users[0];
    const reqPass = crypto
      .createHash('md5')
      .update(password || '')
      .digest('hex');
    if (reqPass !== user.password) {
      throw new Error('Incorrect Account Password');
    }
    const token = jwt.sign(
      {
        user: {
          userId: user.id,
          email: user.email,
          createdAt: new Date(),
        },
      },
      process.env.SECRET,
    );
    delete user.dataValues.password;
    return successResponse(req, res, { user, token });
  } catch (error) {
    console.log("EXE",error);
    return errorResponse(req, res, error.message);
  }
};

export const profile = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findOne({ where: { id: userId } });
    return successResponse(req, res, { user });
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.scope('withSecretColumns').findOne({
      where: { id: userId },
    });

    const reqPass = crypto
      .createHash('md5')
      .update(req.body.oldPassword)
      .digest('hex');
    if (reqPass !== user.password) {
      throw new Error('Old password is incorrect');
    }

    const newPass = crypto
      .createHash('md5')
      .update(req.body.newPassword)
      .digest('hex');

    await User.update({ password: newPass }, { where: { id: user.id } });
    return successResponse(req, res, {});
  } catch (error) {
    return errorResponse(req, res, error.message);
  }
};
