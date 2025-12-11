const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  testId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    // ✅ Note: unique tự động tạo index
  },
  category: {
    type: String,
    required: true
  },
  subcategory: String,
  description: String,
  
  // Thông tin mẫu
  specimenType: {
    type: String,
    enum: ['BLOOD', 'URINE', 'STOOL', 'TISSUE', 'SALIVA', 'CSF', 'OTHER'],
    required: true
  },
  specimenRequirements: String,
  collectionInstructions: String,
  storageRequirements: String,
  stability: String,
  
  // Thông tin thực hiện
  methodology: String,
  turnaroundTime: Number, // hours
  department: String,
  performingLab: String,
  
  // Giá trị tham chiếu
  referenceRanges: [{
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'BOTH']
    },
    ageMin: Number,
    ageMax: Number,
    minValue: Number,
    maxValue: Number,
    unit: String,
    conditions: String
  }],
  
  // Giá cả
  pricing: {
    cost: Number,
    price: Number,
    insurancePrice: Number
  },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DISCONTINUED'],
    default: 'ACTIVE'
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// ✅ FIX: Indexes - loại bỏ code index (unique đã có)
labTestSchema.index({ name: 'text' });
labTestSchema.index({ category: 1, status: 1 });
labTestSchema.index({ specimenType: 1 });

// Virtuals
labTestSchema.virtual('isAvailable').get(function() {
  return this.status === 'ACTIVE';
});

// Methods
labTestSchema.methods.getReferenceRange = function(age, gender) {
  let range = this.referenceRanges.find(ref => 
    ref.gender === gender || ref.gender === 'BOTH'
  );
  
  if (range && age) {
    // Tìm range phù hợp với độ tuổi
    const ageRanges = this.referenceRanges.filter(ref => 
      (ref.gender === gender || ref.gender === 'BOTH') &&
      (!ref.ageMin || age >= ref.ageMin) &&
      (!ref.ageMax || age <= ref.ageMax)
    );
    
    if (ageRanges.length > 0) {
      range = ageRanges[0];
    }
  }
  
  return range;
};

// Statics
labTestSchema.statics.findByCategory = function(category) {
  return this.find({ category, status: 'ACTIVE' });
};

labTestSchema.statics.findBySpecimen = function(specimenType) {
  return this.find({ specimenType, status: 'ACTIVE' });
};

labTestSchema.statics.searchTests = function(searchTerm) {
  return this.find({
    $or: [
      { name: new RegExp(searchTerm, 'i') },
      { code: new RegExp(searchTerm, 'i') },
      { description: new RegExp(searchTerm, 'i') }
    ],
    status: 'ACTIVE'
  });
};

module.exports = mongoose.model('LabTest', labTestSchema);