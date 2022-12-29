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
  validateContentOfComment,
  validatePostExists,
  validateKeyword,
} = postValidations;

const { validateBody, validateParams } = commonValidations;
const {
  createPost,
  findAllPosts,
  findPostById,
  findPostByAuthor,
  addCommentToPost,
  findPostByKeyword,
} = postMiddlewares;

const postRouter = express.Router();

const createPostValidations = [
  validateTitle,
  validatePostBody,
  validateAuthorExists,
  validateThatAuthorIsLoggedIn,
  validateKeyword,
];

const createCommentValidations = [
  validateAuthorExists,
  validateContentOfComment,
];

const createPostMiddleware = validateBody(createPostValidations);
const getPostByAuthorMiddleware = validateParams(validateAuthorExists);
const createCommentMiddleware = validateBody(createCommentValidations);
const existPostMiddleware = validateParams(validatePostExists);
const getPostByKeywordMiddleware = validateParams(validateKeyword);

postRouter.post('/', isAuthorized, createPostMiddleware, createPost);

postRouter.post(
  '/add-comment/:id',
  isAuthorized,
  existPostMiddleware,
  createCommentMiddleware,
  addCommentToPost,
);

postRouter.get('/', isAuthorized, findAllPosts);

postRouter.get('/:id', isAuthorized, validateId, findPostById);

postRouter.get(
  '/author/:author',
  isAuthorized,
  getPostByAuthorMiddleware,
  findPostByAuthor,
);

postRouter.get(
  '/keyword/:keyword',
  isAuthorized,
  getPostByKeywordMiddleware,
  findPostByKeyword,
);

export default postRouter;
