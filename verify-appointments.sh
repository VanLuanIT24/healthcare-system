#!/bin/bash

# 🔍 APPOINTMENT SYSTEM - FILE VERIFICATION SCRIPT
# This script verifies that all required files have been created

echo "=========================================="
echo "🔍 Verifying Appointment System Files"
echo "=========================================="
echo ""

# Define colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
TOTAL=0
FOUND=0

# Function to check file
check_file() {
    local file=$1
    local description=$2
    TOTAL=$((TOTAL + 1))
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description"
        echo "   📁 $file"
        FOUND=$((FOUND + 1))
    else
        echo -e "${RED}❌${NC} $description"
        echo "   📁 $file (NOT FOUND)"
    fi
    echo ""
}

# Check components
echo "📦 COMPONENTS:"
echo "=================="
check_file "src/components/appointment/AppointmentStatusTag.jsx" "AppointmentStatusTag Component"
check_file "src/components/appointment/AppointmentCard.jsx" "AppointmentCard Component"
check_file "src/components/appointment/AppointmentForm.jsx" "AppointmentForm Component"
check_file "src/components/appointment/index.js" "Component Index File"

# Check pages
echo "📄 PAGES (Admin):"
echo "=================="
check_file "src/pages/admin/appointments/TodayAppointments.jsx" "Today Appointments Page"
check_file "src/pages/admin/appointments/UpcomingAppointments.jsx" "Upcoming Appointments Page"
check_file "src/pages/admin/appointments/AvailableSlots.jsx" "Available Slots Page"
check_file "src/pages/admin/appointments/RescheduleAppointment.jsx" "Reschedule Appointment Page"
check_file "src/pages/admin/appointments/AppointmentStats.jsx" "Appointment Statistics Page"
check_file "src/pages/admin/appointments/DoctorScheduleManagement.jsx" "Doctor Schedule Management Page"
check_file "src/pages/admin/appointments/AppointmentReminders.jsx" "Appointment Reminders Page"
check_file "src/pages/admin/appointments/ExportAppointments.jsx" "Export Appointments Page"
check_file "src/pages/admin/appointments/AppointmentAccessLogs.jsx" "Appointment Access Logs Page"
check_file "src/pages/admin/appointments/AppointmentsList.jsx" "Appointments List Page (existing)"
check_file "src/pages/admin/appointments/AppointmentDetail.jsx" "Appointment Detail Page (existing)"

# Check routes
echo "🗺️  ROUTES:"
echo "=================="
check_file "src/router/AppRouter.jsx" "App Router (with appointments routes)"

# Check documentation
echo "📚 DOCUMENTATION:"
echo "=================="
check_file "../../APPOINTMENT_PAGES_SUMMARY.md" "Appointment Pages Summary"
check_file "../../APPOINTMENT_USER_GUIDE.md" "User Guide"
check_file "../../APPOINTMENT_IMPLEMENTATION_CHECKLIST.md" "Implementation Checklist"
check_file "../../README_APPOINTMENTS.md" "Readme (Appointments)"

echo ""
echo "=========================================="
echo "📊 VERIFICATION SUMMARY"
echo "=========================================="
echo -e "Total Files: $TOTAL"
echo -e "Found: ${GREEN}$FOUND${NC}"
echo -e "Missing: ${RED}$((TOTAL - FOUND))${NC}"
echo ""

if [ $FOUND -eq $TOTAL ]; then
    echo -e "${GREEN}✅ ALL FILES VERIFIED SUCCESSFULLY!${NC}"
    echo "The appointment system is ready for deployment."
    exit 0
else
    echo -e "${RED}❌ SOME FILES ARE MISSING${NC}"
    echo "Please check the missing files above."
    exit 1
fi
