import publicAPI from '@/services/api/publicAPI';
import { Empty, Pagination, Row, Skeleton } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import DoctorCard from './DoctorCard';
import FilterSidebar from './FilterSidebar';

const DoctorsListPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: '',
    specialty: [],
    department: [],
    experience: null,
    sort: 'experience',
    page: 1,
  });

  // Load specialties and departments on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [specsRes, deptsRes] = await Promise.all([
          publicAPI.getSpecialties(),
          publicAPI.getDepartments(),
        ]);
        setSpecialties(specsRes || []);
        setDepartments(deptsRes || []);
      } catch (error) {
        console.error('❌ Lỗi tải lựa chọn bộ lọc:', error);
      }
    };
    loadFilterOptions();
  }, []);

  // Load doctors based on filters
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching doctors with filters:', filters);

        // Build query params
        const params = {
          page: filters.page,
          limit: pagination.pageSize,
        };

        // Add search param
        if (filters.search) {
          params.search = filters.search;
        }

        // Add specialty filter (join with comma if multiple)
        if (filters.specialty && filters.specialty.length > 0) {
          params.specialty = filters.specialty[0]; // API accepts single specialty
        }

        // Add department filter
        if (filters.department && filters.department.length > 0) {
          params.department = filters.department[0]; // API accepts single department
        }

        // Add experience filter
        if (filters.experience) {
          if (filters.experience === '0-5') {
            params.experienceMin = 0;
            params.experienceMax = 5;
          } else if (filters.experience === '5-10') {
            params.experienceMin = 5;
            params.experienceMax = 10;
          } else if (filters.experience === '10-15') {
            params.experienceMin = 10;
            params.experienceMax = 15;
          } else if (filters.experience === '15+') {
            params.experienceMin = 15;
          }
        }

        // Map sort options to API format
        const sortMap = {
          experience: 'experience_desc',
          experience_asc: 'experience_asc',
          name_asc: 'name_asc',
          name_desc: 'name_desc',
          newest: 'newest',
        };
        params.sort = sortMap[filters.sort] || 'experience_desc';

        const response = await publicAPI.getDoctors(params);
        console.log('✅ Doctors response:', response);

        if (response && response.doctors) {
          setDoctors(response.doctors);
          setPagination({
            current: response.pagination.page,
            pageSize: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      } catch (error) {
        console.error('❌ Lỗi khi tải danh sách bác sĩ:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [filters, pagination.pageSize]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePaginationChange = (page, pageSize) => {
    setFilters((prev) => ({ ...prev, page }));
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12"
    >
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            🏥 Danh sách các bác sĩ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-blue-100 max-w-2xl mx-auto"
          >
            Tìm kiếm và đặt lịch khám với các bác sĩ chuyên khoa hàng đầu
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <FilterSidebar
              specialties={specialties}
              departments={departments}
              onFilterChange={handleFilterChange}
              selectedFilters={filters}
              loading={loading}
            />
          </div>

          {/* Main Content - Doctors Grid */}
          <div className="lg:col-span-3">
            {/* Results Info */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-blue-600">{pagination.total}</span> kết quả
                tìm kiếm {filters.search && `cho "${filters.search}"`}{' '}
                {(filters.specialty.length > 0 || filters.department.length > 0) && '| Bộ lọc đã áp dụng'}
              </p>
            </motion.div>

            {/* Loading State */}
            {loading ? (
              <div>
                <Row gutter={[24, 24]}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="w-full lg:w-1/3">
                      <Skeleton
                        active
                        paragraph={{ rows: 4 }}
                        avatar={{ size: 256, shape: 'square' }}
                      />
                    </div>
                  ))}
                </Row>
              </div>
            ) : doctors.length > 0 ? (
              <>
                {/* Doctors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {doctors.map((doctor, index) => (
                    <DoctorCard key={doctor.id} doctor={doctor} index={index} />
                  ))}
                </div>

                {/* Pagination */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex justify-center mt-12"
                >
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    pageSizeOptions={[6, 12, 20, 50]}
                    onChange={handlePaginationChange}
                    onShowSizeChange={(current, size) => {
                      setPagination((prev) => ({ ...prev, pageSize: size }));
                      handlePaginationChange(1, size);
                    }}
                    showSizeChanger
                    showTotal={(total) => (
                      <span className="text-gray-600 font-semibold">
                        Tổng cộng {total} bác sĩ
                      </span>
                    )}
                    showQuickJumper
                    className="ant-pagination-custom"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  />
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Empty
                  description="Không tìm thấy bác sĩ nào"
                  style={{
                    marginTop: 50,
                    marginBottom: 50,
                  }}
                >
                  <p className="text-gray-600">
                    Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </Empty>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorsListPage;
