const Joi = require('joi');
const { commonSchemas } = require('../middlewares/validation.middleware');

const pagination = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(20),
};

const params = Joi.object({
  id: commonSchemas.objectId.required(),
});

const departmentParams = Joi.object({
  departmentId: commonSchemas.objectId.required(),
});

const query = Joi.object(pagination);

const search = Joi.object({
  q: Joi.string().allow('').optional(),
  ...pagination,
});

const byRole = Joi.object({
  role: Joi.string().trim().optional(),
  ...pagination,
});

const byDepartment = Joi.object({
  departmentId: commonSchemas.objectId.required(),
  ...pagination,
});

const updateUser = Joi.object({
  role: Joi.string().trim().optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'PENDING', 'SUSPENDED', 'LOCKED').optional(),
  personalInfo: Joi.object().optional(),
  professionalInfo: Joi.object().optional(),
  contactInfo: Joi.object().optional(),
}).options({ abortEarly: false, stripUnknown: true, allowUnknown: true });

const updateRole = Joi.object({
  role: Joi.string().trim().required(),
}).options({ abortEarly: false });

const departmentBody = Joi.object({
  code: Joi.string().trim().max(50).required(),
  name: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(500).optional(),
  head: commonSchemas.objectId.optional(),
  contactNumber: Joi.string().trim().max(50).optional(),
  location: Joi.string().trim().max(200).optional(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE').default('ACTIVE'),
}).options({ abortEarly: false, stripUnknown: true });

const assignHead = Joi.object({
  userId: commonSchemas.objectId.required(),
}).options({ abortEarly: false });

const createUser = Joi.object({
  email: commonSchemas.email.required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().trim().required(),
  status: Joi.string().valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_APPROVAL', 'LOCKED').default('ACTIVE'),
  isEmailVerified: Joi.boolean().default(false),
  personalInfo: Joi.object({
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
    phone: Joi.string().trim().optional(),
    address: Joi.object({
      street: Joi.string().trim().optional(),
      city: Joi.string().trim().optional(),
      state: Joi.string().trim().optional(),
      zipCode: Joi.string().trim().optional(),
      country: Joi.string().trim().optional(),
    }).optional(),
  }).required(),
  professionalInfo: Joi.object().optional(),
}).options({ abortEarly: false, stripUnknown: true, allowUnknown: true });

const adminValidation = {
  query,
  params,
  search,
  byRole,
  byDepartment,
  updateUser,
  updateRole,
  departmentBody,
  departmentParams,
  assignHead,
  createUser,
};

module.exports = { adminValidation };
