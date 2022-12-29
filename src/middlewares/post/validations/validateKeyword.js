import { check } from 'express-validator';
import errorCodes from '../../../constants/errorCodes';

const { POST_KEYWORD_INVALID } = errorCodes;

const validateKeyword = check('keyword', POST_KEYWORD_INVALID).isString();

export default validateKeyword;
