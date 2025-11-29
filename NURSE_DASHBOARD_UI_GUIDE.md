# 🎨 NURSE DASHBOARD - UI/UX VISUAL GUIDE

## 📐 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    HEADER (Professional)                │
│  [Logo] Hệ Thống Quản Lý Y Tế - Điều Dưỡng            │
│  Quản lý chăm sóc bệnh nhân và theo dõi sinh hiệu       │
│                               [Avatar] [Nurse Name] [Logout] │
└─────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────┐
│              │                                          │
│  SIDEBAR     │           MAIN CONTENT AREA             │
│              │                                          │
│ ❤️ Điều Dưỡng│ ┌──────────────────────────────────┐   │
│ v1.0 Pro     │ │  CONTENT AREA (Dynamic)          │   │
│              │ │  Changes based on active tab     │   │
│ [Dashboard]  │ │                                  │   │
│ [Patients]   │ │  Tab 1: Dashboard Stats          │   │
│ [Records]    │ │  Tab 2: Patient List             │   │
│ [Vitals]     │ │  Tab 3: Medical Records          │   │
│              │ │  Tab 4: Vitals & Notes           │   │
│              │ │                                  │   │
│              │ └──────────────────────────────────┘   │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

## 🎯 Tab 1: Dashboard Overview

```
┌─ ALERT BANNER ──────────────────────────────────────┐
│ ⚠️  Bạn có 1 bệnh nhân cần chú ý - Huyết áp cao   │
└─────────────────────────────────────────────────────┘

┌─ STAT CARDS (4 columns) ────────────────────────────┐
│                                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │
│ │   👥 12      │ │   📅 5       │ │   ⏰ 3       │ │
│ │ Bệnh Nhân    │ │ Lịch Hẹn     │ │ Cần Chăm Sóc │ │
│ │ Được Giao    │ │ Hôm Nay      │ │              │ │
│ └──────────────┘ └──────────────┘ └──────────────┘ │
│
│ ┌──────────────┐
│ │   ⚠️ 1       │
│ │ Dị Thường    │
│ │ Sinh Hiệu    │
│ └──────────────┘
│
└────────────────────────────────────────────────────┘

┌─ PATIENT ATTENTION & TASKS ─────────────────────────┐
│                                                      │
│ ┌─ Bệnh Nhân Cần Chú Ý ─┐  ┌─ Tác Vụ Hôm Nay ─┐   │
│ │                       │  │                  │   │
│ │ ┌─ Trần Thị B ─────┐  │  │ ✅ Kiểm tra sinh │   │
│ │ │ P. 302            │  │  │    hiệu lúc 9h  │   │
│ │ │ Huyết áp cao      │  │  │                  │   │
│ │ │ 🔴 Cao            │  │  │ ✅ Cấp thuốc cho│   │
│ │ └───────────────────┘  │  │    5 bệnh nhân   │   │
│ │                       │  │                  │   │
│ │ ┌─ Nguyễn Văn A ────┐ │  │ ✅ Thay băng cho │   │
│ │ │ P. 301            │ │  │    bệnh nhân phòng│  │
│ │ │ Tiểu đường loại 2 │ │  │    301           │   │
│ │ │ 🟠 Trung Bình     │ │  │                  │   │
│ │ └───────────────────┘ │  │ ✅ Báo cáo với   │   │
│ │                       │  │    bác sĩ        │   │
│ └───────────────────────┘  └──────────────────┘   │
│                                                      │
└────────────────────────────────────────────────────┘
```

## 🧑‍⚕️ Tab 2: Patient List

```
┌─ Patient List Table ────────────────────────────────┐
│                                                      │
│ Search: [           ]  [Reset] [Export]             │
│                                                      │
│ ┌──┬─────────────┬──────┬──────────┬────┬────┬────┐ │
│ │ID│ Bệnh Nhân   │Tuổi/ │ Chẩn Đoán│Ttạ│Ưu │Hành│ │
│ │  │             │Phòng │          │i  │Tiên│Động│ │
│ ├──┼─────────────┼──────┼──────────┼────┼────┼────┤ │
│ │P │ Nguyễn Văn A│45/301│ Tiểu     │ ⚙️ │🟠 │📄❤️│ │
│ │01│ (ID: P001)  │      │ đường    │care│Trg │    │ │
│ ├──┼─────────────┼──────┼──────────┼────┼────┼────┤ │
│ │P │ Trần Thị B  │62/302│ Huyết áp │⚠️ │🔴 │📄❤️│ │
│ │02│ (ID: P002)  │      │ cao      │need│Cao │    │ │
│ ├──┼─────────────┼──────┼──────────┼────┼────┼────┤ │
│ │P │ Lê Văn C    │55/303│ COPD     │✅  │🟢 │📄❤️│ │
│ │03│ (ID: P003)  │      │          │sta │Thấp│    │ │
│ └──┴─────────────┴──────┴──────────┴────┴────┴────┘ │
│                                                      │
│ Showing 1-10 of 12 | [< Prev] [1] [Next >]         │
│                                                      │
└────────────────────────────────────────────────────┘
```

