import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type FieldType = 'text' | 'email' | 'phone' | 'date' | 'select' | 'textarea' | 'number' | 'password';

interface SelectOption {
  value: string | number;
  label: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  type: FieldType;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function FormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  options = [],
  required = false,
  disabled = false,
  error,
  className,
}: FormFieldProps) {
  const renderField = (): ReactNode => {
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <Input
            id={name}
            name={name}
            type={type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'phone':
        return (
          <Input
            id={name}
            name={name}
            type="tel"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || '+1 (555) 000-0000'}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'number':
        return (
          <Input
            id={name}
            name={name}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={placeholder}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={name}
            name={name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn('min-h-[100px]', error ? 'border-red-500' : '')}
          />
        );

      case 'select':
        return (
          <Select
            value={value?.toString()}
            onValueChange={(v) => {
              const option = options.find(o => o.value.toString() === v);
              onChange(option?.value);
            }}
            disabled={disabled}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !value && 'text-muted-foreground',
                  error && 'border-red-500'
                )}
                disabled={disabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Validation helpers
export const validators = {
  required: (value: any): string | undefined => {
    if (value === undefined || value === null || value === '') {
      return 'This field is required';
    }
  },

  email: (value: string): string | undefined => {
    if (!value) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
  },

  phone: (value: string): string | undefined => {
    if (!value) return undefined;
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(value)) {
      return 'Please enter a valid phone number';
    }
  },

  minLength: (min: number) => (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
  },

  maxLength: (max: number) => (value: string): string | undefined => {
    if (!value) return undefined;
    if (value.length > max) {
      return `Must be at most ${max} characters`;
    }
  },
};

// Form validation hook helper
export function validateField(
  value: any,
  validations: Array<(value: any) => string | undefined>
): string | undefined {
  for (const validation of validations) {
    const error = validation(value);
    if (error) return error;
  }
  return undefined;
}
