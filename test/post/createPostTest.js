import chai from 'chai';
import mocha from 'mocha';
import '../../app';
import axios from 'axios';
import faker from 'faker';
import mongoose from 'mongoose';
import User from '../../src/models/user';
import Post, {
  TITLE_FIELD_NAME,
  BODY_FIELD_NAME,
  AUTHOR_FIELD_NAME,
} from '../../src/models/post';
import {
  assertHasFieldErrors,
  buildAuthorizationHeader,
} from '../common/utils/testUtil';
import { signJwt } from '../../src/utils/jwtUtil';
import { generateUser } from '../common/factories/userFactory';
import {
  generatePostData,
  generatePostWithInvalidBody,
  generatePostWithoutBody,
  generatePostWithoutInvalidTitle,
  generatePostWithoutTitle,
} from '../common/factories/postFactory';
import errorCodes from '../../src/constants/errorCodes';
import endpoints from '../../src/constants/endpoints';

const { POSTS } = endpoints;

const { before, after } = mocha;
const { describe, it } = mocha;
const { assert } = chai;

const {
  POST_TITLE_INVALID_LENGTH,
  POST_BODY_INVALID_LENGTH,
  POST_USER_LOGGEDIN_DIFFERENT_FROM_THE_AUTHOR,
} = errorCodes;

let existingUser;
let existingUserToken;

const { BASE_URL } = process.env;
const instance = axios.create({
  baseURL: BASE_URL,
});

describe('Post Controller', () => {
  before(async () => {
    await User.remove({});
    existingUser = await generateUser();
    existingUserToken = signJwt(existingUser);
  });

  describe(`POST ${POSTS}`, () => {
    it('Should return unauthorized as no header is sent', async () => {
      try {
        await instance.post(POSTS, {});
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 401);
      }
    });
    it('Should return bad request as body is empty', async () => {
      try {
        await instance.post(
          POSTS,
          {},
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.isNotEmpty(err.response.data.errors);
        assertHasFieldErrors(err, TITLE_FIELD_NAME);
        assertHasFieldErrors(err, BODY_FIELD_NAME);
        assertHasFieldErrors(err, AUTHOR_FIELD_NAME);
      }
    });
    it('Should return bad request as title is empty', async () => {
      try {
        const post = generatePostWithoutTitle({
          author: existingUser._id,
        });
        await instance.post(
          POSTS,
          post,
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.isNotEmpty(err.response.data.errors);
        assertHasFieldErrors(err, TITLE_FIELD_NAME);
      }
    });
    it('Should return bad request as title length is greater than max chars allowed', async () => {
      try {
        const post = generatePostWithoutInvalidTitle({
          author: existingUser._id,
        });

        await instance.post(
          POSTS,
          post,
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.isNotEmpty(err.response.data.errors);
        assertHasFieldErrors(err, TITLE_FIELD_NAME);
        const invalidTitleErr = err.response.data.errors.shift();
        assert.equal(invalidTitleErr.msg, POST_TITLE_INVALID_LENGTH);
      }
    });
    it('Should return bad request as post body is empty', async () => {
      try {
        const post = generatePostWithoutBody({ author: existingUser._id });

        await instance.post(
          POSTS,
          post,
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.isNotEmpty(err.response.data.errors);
        assertHasFieldErrors(err, BODY_FIELD_NAME);
      }
    });
    it('Should return bad request as post body length is greater than max chars allowed', async () => {
      try {
        const post = generatePostWithInvalidBody({ author: existingUser._id });

        await instance.post(
          POSTS,
          post,
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.isNotEmpty(err.response.data.errors);
        assertHasFieldErrors(err, BODY_FIELD_NAME);
        const invalidBodyErr = err.response.data.errors.shift();
        assert.equal(invalidBodyErr.msg, POST_BODY_INVALID_LENGTH);
      }
    });
    it('Should return bad request as author id is invalid', async () => {
      try {
        const post = generatePostData({ author: faker.random.uuid() });

        await instance.post(
          POSTS,
          post,
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.isNotEmpty(err.response.data.errors);
        assertHasFieldErrors(err, AUTHOR_FIELD_NAME);
      }
    });
    it('Should return bad request as author does not exist', async () => {
      try {
        const post = generatePostData({ author: mongoose.Types.ObjectId() });
        await instance.post(
          POSTS,
          post,
          buildAuthorizationHeader(existingUserToken),
        );
        assert.fail();
      } catch (err) {
        assert.equal(err.response.status, 422);
        assert.isNotEmpty(err.response.data.errors);
        assertHasFieldErrors(err, AUTHOR_FIELD_NAME);
        const invalidAuthorErr = err.response.data.errors.shift();
        assert.equal(
          invalidAuthorErr.msg,
          POST_USER_LOGGEDIN_DIFFERENT_FROM_THE_AUTHOR,
        );
      }
    });
    it('Should create a new post successfully', async () => {
      const post = generatePostData({ author: existingUser._id });

      const createdPost = await instance.post(
        POSTS,
        post,
        buildAuthorizationHeader(existingUserToken),
      );
      assert.equal(createdPost.status, 200);
      assert.equal(existingUser._id, createdPost.data.author);
      assert.equal(post.title, createdPost.data.title);
      assert.equal(post.body, createdPost.data.body);
      assert.isNotEmpty(createdPost.data.date);
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
