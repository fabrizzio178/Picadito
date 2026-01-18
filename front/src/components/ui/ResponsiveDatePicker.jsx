import React from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Box, Input } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import es from "date-fns/locale/es";

// Registrar locale español
registerLocale("es", es);

// Custom Input para integrarlo visualmente con Mantine
const CustomInput = React.forwardRef(({ value, onClick, placeholder, error, label, ...props }, ref) => (
  <Input.Wrapper label={label} error={error} w="100%">
    <Input
      component="button"
      type="button"
      pointer
      ref={ref}
      onClick={onClick}
      leftSection={<IconCalendar size={18} />}
      value={value}
      rightSectionWidth={0} // Evitar espacio extra
      {...props}
    >
      {value || <span style={{ color: "var(--mantine-color-placeholder)" }}>{placeholder}</span>}
    </Input>
  </Input.Wrapper>
));

export default function ResponsiveDatePicker({ value, onChange, label, placeholder, error, minDate, ...props }) {
  return (
    <Box w="100%" className="responsive-datepicker-wrapper">
      <DatePicker
        selected={value}
        onChange={onChange}
        locale="es"
        dateFormat="dd 'de' MMMM yyyy"
        minDate={minDate}
        placeholderText={placeholder}
        customInput={<CustomInput label={label} error={error} />}
        popperPlacement="bottom-start"
        // Clases para estilar el calendario (opcional, se puede meter en CSS global)
        wrapperClassName="w-full"
        {...props}
      />
      
      {/* Estilos inline para overrides rápidos del CSS de react-datepicker para que pegue con Mantine */}
      <style>{`
        .responsive-datepicker-wrapper .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker {
          font-family: var(--mantine-font-family);
          border-color: var(--mantine-color-gray-3);
          border-radius: var(--mantine-radius-md);
          box-shadow: var(--mantine-shadow-lg);
        }
        .react-datepicker__header {
          background-color: var(--mantine-color-gray-0);
          border-bottom: 1px solid var(--mantine-color-gray-2);
          padding-top: 12px;
        }
        /* Z-INDEX FIX: Asegurar que el calendario flote sobre otros inputs */
        .react-datepicker-popper {
          z-index: 2000 !important; 
        }

        .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
          background-color: var(--mantine-color-turf-6) !important;
          border-radius: 50%;
          color: white !important;
        }
        .react-datepicker__day:hover {
          border-radius: 50%;
          background-color: var(--mantine-color-gray-1);
        }
        /* Flechas de navegación */
        .react-datepicker__navigation {
          top: 10px;
        }
        .react-datepicker__navigation-icon::before {
          border-color: var(--mantine-color-dark-4);
          border-width: 2px 2px 0 0;
          height: 8px;
          width: 8px;
        }
        .react-datepicker__current-month {
           font-family: var(--mantine-font-family);
           color: var(--mantine-color-dark-9);
           font-weight: 700;
           text-transform: capitalize;
           margin-bottom: 4px;
        }
      `}</style>
    </Box>
  );
}
