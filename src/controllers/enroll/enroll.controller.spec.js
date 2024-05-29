import MockExpressResponse from 'mock-express-response';
import { allUsers } from './user.controller';

import { successResponse } from '../../helpers';

import { User } from '../../models';
// mock success and error function mock
jest.mock('./../../helpers');

// extress response object for (req, res) function
const res = new MockExpressResponse();

describe('User controller', () => {
});
