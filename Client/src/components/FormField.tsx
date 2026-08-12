import "./FormField.css"

interface FormFieldProps {
  label: string
  type: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export default function FormField({
  label,
  type,
  placeholder,
  value,
  onChange,
  required = false,
}: FormFieldProps) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        className="field-input"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  )
}