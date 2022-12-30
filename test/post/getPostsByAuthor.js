import chai from 'chai';
import mocha from 'mocha';
import '../../app';
import axios from 'axios';
import mongoose from 'mongoose';
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

const { USER_NOT_EXISTS } = errorCodes;

let existingPost;
let existingUser;
let existingUserToken;

const { BASE_URL } = process.env;
const instance = axios.create({
  baseURL: BASE_URL,
});

const path = (postId) => `${POSTS}/author/${postId}`;

describe('Post Controller', () => {
  before(async () => {
    await User.remove({});
    existingUser = await generateUser();
    existingUserToken = signJwt(existingUser);
  });

  describe(`GET ${POSTS}/author/:id`, () => {
    before(async () => {
      existingPost = await generatePost({ author: existingUser._id });
    });

    it('Should return unauthorized as no header is sent', async () => {
      try {
        await instance.get(path(existingPost._id));
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 401);
      }
    });

    it('Should return bad request as author not found', async () => {
      try {
        await instance.get(
          path(mongoose.Types.ObjectId()),
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.equal(err.response.data.errors[0].msg, USER_NOT_EXISTS);
      }
    });

    it.only('Should return posts by author successfully', async () => {
      const posts = await instance.get(
        path(existingUser._id),
        buildAuthorizationHeader(existingUserToken),
      );

      assert.equal(posts.status, 200);
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
