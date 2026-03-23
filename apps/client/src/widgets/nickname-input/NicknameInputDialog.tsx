import { useState } from 'react';
import { LIMITS, nicknameSchema } from '@codejam/common';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Label,
  Input,
} from '@codejam/ui';

interface NicknameInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (nickname: string) => void;
}

export function NicknameInputDialog({
  open,
  onOpenChange,
  onConfirm,
}: NicknameInputDialogProps) {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!isValid) return;

    onConfirm(nickname);
    setNickname('');
    setIsValid(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setNickname(value);

    if (!value.trim()) {
      setError('');
      setIsValid(false);
      return;
    }

    const result = nicknameSchema.safeParse(value);

    if (!result.success) {
      const firstError = result.error.issues[0];
      setError(firstError?.message || '닉네임 형식이 올바르지 않습니다.');
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
            <AlertDialogTitle>닉네임 입력</AlertDialogTitle>
            <AlertDialogDescription>
              방에 입장하기 위한 닉네임을 입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-1">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname" className="text-right">
                닉네임
              </Label>
              <div className="col-span-3">
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="닉네임을 입력하세요"
                  autoFocus
                  maxLength={LIMITS.NICKNAME_MAX}
                  aria-invalid={!!error}
                />
              </div>
            </div>
            <div className={`h-4 ${!error ? 'invisible' : ''}`}>
              <p className="text-right text-[12px] text-red-500">{error}</p>
            </div>
          </div>

          <AlertDialogFooter>
            <Button type="submit" disabled={!isValid} onClick={handleSubmit}>
              입장하기
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </form>
    </AlertDialog>
  );
}
