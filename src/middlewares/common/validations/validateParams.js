import { validationResult } from 'express-validator';

const validateParams = (validation) => async (req, res, next) => {
  await validation.run(req);

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(422).json({ errors: errors.array() });
};

export default validateParams;
