import express from 'express';
import postMiddlewares from '../middlewares/post';
import commonValidations from '../middlewares/common/validations';
import postValidations from '../middlewares/post/validations';
import { isAuthorized } from '../middlewares/common/isAuthorized';

const {
  validateTitle,
  validateBody: validatePostBody,
  validateAuthorExists,
  validateId,
  validateThatAuthorIsLoggedIn,
} = postValidations;

const { validateBody, validateParams } = commonValidations;
const {
  createPost,
  findAllPosts,
  findPostById,
  findPostByAuthor,
} = postMiddlewares;

const postRouter = express.Router();

const createPostValidations = [
  validateTitle,
  validatePostBody,
  validateAuthorExists,
  validateThatAuthorIsLoggedIn,
];

const createPostMiddleware = validateBody(createPostValidations);
const getPostByAuthorMiddleware = validateParams(validateAuthorExists);
postRouter.post('/', isAuthorized, createPostMiddleware, createPost);

postRouter.get('/', isAuthorized, findAllPosts);

postRouter.get('/:id', isAuthorized, validateId, findPostById);

postRouter.get(
  '/author/:author',
  isAuthorized,
  getPostByAuthorMiddleware,
  findPostByAuthor,
);

export default postRouter;
