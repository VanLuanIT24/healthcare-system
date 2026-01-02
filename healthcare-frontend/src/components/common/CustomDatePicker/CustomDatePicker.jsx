import React, { useState, useRef, useEffect } from 'react';
import { CalendarOutlined, LeftOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import './CustomDatePicker.css';

// Enable custom format parsing
dayjs.extend(customParseFormat);

/**
 * Custom DatePicker component that replaces Ant Design DatePicker
 * to avoid portal-related visibility issues.
 * Supports both calendar selection and manual text input.
 */
const CustomDatePicker = ({
  value,
  onChange,
  placeholder = 'Chọn ngày (DD/MM/YYYY)',
  format = 'DD/MM/YYYY',
  disabledDate,
  style,
  className = '',
  allowClear = true,
  status,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? dayjs(value) : dayjs());
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Days of week headers
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  
  // Months in Vietnamese
  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsEditing(false);
        // Validate and apply input when clicking outside
        if (inputValue) {
          applyInputValue();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue]);

  useEffect(() => {
    if (value) {
      setCurrentMonth(dayjs(value));
      setInputValue(dayjs(value).format(format));
    } else {
      setInputValue('');
    }
  }, [value, format]);

  // Parse and apply input value
  const applyInputValue = () => {
    if (!inputValue.trim()) {
      onChange?.(null);
      return;
    }
    
    // Try parsing with multiple formats
    const formats = ['DD/MM/YYYY', 'D/M/YYYY', 'DD-MM-YYYY', 'D-M-YYYY', 'YYYY-MM-DD'];
    let parsedDate = null;
    
    for (const fmt of formats) {
      const parsed = dayjs(inputValue, fmt, true);
      if (parsed.isValid()) {
        parsedDate = parsed;
        break;
      }
    }
    
    if (parsedDate && parsedDate.isValid()) {
      if (disabledDate && disabledDate(parsedDate)) {
        // Reset to previous valid value
        setInputValue(value ? dayjs(value).format(format) : '');
        return;
      }
      onChange?.(parsedDate);
      setCurrentMonth(parsedDate);
    } else {
      // Reset to previous valid value if invalid
      setInputValue(value ? dayjs(value).format(format) : '');
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyInputValue();
      setIsEditing(false);
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setInputValue(value ? dayjs(value).format(format) : '');
      setIsEditing(false);
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Small delay to allow calendar click to register
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        applyInputValue();
        setIsEditing(false);
      }
    }, 150);
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  const handlePrevYear = (e) => {
    e.stopPropagation();
    setCurrentMonth(currentMonth.subtract(1, 'year'));
  };

  const handleNextYear = (e) => {
    e.stopPropagation();
    setCurrentMonth(currentMonth.add(1, 'year'));
  };

  const handleSelectDate = (date, e) => {
    e.stopPropagation();
    if (disabledDate && disabledDate(date)) {
      return;
    }
    onChange?.(date);
    setInputValue(date.format(format));
    setIsOpen(false);
    setIsEditing(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.(null);
    setInputValue('');
  };

  const handleToday = (e) => {
    e.stopPropagation();
    const today = dayjs();
    if (disabledDate && disabledDate(today)) {
      return;
    }
    onChange?.(today);
    setInputValue(today.format(format));
    setIsOpen(false);
    setIsEditing(false);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startDay = startOfMonth.day(); // 0 = Sunday
    const daysInMonth = endOfMonth.date();
    
    const days = [];
    
    // Previous month's trailing days
    const prevMonth = currentMonth.subtract(1, 'month');
    const daysInPrevMonth = prevMonth.endOf('month').date();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = prevMonth.date(daysInPrevMonth - i);
      days.push({ date, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = currentMonth.date(i);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    const nextMonth = currentMonth.add(1, 'month');
    for (let i = 1; i <= remainingDays; i++) {
      const date = nextMonth.date(i);
      days.push({ date, isCurrentMonth: false });
    }
    
    return days;
  };

  const formatDisplayValue = () => {
    if (!value) return '';
    return dayjs(value).format(format);
  };

  const isToday = (date) => {
    return date.isSame(dayjs(), 'day');
  };

  const isSelected = (date) => {
    if (!value) return false;
    return date.isSame(dayjs(value), 'day');
  };

  const isDisabled = (date) => {
    if (!disabledDate) return false;
    return disabledDate(date);
  };

  const calendarDays = generateCalendarDays();

  return (
    <div 
      className={`custom-datepicker-container ${className}`} 
      ref={containerRef}
      style={style}
    >
      {/* Input trigger */}
      <div
        className={`custom-datepicker-trigger ${isOpen ? 'active' : ''} ${status === 'error' ? 'has-error' : ''}`}
      >
        <div className="datepicker-input-content">
          <input
            ref={inputRef}
            type="text"
            className="datepicker-text-input"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            placeholder={placeholder}
          />
        </div>
        <div className="datepicker-icons">
          {allowClear && value && (
            <CloseOutlined 
              className="clear-icon" 
              onClick={handleClear}
            />
          )}
          <CalendarOutlined 
            className="calendar-icon" 
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </div>

      {/* Calendar dropdown */}
      {isOpen && (
        <div className="custom-datepicker-dropdown animate-in">
          {/* Header */}
          <div className="datepicker-header">
            <button 
              type="button" 
              className="nav-btn" 
              onClick={handlePrevYear}
              title="Năm trước"
            >
              «
            </button>
            <button 
              type="button" 
              className="nav-btn" 
              onClick={handlePrevMonth}
              title="Tháng trước"
            >
              <LeftOutlined />
            </button>
            <span className="current-month-year">
              {months[currentMonth.month()]} {currentMonth.year()}
            </span>
            <button 
              type="button" 
              className="nav-btn" 
              onClick={handleNextMonth}
              title="Tháng sau"
            >
              <RightOutlined />
            </button>
            <button 
              type="button" 
              className="nav-btn" 
              onClick={handleNextYear}
              title="Năm sau"
            >
              »
            </button>
          </div>

          {/* Days of week */}
          <div className="datepicker-weekdays">
            {daysOfWeek.map((day) => (
              <div key={day} className="weekday-cell">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="datepicker-days">
            {calendarDays.map((item, index) => {
              const disabled = isDisabled(item.date);
              const selected = isSelected(item.date);
              const today = isToday(item.date);
              
              return (
                <div
                  key={index}
                  className={`day-cell 
                    ${!item.isCurrentMonth ? 'other-month' : ''} 
                    ${disabled ? 'disabled' : ''} 
                    ${selected ? 'selected' : ''} 
                    ${today ? 'today' : ''}
                  `}
                  onClick={(e) => !disabled && handleSelectDate(item.date, e)}
                >
                  {item.date.date()}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="datepicker-footer">
            <button 
              type="button" 
              className="today-btn"
              onClick={handleToday}
            >
              Hôm nay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
