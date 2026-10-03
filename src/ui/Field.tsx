import {
  createContext,
  forwardRef,
  useContext,
  type AriaAttributes,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/cn';

interface FieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  /** Visually hide the label but keep it for screen readers. */
  hideLabel?: boolean;
  className?: string;
  children: ReactNode;
}

/** Label + control + hint/error, wired together with ids and aria attributes. */
export function Field({ label, hint, error, required = false, hideLabel, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), required }}>
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label htmlFor={id} className={cn('text-[13px] font-medium text-ink-2', hideLabel && 'sr-only')}>
          {label}
          {required && (
            <span className="ms-0.5 text-danger" aria-hidden>
              *
            </span>
          )}
        </label>
        {children}
        {error ? (
          <p id={errorId} className="text-[13px] text-danger" role="alert">
            {error}
          </p>
        ) : (
          hint && (
            <p id={hintId} className="text-[13px] text-ink-3">
              {hint}
            </p>
          )
        )}
      </div>
    </FieldContext.Provider>
  );
}

function useFieldProps(props: { id?: string; 'aria-describedby'?: string; 'aria-invalid'?: AriaAttributes['aria-invalid']; required?: boolean }) {
  const field = useContext(FieldContext);
  return {
    id: props.id ?? field?.id,
    'aria-describedby': props['aria-describedby'] ?? field?.describedBy,
    'aria-invalid': props['aria-invalid'] ?? (field?.invalid || undefined),
    required: props.required ?? (field?.required || undefined),
  };
}

const controlBase =
  'w-full rounded-lg border border-line-strong bg-surface text-sm text-ink placeholder:text-ink-3 transition-colors ' +
  'hover:border-ink-3 focus:border-brand focus:outline-none focus:ring-3 focus:ring-brand/15 ' +
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15 disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { leading?: ReactNode; inputSize?: 'md' | 'lg' };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, leading, inputSize = 'md', ...props }, ref) {
  const fieldProps = useFieldProps(props);
  const height = inputSize === 'lg' ? 'h-12 text-base' : 'h-10';
  if (!leading) {
    return <input ref={ref} className={cn(controlBase, height, 'px-3', className)} {...props} {...fieldProps} />;
  }
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-ink-3">{leading}</span>
      <input ref={ref} className={cn(controlBase, height, 'ps-9 pe-3', className)} {...props} {...fieldProps} />
    </div>
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  const fieldProps = useFieldProps(props);
  return (
    <div className="relative">
      <select ref={ref} className={cn(controlBase, 'h-10 appearance-none ps-3 pe-9', className)} {...props} {...fieldProps}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" aria-hidden />
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, rows = 3, ...props }, ref) {
  const fieldProps = useFieldProps(props);
  return <textarea ref={ref} rows={rows} className={cn(controlBase, 'min-h-20 px-3 py-2 leading-relaxed', className)} {...props} {...fieldProps} />;
});

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  description?: ReactNode;
}

export function Checkbox({ label, description, className, id, ...props }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input id={inputId} type="checkbox" className="mt-1 size-4 shrink-0 cursor-pointer rounded accent-brand" {...props} />
      <label htmlFor={inputId} className="cursor-pointer text-sm text-ink">
        {label}
        {description && <span className="mt-0.5 block text-[13px] text-ink-3">{description}</span>}
      </label>
    </div>
  );
}
