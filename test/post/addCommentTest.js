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
import { generatePost, generateComment } from '../common/factories/postFactory';
import errorCodes from '../../src/constants/errorCodes';
import endpoints from '../../src/constants/endpoints';

const { POSTS } = endpoints;

const { before, after } = mocha;
const { describe, it } = mocha;
const { assert } = chai;

const {
  POST_NOT_EXISTS,
  USER_NOT_EXISTS,
  POST_AUTHOR_INVALID,
  POST_COMMENT_INVALID,
} = errorCodes;

let existingPost;
let existingUser;
let existingUserToken;

const { BASE_URL } = process.env;
const instance = axios.create({
  baseURL: BASE_URL,
});

const path = (idPost) => `${POSTS}/add-comment/${idPost}`;

describe('Post Controller', () => {
  before(async () => {
    await User.remove({});
    existingUser = await generateUser();
    existingUserToken = signJwt(existingUser);
  });

  describe(`POST ${POSTS}/add-comment/:id`, () => {
    before(async () => {
      existingPost = await generatePost({ author: existingUser._id });
    });

    it('Should return unauthorized as no header is sent', async () => {
      try {
        await instance.post(path(existingPost._id));
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 401);
      }
    });

    it('Should return bad request as post does not exist', async () => {
      try {
        await instance.post(
          path(mongoose.Types.ObjectId()),
          {},
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.equal(err.response.data.errors[0].msg, POST_NOT_EXISTS);
      }
    });

    it('Should return bad request as author not found', async () => {
      try {
        const comment = generateComment();
        await instance.post(
          path(existingPost._id),
          comment,
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.equal(err.response.data.errors[0].msg, USER_NOT_EXISTS);
      }
    });

    it('Should return bad request as author is invalid', async () => {
      try {
        const comment = generateComment({ author: 5 });
        await instance.post(
          path(existingPost._id),
          comment,
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.equal(err.response.data.errors[0].msg, POST_AUTHOR_INVALID);
      }
    });

    it('Should return bad request as content is invalid', async () => {
      try {
        const comment = generateComment({ content: 5 });
        await instance.post(
          path(existingPost._id),
          comment,
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.equal(err.response.data.errors[0].msg, POST_COMMENT_INVALID);
      }
    });

    it('Should add comment to post and return post id and author id ', async () => {
      const comment = generateComment({ author: existingUser._id });
      const response = await instance.post(
        path(existingPost._id),
        comment,
        buildAuthorizationHeader(existingUserToken),
      );

      assert.equal(response.status, 200);
      assert.equal(response.data.idPost, existingPost._id);
      assert.equal(response.data.authorOfComment, existingUser._id);
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
