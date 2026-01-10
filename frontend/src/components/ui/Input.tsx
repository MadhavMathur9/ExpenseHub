import type { InputHTMLAttributes, TextareaHTMLAttributes, LabelHTMLAttributes } from 'react';
import { forwardRef, Fragment } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Listbox, Transition } from '@headlessui/react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 lg:h-10 w-full rounded-[6px] border border-border bg-surface px-3 py-2 text-sm text-text-primary file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary fin-focus disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: SelectOption[];
  className?: string;
  id?: string;
}

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onChange, options, className, id }, ref) => {
    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    return (
      <div className="relative w-full" ref={ref} id={id}>
        <Listbox value={value} onChange={onChange}>
          <Listbox.Button
            className={cn(
              'flex h-9 lg:h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-surface pl-3 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/20 hover:border-emerald-500 hover:bg-gray-50 transition-colors cursor-default',
              className
            )}
          >
            <span className="block truncate">{selectedOption?.label || 'Select...'}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white p-1.5 text-base shadow-xl border border-gray-100 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {options.map((option, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 px-3 rounded-lg transition-colors ${
                      active ? 'bg-emerald-50 text-emerald-900' : 'text-gray-700'
                    }`
                  }
                  value={option.value}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-600">
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </Listbox>
      </div>
    );
  }
);
Select.displayName = 'Select';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-[6px] border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary fin-focus disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        'text-[12px] font-medium text-text-secondary tracking-[0.01em] mb-1.5 block',
        className
      )}
      {...props}
    />
  );
}
