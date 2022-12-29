import { check } from 'express-validator';
import postService from '../../../services/postService';
import errorCodes from '../../../constants/errorCodes';

const { POST_NOT_EXISTS } = errorCodes;

const validateAuthorExists = check('id', POST_NOT_EXISTS)
  .exists()
  .isString()
  .custom(async (postId) => {
    const post = await postService.findById(postId);
    if (!post) {
      return Promise.reject(new Error(POST_NOT_EXISTS));
    }
    return Promise.resolve();
  });

export default validateAuthorExists;
