import { check } from 'express-validator';
import errorCodes from '../../../constants/errorCodes';

const { POST_USER_LOGGEDIN_DIFFERENT_FROM_THE_AUTHOR } = errorCodes;

const validateAuthorExists = check('author')
  .exists()
  .isString()
  .custom(async (authorId, { req }) => {
    if (req.user._id !== authorId) {
      return Promise.reject(
        new Error(POST_USER_LOGGEDIN_DIFFERENT_FROM_THE_AUTHOR),
      );
    }
    return Promise.resolve();
  });

export default validateAuthorExists;