## 📋 Tab 3: Medical Records

```
┌─ Medical Records Table ─────────────────────────────┐
│                                                      │
│ ┌──┬─────────────┬───┬─────────────────────────┐   │
│ │ID│ Bệnh Nhân   │Phòng│ Hành Động              │   │
│ ├──┼─────────────┼───┼─────────────────────────┤   │
│ │P │ Nguyễn Văn A│301 │ [👁️ Xem Chi Tiết]      │   │
│ │01│             │   │                         │   │
│ ├──┼─────────────┼───┼─────────────────────────┤   │
│ │P │ Trần Thị B  │302 │ [👁️ Xem Chi Tiết]      │   │
│ │02│             │   │                         │   │
│ ├──┼─────────────┼───┼─────────────────────────┤   │
│ │P │ Lê Văn C    │303 │ [👁️ Xem Chi Tiết]      │   │
│ │03│             │   │                         │   │
│ └──┴─────────────┴───┴─────────────────────────┘   │
│                                                      │
└────────────────────────────────────────────────────┘

📋 DRAWER (when "Xem Chi Tiết" clicked)
┌─────────────────────────────┐
│ Hồ Sơ Bệnh Án - Nguyễn Văn A │
├─────────────────────────────┤
│                             │
│ 👤 Thông Tin Bản Thân       │
│ ├─ Nhóm máu: O+             │
│ ├─ Tuổi: 45                 │
│ └─ Phòng: 301               │
│                             │
│ ─────────────────────────   │
│                             │
│ 🚨 Dị Ứng                   │
│ ├─ [Penicillin]             │
│                             │
│ ─────────────────────────   │
│                             │
│ 💊 Bệnh Lý Mãn Tính         │
│ ├─ [Tiểu đường loại 2]      │
│                             │
│ ─────────────────────────   │
│                             │
│ 💉 Thuốc Hiện Dùng          │
│ ├─ Insulin                  │
│ │  20 units • 2x daily      │
│ ├─ Metformin                │
│ │  500mg • 3x daily         │
│                             │
│ ─────────────────────────   │
│                             │
│ 📝 Chẩn Đoán & Điều Trị     │
│ ├─ Bác sĩ: Dr. Nguyễn...    │
│ ├─ Chẩn đoán: Type 2...     │
│ ├─ Điều trị: Insulin...     │
│ └─ Ghi chú: Patient...      │
│                             │
└─────────────────────────────┘
```

## 🌡️ Tab 4: Vital Signs & Notes (Part 1)

```
┌─ VITAL SIGNS COLUMN ────────────┐
│                                 │
│ Theo Dõi Sinh Hiệu    [➕ Thêm] │
│                                 │
│ 📊 Nguyễn Văn A                 │
│ ┌─ 10:30 AM ─────────────────┐ │
│ │ 🌡️ T: 36.8°C               │ │
│ │ ❤️ HR: 78 bpm              │ │
│ │ 💨 BP: 130/85              │ │
│ │ 🫁 RR: 18/min              │ │
│ │ O₂: 97%                    │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ 2:30 PM ──────────────────┐  │
│ │ 🌡️ T: 36.9°C               │  │
│ │ ❤️ HR: 76 bpm              │  │
│ │ 💨 BP: 128/82              │  │
│ │ 🫁 RR: 18/min              │  │
│ │ O₂: 98%                    │  │
│ └─────────────────────────────┘  │
│                                 │
│ [🔘 Nhập Sinh Hiệu Mới]        │
│ ─────────────────────────────── │
│                                 │
│ 📊 Trần Thị B                   │
│ ┌─ 9:15 AM ──────────────────┐  │
│ │ 🌡️ T: 37.1°C               │  │
│ │ ❤️ HR: 82 bpm              │  │
│ │ 💨 BP: 145/92 ⚠️            │  │
│ │ 🫁 RR: 20/min              │  │
│ │ O₂: 96%                    │  │
│ └─────────────────────────────┘  │
│                                 │
│ [🔘 Nhập Sinh Hiệu Mới]        │
│                                 │
└─────────────────────────────────┘
```

## 📝 Tab 4: Vital Signs & Notes (Part 2)

