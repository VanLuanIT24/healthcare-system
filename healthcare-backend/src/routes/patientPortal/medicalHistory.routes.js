const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticate } = require("../../middlewares");
const { MedicalHistoryController } = require("../../controllers/patientPortal");

const verifyAuth = authenticate;
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages,
      });
    }
    req.validated = value;
    next();
  };
};

// Validation Schemas
const personalConditionSchema = Joi.object({
  conditionName: Joi.string().max(100).required(),
  icdCode: Joi.string().max(20).optional(),
  diagnosisDate: Joi.date().optional(),
  status: Joi.string().valid("Active", "Inactive", "Resolved").required(),
  severity: Joi.string().valid("Mild", "Moderate", "Severe").optional(),
  notes: Joi.string().max(500).optional(),
});

const familyHistorySchema = Joi.object({
  relation: Joi.string()
    .valid("Parent", "Sibling", "Grandparent", "Aunt/Uncle", "Cousin")
    .required(),
  conditionName: Joi.string().max(100).required(),
  age: Joi.number().min(0).optional(),
  notes: Joi.string().max(500).optional(),
});

const allergySchema = Joi.object({
  allergenName: Joi.string().max(100).required(),
  allergenType: Joi.string()
    .valid("Drug", "Food", "Environmental", "Other")
    .required(),
  reactionSeverity: Joi.string()
    .valid("Mild", "Moderate", "Severe", "Life-threatening")
    .required(),
  reactionDescription: Joi.string().max(500).optional(),
  dateIdentified: Joi.date().optional(),
  medications: Joi.array().items(Joi.string()).optional(),
});

const vaccinationSchema = Joi.object({
  vaccineName: Joi.string().max(100).required(),
  vaccineType: Joi.string().max(100).required(),
  dateAdministered: Joi.date().required(),
  expiryDate: Joi.date().optional(),
  provider: Joi.string().max(100).optional(),
  batchNumber: Joi.string().max(50).optional(),
  nextDueDate: Joi.date().optional(),
  notes: Joi.string().max(500).optional(),
});

const lifestyleSchema = Joi.object({
  smokingStatus: Joi.string().valid("Never", "Former", "Current").optional(),
  cigarettesPerDay: Joi.number().min(0).optional(),
  alcoholConsumption: Joi.string()
    .valid("None", "Occasional", "Regular", "Heavy")
    .optional(),
  unitsPerWeek: Joi.number().min(0).optional(),
  exerciseFrequency: Joi.string()
    .valid("Sedentary", "Light", "Moderate", "Vigorous")
    .optional(),
  hoursPerWeek: Joi.number().min(0).optional(),
  dietType: Joi.string()
    .valid("Omnivore", "Vegetarian", "Vegan", "Pescatarian")
    .optional(),
  lastUpdated: Joi.date().optional(),
});

// Routes - Personal Conditions
router.get(
  "/personal/conditions",
  verifyAuth,
  MedicalHistoryController.getPersonalHistory
);
router.post(
  "/personal/conditions",
  verifyAuth,
  validateRequest(personalConditionSchema),
  MedicalHistoryController.addPersonalCondition
);
router.put(
  "/personal/conditions/:conditionId",
  verifyAuth,
  validateRequest(personalConditionSchema),
  MedicalHistoryController.updatePersonalCondition
);
router.delete(
  "/personal/conditions/:conditionId",
  verifyAuth,
  MedicalHistoryController.deletePersonalCondition
);

// Routes - Family History
router.get(
  "/family/history",
  verifyAuth,
  MedicalHistoryController.getFamilyHistory
);
router.post(
  "/family/history",
  verifyAuth,
  validateRequest(familyHistorySchema),
  MedicalHistoryController.addFamilyCondition
);
router.put(
  "/family/history/:historyId",
  verifyAuth,
  validateRequest(familyHistorySchema),
  MedicalHistoryController.updateFamilyCondition
);
router.delete(
  "/family/history/:historyId",
  verifyAuth,
  MedicalHistoryController.deleteFamilyCondition
);

// Routes - Allergies
router.get("/allergies", verifyAuth, MedicalHistoryController.getAllergies);
router.post(
  "/allergies",
  verifyAuth,
  validateRequest(allergySchema),
  MedicalHistoryController.addAllergy
);
router.put(
  "/allergies/:allergyId",
  verifyAuth,
  validateRequest(allergySchema),
  MedicalHistoryController.updateAllergy
);
router.delete(
  "/allergies/:allergyId",
  verifyAuth,
  MedicalHistoryController.deleteAllergy
);

// Routes - Vaccinations
router.get(
  "/vaccinations",
  verifyAuth,
  MedicalHistoryController.getVaccinations
);
router.get(
  "/vaccinations/due",
  verifyAuth,
  MedicalHistoryController.getVaccinationsDue
);
router.post(
  "/vaccinations",
  verifyAuth,
  validateRequest(vaccinationSchema),
  MedicalHistoryController.addVaccination
);
router.put(
  "/vaccinations/:vaccinationId",
  verifyAuth,
  validateRequest(vaccinationSchema),
  MedicalHistoryController.updateVaccination
);
router.delete(
  "/vaccinations/:vaccinationId",
  verifyAuth,
  MedicalHistoryController.deleteVaccination
);

// Routes - Lifestyle
router.get(
  "/lifestyle",
  verifyAuth,
  MedicalHistoryController.getLifestyleFactors
);
router.put(
  "/lifestyle",
  verifyAuth,
  validateRequest(lifestyleSchema),
  MedicalHistoryController.updateLifestyleFactors
);

// Complete Medical History
router.get("/", verifyAuth, MedicalHistoryController.getCompleteHistory);

module.exports = router;
