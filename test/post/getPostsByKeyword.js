import chai from 'chai';
import mocha from 'mocha';
import '../../app';
import axios from 'axios';
import User from '../../src/models/user';
import Post from '../../src/models/post';
import { signJwt } from '../../src/utils/jwtUtil';
import { buildAuthorizationHeader } from '../common/utils/testUtil';
import { generateUser } from '../common/factories/userFactory';
import { generatePost } from '../common/factories/postFactory';
import errorCodes from '../../src/constants/errorCodes';
import endpoints from '../../src/constants/endpoints';

const { POSTS } = endpoints;

const { before, after } = mocha;
const { describe, it } = mocha;
const { assert } = chai;

const { POST_NOT_EXISTS } = errorCodes;

// let existingPost;
let existingUser;
let existingUserToken;

const { BASE_URL } = process.env;
const instance = axios.create({
  baseURL: BASE_URL,
});

const path = (keyword) => `${POSTS}/keyword/${keyword}`;

describe('Post Controller', () => {
  before(async () => {
    await User.remove({});
    existingUser = await generateUser();
    existingUserToken = signJwt(existingUser);
  });

  describe(`GET ${POSTS}/keyword/:keyword`, () => {
    before(async () => {
      await generatePost({
        title: 'fakeTitle',
        body: 'comentario positivo',
      });
    });

    it('Should return unauthorized as no header is sent', async () => {
      try {
        await instance.get(path('positivo'));
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 401);
      }
    });

    it('Should return bad request as keyword not found', async () => {
      try {
        await instance.get(
          path('negativo'),
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 404);
        assert.equal(err.response.data.message, POST_NOT_EXISTS);
      }
    });

    it('Should return posts filtered by "fakeTitle"', async () => {
      const response = await instance.get(
        path('fakeTitle'),
        buildAuthorizationHeader(existingUserToken),
      );

      assert.equal(response.status, 200);
      assert.equal(response.data.length, 1);
    });

    it('Should return posts filtered by "positivo"', async () => {
      const response = await instance.get(
        path('positivo'),
        buildAuthorizationHeader(existingUserToken),
      );

      assert.equal(response.status, 200);
      assert.equal(response.data.length, 1);
    });

    after(async () => {
      await Post.remove({});
    });
  });

  after(async () => {
    await User.remove({});
    await Post.remove({});
  });
});