```
┌─ NURSING NOTES COLUMN──────────┐
│                                │
│ Ghi Chú Điều Dưỡng            │
│                                │
│ 📝 Nguyễn Văn A                │
│ ┌─ 8:30 AM (Y.T. Linh) ─────┐  │
│ │ 🔵 ASSESSMENT              │  │
│ │ Patient alert and          │  │
│ │ oriented, no complaints    │  │
│ └────────────────────────────┘  │
│                                │
│ ┌─ 2:00 PM (Y.T. Linh) ─────┐  │
│ │ 🟢 INTERVENTION            │  │
│ │ Assisted with ambulation,  │  │
│ │ tolerates well             │  │
│ └────────────────────────────┘  │
│                                │
│ [🔘 Thêm Ghi Chú]             │
│ ─────────────────────────────── │
│                                │
│ 📝 Trần Thị B                  │
│ (No notes yet)                 │
│                                │
│ [🔘 Thêm Ghi Chú]             │
│                                │
└─────────────────────────────────┘
```

## ⚙️ Vital Signs Input Modal

```
┌─ Nhập Sinh Hiệu - Nguyễn Văn A ──────────┐
│                                           │
│ Nhiệt Độ (°C)           [36.8        ]  │
│ Huyết Áp (mmHg)         [120/80      ]  │
│ Nhịp Tim (bpm)          [72          ]  │
│ Tần Số Hô Hấp (/min)   [16          ]  │
│ SpO₂ (%)                [98          ]  │
│                                           │
│ Ghi Chú                                   │
│ ┌─────────────────────────────────────┐  │
│ │ Tình trạng bình thường, bệnh nhân   │  │
│ │ hợp tác tốt                         │  │
│ └─────────────────────────────────────┘  │
│                                           │
│                      [Hủy]  [💾 Lưu]    │
│                                           │
└───────────────────────────────────────────┘
```

## 🎨 Color Coding Reference

### Status Badges
```
┌─ CARE_IN_PROGRESS ─┐  ┌─ NEEDS_CARE ─────┐
│ ⚙️  Đang chăm sóc   │  │ ⚠️  Cần chăm sóc   │
│ (Processing)       │  │ (Warning)         │
│ Background: Blue   │  │ Background: Orange│
└────────────────────┘  └───────────────────┘

┌─ STABLE ───────────┐  ┌─ CRITICAL ────────┐
│ ✅ Ổn định        │  │ 🚨 Nguy hiểm      │
│ (Success)         │  │ (Error)           │
│ Background: Green │  │ Background: Red   │
└────────────────────┘  └───────────────────┘
```

### Priority Indicators
```
🔴 CAO (High)      - Cần can thiệp ngay
🟠 TRUNG BÌNH      - Theo dõi định kỳ
🟢 THẤP (Low)      - Hỗ trợ bình thường
```

## 📱 Responsive Breakpoints

### Desktop (≥1200px)
- 2-column layout (Vitals + Notes side by side)
- Full-width tables
- All features visible

### Tablet (768-1199px)
- 2-column layout stacks to 1 when needed
- Responsive grid adjusts
- Tables may scroll horizontally

### Mobile (<768px)
- Single column layout
- Vitals & Notes stack vertically
- Tables in horizontal scroll mode
- Buttons sized for touch (44px minimum)
- Font sizes increase for readability

## 🎯 Design Principles Applied

1. **Clarity**: Clear labels, color-coding, status badges
2. **Efficiency**: Quick access to critical info
3. **Safety**: Allergies prominently displayed in red
4. **Accessibility**: Large touch targets, high contrast
5. **Consistency**: Same patterns throughout app
6. **Feedback**: Success/error messages, loading states

## 🚀 Animation Details

```css
Card Hover: 
  - Subtle shadow increase
  - Light lift effect (translateY -2px)
  - Smooth 0.3s transition

Button Hover:
  - Primary buttons: shadow + lift
  - Dashed buttons: background change
  - 0.3s smooth transition

Sidebar Transition:
  - Menu items fade on selection
  - Smooth 0.3s color change

Page Load:
  - fadeIn animation for content
  - 0.3s ease-in from opacity 0 to 1
```

## 📊 Typography Hierarchy

```
Header Title:    18px, Bold, Color: #001529
Subtitle:        12px, Light, Color: #999
Card Title:      16px, Bold
Card Content:    14px, Regular
Labels:          13px, Regular, Color: #666
Stats Value:     28px, Bold, Color: varies by stat
Small Text:      12px, Regular, Color: #999
Timestamps:      11px, Light, Color: #bbb
```

---

**Version**: 1.0 Pro  
**Last Updated**: 2025-11-29  
**Design System**: Ant Design v5.11.2
