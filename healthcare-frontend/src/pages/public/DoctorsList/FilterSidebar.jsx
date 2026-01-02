import { ClearOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input } from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';
import { motion } from 'framer-motion';

import { useEffect, useState } from 'react';

const FilterSidebar = ({
  specialties,
  departments,
  onFilterChange,
  selectedFilters,
  loading,
}) => {
  const [localSearch, setLocalSearch] = useState(selectedFilters.search || '');
  const [localSpecialties, setLocalSpecialties] = useState(
    selectedFilters.specialty || []
  );
  const [localDepartments, setLocalDepartments] = useState(
    selectedFilters.department || []
  );
  const [localExperience, setLocalExperience] = useState(
    selectedFilters.experience || null
  );
  const [sortBy, setSortBy] = useState(selectedFilters.sort || 'experience');

  useEffect(() => {
    setLocalSearch(selectedFilters.search || '');
    setLocalSpecialties(selectedFilters.specialty || []);
    setLocalDepartments(selectedFilters.department || []);
    setLocalExperience(selectedFilters.experience || null);
    setSortBy(selectedFilters.sort || 'experience');
  }, [selectedFilters]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
  };

  const handleSearchSubmit = () => {
    onFilterChange({
      search: localSearch,
      specialty: localSpecialties,
      department: localDepartments,
      sort: sortBy,
      page: 1,
    });
  };

  const handleSpecialtyChange = (specialty) => {
    const updated = localSpecialties.includes(specialty)
      ? localSpecialties.filter((s) => s !== specialty)
      : [...localSpecialties, specialty];
    setLocalSpecialties(updated);
    onFilterChange({
      search: localSearch,
      specialty: updated,
      department: localDepartments,
      sort: sortBy,
      page: 1,
    });
  };

  const handleDepartmentChange = (department) => {
    const updated = localDepartments.includes(department)
      ? localDepartments.filter((d) => d !== department)
      : [...localDepartments, department];
    setLocalDepartments(updated);
    onFilterChange({
      search: localSearch,
      specialty: localSpecialties,
      department: updated,
      sort: sortBy,
      page: 1,
    });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onFilterChange({
      search: localSearch,
      specialty: localSpecialties,
      department: localDepartments,
      experience: localExperience,
      sort: value,
      page: 1,
    });
  };

  const handleExperienceChange = (experienceRange) => {
    setLocalExperience(experienceRange);
    onFilterChange({
      search: localSearch,
      specialty: localSpecialties,
      department: localDepartments,
      experience: experienceRange,
      sort: sortBy,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setLocalSpecialties([]);
    setLocalDepartments([]);
    setLocalExperience(null);
    setSortBy('experience');
    onFilterChange({
      search: '',
      specialty: [],
      department: [],
      experience: null,
      sort: 'experience',
      page: 1,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-white rounded-2xl p-6 border border-gray-100 h-fit sticky top-24"
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-6">
        <FilterOutlined className="text-blue-500 text-lg" />
        <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tìm kiếm
        </label>
        <Input
          placeholder="Tên bác sĩ, chuyên khoa..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={localSearch}
          onChange={handleSearchChange}
          onPressEnter={handleSearchSubmit}
          className="h-10 rounded-lg"
          size="large"
        />
        <Button
          type="primary"
          block
          className="mt-2 bg-blue-500 hover:bg-blue-600 h-10 font-semibold"
          onClick={handleSearchSubmit}
          loading={loading}
        >
          <SearchOutlined /> Tìm kiếm
        </Button>
      </div>

      {/* Sort */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Sắp xếp
        </label>
        <CustomSelect
          value={sortBy}
          onChange={handleSortChange}
          className="w-full"
          options={[
            { label: 'Kinh nghiệm (cao → thấp)', value: 'experience' },
            { label: 'Kinh nghiệm (thấp → cao)', value: 'experience_asc' },
            { label: 'Tên (A → Z)', value: 'name_asc' },
            { label: 'Tên (Z → A)', value: 'name_desc' },
            { label: 'Mới nhất', value: 'newest' },
          ]}
        />

      </div>

      {/* Specialty Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Chuyên khoa
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {specialties.length > 0 ? (
            specialties.map((specialty) => (
              <div key={specialty} className="flex items-center">
                <Checkbox
                  checked={localSpecialties.includes(specialty)}
                  onChange={() => handleSpecialtyChange(specialty)}
                  className="custom-checkbox"
                >
                  <span className="text-sm text-gray-700">{specialty}</span>
                </Checkbox>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Đang tải...</p>
          )}
        </div>
      </div>

      {/* Department Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Khoa / Phòng ban
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {departments.length > 0 ? (
            departments.map((department) => (
              <div key={department} className="flex items-center">
                <Checkbox
                  checked={localDepartments.includes(department)}
                  onChange={() => handleDepartmentChange(department)}
                  className="custom-checkbox"
                >
                  <span className="text-sm text-gray-700">{department}</span>
                </Checkbox>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Đang tải...</p>
          )}
        </div>
      </div>

      {/* Experience Filter */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Năm kinh nghiệm
        </label>
        <div className="space-y-2">
          <div
            className={`p-3 rounded-lg cursor-pointer transition ${localExperience === null
              ? 'bg-blue-50 border border-blue-300'
              : 'bg-gray-50 border border-gray-200'
              }`}
            onClick={() => handleExperienceChange(null)}
          >
            <span className="text-sm font-medium text-gray-700">Tất cả</span>
          </div>
          <div
            className={`p-3 rounded-lg cursor-pointer transition ${localExperience === '0-5'
              ? 'bg-blue-50 border border-blue-300'
              : 'bg-gray-50 border border-gray-200'
              }`}
            onClick={() => handleExperienceChange('0-5')}
          >
            <span className="text-sm font-medium text-gray-700">0 - 5 năm</span>
            <span className="text-xs text-gray-500 ml-2">(Mới tốt nghiệp)</span>
          </div>
          <div
            className={`p-3 rounded-lg cursor-pointer transition ${localExperience === '5-10'
              ? 'bg-blue-50 border border-blue-300'
              : 'bg-gray-50 border border-gray-200'
              }`}
            onClick={() => handleExperienceChange('5-10')}
          >
            <span className="text-sm font-medium text-gray-700">5 - 10 năm</span>
            <span className="text-xs text-gray-500 ml-2">(Có kinh nghiệm)</span>
          </div>
          <div
            className={`p-3 rounded-lg cursor-pointer transition ${localExperience === '10-15'
              ? 'bg-blue-50 border border-blue-300'
              : 'bg-gray-50 border border-gray-200'
              }`}
            onClick={() => handleExperienceChange('10-15')}
          >
            <span className="text-sm font-medium text-gray-700">10 - 15 năm</span>
            <span className="text-xs text-gray-500 ml-2">(Kinh nghiệm cao)</span>
          </div>
          <div
            className={`p-3 rounded-lg cursor-pointer transition ${localExperience === '15+'
              ? 'bg-blue-50 border border-blue-300'
              : 'bg-gray-50 border border-gray-200'
              }`}
            onClick={() => handleExperienceChange('15+')}
          >
            <span className="text-sm font-medium text-gray-700">15+ năm</span>
            <span className="text-xs text-gray-500 ml-2">(Chuyên gia)</span>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        danger
        block
        size="large"
        className="h-10 font-semibold"
        icon={<ClearOutlined />}
        onClick={handleClearFilters}
      >
        Xóa tất cả bộ lọc
      </Button>

      {/* Active Filters Count */}
      {(localSearch || localSpecialties.length > 0 || localDepartments.length > 0) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">
            📍 {localSearch ? 1 : 0} + {localSpecialties.length} + {localDepartments.length} bộ lọc
            đang hoạt động
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default FilterSidebar;
