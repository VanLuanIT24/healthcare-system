import React, { useState, useRef, useEffect } from 'react';
import { DownOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import './CustomSelect.css';

/**
 * A custom select component that replaces Ant Design Select
 * to avoid portal-related visibility issues.
 * 
 * Props:
 * - options: Array of { label, value } OR { label, options: [{ label, value }] } for groups
 * - value: Current value (single value or array for multiple mode)
 * - onChange: Callback function
 * - onSearch: Callback for dynamic search
 * - placeholder: Placeholder text
 * - allowClear: Boolean to show clear button
 * - showSearch: Boolean to enable search input
 * - loading: Boolean for loading state
 * - status: 'error' or undefined for Ant Design Form compatibility
 * - mode: 'multiple' or undefined 
 */
const CustomSelect = ({
    options = [],
    value,
    onChange,
    onSearch,
    placeholder = 'Chọn...',
    allowClear = false,
    showSearch = false,
    loading = false,
    status,
    mode,
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);
    const inputRef = useRef(null);

    // Xử lý value cho cả single và multiple mode
    const isMultiple = mode === 'multiple';
    const values = isMultiple ? (Array.isArray(value) ? value : []) : [value];

    // Lấy list flat options để tìm label
    const flatOptions = [];
    options.forEach(opt => {
        if (opt.options) {
            opt.options.forEach(subOpt => flatOptions.push(subOpt));
        } else {
            flatOptions.push(opt);
        }
    });

    const selectedOptions = flatOptions.filter(opt => values.includes(opt.value));
    const hasValue = values.length > 0 && values[0] !== undefined && values[0] !== null;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && showSearch && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, showSearch]);

    const handleSelect = (optionValue, e) => {
        if (e) e.stopPropagation();

        if (isMultiple) {
            const nextValues = values.includes(optionValue)
                ? values.filter(v => v !== optionValue)
                : [...values, optionValue];
            onChange?.(nextValues);
        } else {
            onChange?.(optionValue);
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.(isMultiple ? [] : undefined);
    };

    const removeValue = (val, e) => {
        e.stopPropagation();
        const nextValues = values.filter(v => v !== val);
        onChange?.(nextValues);
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        onSearch?.(term);
    };

    const renderOption = (option) => {
        const isSelected = values.includes(option.value);
        return (
            <div
                key={option.value}
                className={`custom-select-item ${isSelected ? 'selected' : ''}`}
                onClick={(e) => handleSelect(option.value, e)}
            >
                <span className="label">{option.label}</span>
                {isSelected && <CheckOutlined style={{ fontSize: '12px' }} className="check-icon" />}
            </div>
        );
    };

    const renderOptionsList = () => {
        if (loading) {
            return <div className="no-data"><Spin size="small" /> Đang tải...</div>;
        }

        const displayOptions = showSearch && !onSearch
            ? options.map(group => {
                if (group.options) {
                    const filteredSubOptions = group.options.filter(opt =>
                        opt.label?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    return filteredSubOptions.length > 0 ? { ...group, options: filteredSubOptions } : null;
                }
                return group.label?.toLowerCase().includes(searchTerm.toLowerCase()) ? group : null;
            }).filter(Boolean)
            : options;

        if (displayOptions.length === 0) {
            return <div className="no-data">Không có dữ liệu</div>;
        }

        return displayOptions.map((item, index) => {
            if (item.options) {
                return (
                    <div key={`group-${index}`} className="custom-select-group">
                        <div className="custom-select-group-title">{item.label}</div>
                        {item.options.map(renderOption)}
                    </div>
                );
            }
            return renderOption(item);
        });
    };

    return (
        <div
            className={`custom-select-container ${className} ${status === 'error' ? 'has-error' : ''}`}
            ref={containerRef}
        >
            <div
                className={`custom-select-trigger ${isOpen ? 'active' : ''} ${isMultiple ? 'multiple' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="selection-area">
                    {showSearch && isOpen ? (
                        <input
                            ref={inputRef}
                            type="text"
                            className="select-search-input"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder={placeholder}
                        />
                    ) : (
                        <>
                            {!hasValue && <span className="placeholder">{placeholder}</span>}
                            {isMultiple ? (
                                <div className="tags-container">
                                    {selectedOptions.map(opt => (
                                        <span key={opt.value} className="select-tag">
                                            {opt.label}
                                            <CloseOutlined
                                                className="tag-close"
                                                onClick={(e) => removeValue(opt.value, e)}
                                            />
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                hasValue && <span className="selection-text">{selectedOptions[0]?.label}</span>
                            )}
                        </>
                    )}
                </div>

                <div className="icons-wrapper">
                    {allowClear && hasValue && (
                        <CloseOutlined
                            style={{ fontSize: '10px' }}
                            className="clear-icon"
                            onClick={handleClear}
                        />
                    )}
                    <DownOutlined
                        style={{ fontSize: '12px' }}
                        className={`arrow-icon ${isOpen ? 'rotated' : ''}`}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="custom-select-dropdown animate-in">
                    {renderOptionsList()}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
