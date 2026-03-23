import { useState } from 'react';
import { LIMITS, passwordSchema } from '@codejam/common';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Label,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@codejam/ui';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordDialogProps {
  open: boolean;
  passwordError?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
}

export function PasswordDialogProps({
  open,
  passwordError,
  onOpenChange,
  onConfirm,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const displayError = error || passwordError;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isValid) return;

    onConfirm(password);
    setPassword('');
    setIsValid(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setPassword(value);

    if (!value.trim()) {
      setError('');
      setIsValid(false);
      return;
    }

    const result = passwordSchema.safeParse(value);

    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(firstError?.message || '비밀번호 형식이 올바르지 않습니다.');
      setIsValid(false);
    } else {
      setError('');
      setIsValid(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit}>
        <AlertDialogContent className="sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>비밀번호 입력</AlertDialogTitle>
            <AlertDialogDescription>
              방에 입장하기 위한 비밀번호를 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-1">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                비밀번호
              </Label>
              <div className="col-span-3">
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="비밀번호를 입력해주세요."
                    autoFocus
                    maxLength={LIMITS.PASSWORD_MAX}
                    aria-invalid={!!displayError}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      size="icon-xs"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </div>
            <div className={`h-4 ${!displayError ? 'invisible' : ''}`}>
              <p className="text-right text-[12px] text-red-500">
                {displayError}
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <Button type="submit" disabled={!isValid} onClick={handleSubmit}>
              입력
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  );
}
