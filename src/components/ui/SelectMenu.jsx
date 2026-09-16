import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function SelectMenu({
  value,
  options,
  onChange,
  placeholder = 'اختر من القائمة',
  disabled = false,
  className = '',
  buttonClassName = '',
}) {
  const normalizedOptions = useMemo(
    () => options.map((option) =>
      typeof option === 'string'
        ? { value: option, label: option }
        : option,
    ),
    [options],
  );
  const selectedIndex = normalizedOptions.findIndex((option) => option.value === value);
  const selectedOption = normalizedOptions[selectedIndex];
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(Math.max(selectedIndex, 0));
  const [position, setPosition] = useState(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const listboxId = useId();

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = Math.min(normalizedOptions.length * 46 + 16, 256);
    const menuWidth = Math.max(rect.width, 190);
    const openAbove = window.innerHeight - rect.bottom < menuHeight + 16 && rect.top > menuHeight;
    const left = Math.min(
      Math.max(8, rect.right - menuWidth),
      window.innerWidth - menuWidth - 8,
    );

    setPosition({
      left,
      width: menuWidth,
      top: openAbove ? undefined : rect.bottom + 8,
      bottom: openAbove ? window.innerHeight - rect.top + 8 : undefined,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(Math.max(selectedIndex, 0));
    updatePosition();

    const handleOutsideClick = (event) => {
      if (
        !buttonRef.current?.contains(event.target) &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleViewportChange = () => updatePosition();

    document.addEventListener('pointerdown', handleOutsideClick);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, selectedIndex]);

  const selectOption = (index) => {
    const option = normalizedOptions[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (disabled) return;

    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (event.key === 'Tab') {
      setIsOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) =>
        (current + direction + normalizedOptions.length) % normalizedOptions.length,
      );
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && isOpen) {
      event.preventDefault();
      selectOption(activeIndex);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
        className={`focus-ring flex w-full items-center justify-between gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3 text-right text-sm font-bold text-charcoal shadow-sm transition-all hover:border-brass disabled:cursor-wait disabled:opacity-60 ${isOpen ? 'border-brass ring-3 ring-brass/15' : ''} ${buttonClassName}`}
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-walnut' : ''}`}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && position && (
            <motion.div
              ref={menuRef}
              id={listboxId}
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={position}
              className="fixed z-[100] max-h-64 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-2 text-right shadow-2xl shadow-black/15"
            >
              {normalizedOptions.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    onPointerMove={() => setActiveIndex(index)}
                    onClick={() => selectOption(index)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-sm transition-colors disabled:opacity-40 ${isSelected ? 'bg-walnut text-white' : isActive ? 'bg-cream text-charcoal' : 'text-stone-700 hover:bg-cream'}`}
                  >
                    <span className="font-semibold">{option.label}</span>
                    {isSelected && <Check size={16} strokeWidth={2.5} />}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}

export default SelectMenu;
