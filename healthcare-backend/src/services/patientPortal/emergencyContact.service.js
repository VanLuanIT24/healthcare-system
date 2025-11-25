const EmergencyContact = require("../../models/emergencyContact.model");
const AppError = require("../../utils/appError");

/**
 * Emergency Contact Service
 * Business logic for emergency contact management
 */

class EmergencyContactService {
  /**
   * Get all emergency contacts
   */
  static async getAll(patientId) {
    const contacts = await EmergencyContact.find({ patientId }).sort({
      priority: 1,
    });

    return contacts;
  }

  /**
   * Get primary contact
   */
  static async getPrimary(patientId) {
    const contact = await EmergencyContact.findOne({
      patientId,
      isPrimary: true,
    });

    if (!contact) {
      throw new AppError("No primary emergency contact found", 404);
    }

    return contact;
  }

  /**
   * Get contacts by priority
   */
  static async getByPriority(patientId) {
    return await EmergencyContact.find({ patientId })
      .sort({ priority: 1 })
      .lean();
  }

  /**
   * Get single contact
   */
  static async getById(patientId, contactId) {
    const contact = await EmergencyContact.findOne({
      _id: contactId,
      patientId,
    });

    if (!contact) {
      throw new AppError("Emergency contact not found", 404);
    }

    return contact;
  }

  /**
   * Create new contact
   */
  static async create(patientId, contactData) {
    // Validate phone number
    this.validatePhoneNumber(contactData.phoneNumber);

    // If no primary exists, make this primary
    const primaryExists = await EmergencyContact.findOne({
      patientId,
      isPrimary: true,
    });

    const contact = new EmergencyContact({
      patientId,
      ...contactData,
      isPrimary: !primaryExists,
    });

    await contact.save();
    return contact;
  }

  /**
   * Update contact
   */
  static async update(patientId, contactId, updateData) {
    if (updateData.phoneNumber) {
      this.validatePhoneNumber(updateData.phoneNumber);
    }

    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: contactId, patientId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      throw new AppError("Emergency contact not found", 404);
    }

    return contact;
  }

  /**
   * Delete contact
   */
  static async delete(patientId, contactId) {
    const contact = await EmergencyContact.findOneAndDelete({
      _id: contactId,
      patientId,
    });

    if (!contact) {
      throw new AppError("Emergency contact not found", 404);
    }

    // If deleted contact was primary, set another as primary
    if (contact.isPrimary) {
      const nextContact = await EmergencyContact.findOne({
        patientId,
        _id: { $ne: contactId },
      });

      if (nextContact) {
        nextContact.isPrimary = true;
        await nextContact.save();
      }
    }

    return contact;
  }

  /**
   * Set as primary contact
   */
  static async setPrimary(patientId, contactId) {
    const contact = await this.getById(patientId, contactId);

    // Remove primary from all others
    await EmergencyContact.updateMany({ patientId }, { isPrimary: false });

    // Set this as primary
    contact.isPrimary = true;
    await contact.save();

    return contact;
  }

  /**
   * Verify contact details
   */
  static async verify(patientId, contactId) {
    const contact = await this.getById(patientId, contactId);

    contact.verificationStatus = "VERIFIED";
    contact.verificationDate = new Date();

    await contact.save();
    return contact;
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(
    patientId,
    contactId,
    preferences
  ) {
    const contact = await EmergencyContact.findOneAndUpdate(
      { _id: contactId, patientId },
      {
        $set: {
          "notificationPreferences.sms": preferences.sms || false,
          "notificationPreferences.email": preferences.email || false,
          "notificationPreferences.phone": preferences.phone || false,
          "notificationPreferences.alertTypes": preferences.alertTypes || [],
        },
      },
      { new: true }
    );

    if (!contact) {
      throw new AppError("Emergency contact not found", 404);
    }

    return contact;
  }

  /**
   * Get priority list
   */
  static async getPriorityList(patientId) {
    const contacts = await EmergencyContact.find({ patientId }).sort({
      priority: 1,
    });

    return {
      primary: contacts.find((c) => c.priority === "PRIMARY"),
      secondary: contacts.find((c) => c.priority === "SECONDARY"),
      tertiary: contacts.find((c) => c.priority === "TERTIARY"),
    };
  }

  /**
   * Validate phone number
   */
  static validatePhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, "");
    if (cleaned.length < 10 || cleaned.length > 15) {
      throw new AppError("Invalid phone number format", 400);
    }
  }

  /**
   * Get contacts summary
   */
  static async getSummary(patientId) {
    const contacts = await this.getAll(patientId);
    const primary = await EmergencyContact.findOne({
      patientId,
      isPrimary: true,
    });

    return {
      totalContacts: contacts.length,
      primaryContact: primary,
      allContacts: contacts,
    };
  }
}

module.exports = EmergencyContactService;
