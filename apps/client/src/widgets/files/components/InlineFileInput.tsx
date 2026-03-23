import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { cn, Input } from '@codejam/ui';
import { filenameSchema } from '@codejam/common';
import { toast } from '@codejam/ui';

interface InlineFileInputProps {
  initialValue?: string;
  onSubmit: (filename: string) => void;
  onCancel: () => void;
}

const ACTIVE_FILE_BG = 'bg-accent/80 text-primary rounded-sm';

const validateFilename = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return { success: false, error: null };

  const result = filenameSchema.safeParse(trimmed);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error.issues[0]?.message };
};

export const InlineFileInput = ({
  initialValue = '',
  onSubmit,
  onCancel,
}: InlineFileInputProps) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    const validation = validateFilename(newValue);
    if (validation.success || !newValue.trim()) {
      setError(null);
    } else {
      setError(validation.error || 'Invalid filename');
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return false;

    const validation = validateFilename(value);
    if (validation.success && validation.data) {
      onSubmit(validation.data);
      return true;
    }

    if (validation.error) {
      toast.error(validation.error);
    }
    return false;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (value.trim()) {
        const isSuccess = handleSubmit();
        if (!isSuccess) {
          e.preventDefault();
          return;
        }
      }
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      const isSuccess = handleSubmit();
      if (!isSuccess) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  return (
    <div className={cn('relative mt-1 w-full', error && 'mb-5')}>
      <div
        className={cn(
          'group relative flex h-10 items-center justify-between px-2 transition-all duration-200 select-none',
          ACTIVE_FILE_BG,
          error && 'border-destructive/50 border',
        )}
      >
        <div className="flex w-full items-center space-x-3 overflow-hidden">
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder="example.txt"
            className={cn(
              'h-6 w-full rounded-sm border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0',
              'placeholder:text-muted-foreground/50',
            )}
            autoFocus
          />
        </div>
      </div>
      {error && (
        <div className="text-destructive animate-in fade-in slide-in-from-top-1 absolute top-full left-2 z-50 mt-1 text-xs font-medium">
          {error}
        </div>
      )}
    </div>
  );
};
