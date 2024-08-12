const Joi = require('Joi')

const userSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    dateofbirth: Joi.date().iso().required()
})

export const UserValidator = {
    validateUserPayload: (payload: any) => {
      const validationResult = userSchema.validate(payload);
      if (validationResult.error) {
        throw new Error(validationResult.error.message);
      }
    },
};