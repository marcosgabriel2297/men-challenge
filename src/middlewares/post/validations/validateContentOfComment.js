import { check } from 'express-validator';
import errorCodes from '../../../constants/errorCodes';

const { POST_COMMENT_INVALID } = errorCodes;

const validateTitle = check('content', POST_COMMENT_INVALID).isString();

export default validateTitle;
