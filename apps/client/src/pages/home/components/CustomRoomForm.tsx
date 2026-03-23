import {
  LIMITS,
  passwordSchema,
  type CreateCustomRoomRequest,
} from '@codejam/common';
import {
  Button,
  ButtonGroup,
  Input,
  Field,
  FieldTitle,
  FieldDescription,
  FieldError,
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from '@codejam/ui';
import { ArrowLeft, Eye, EyeOff, Loader2, Minus, Plus } from 'lucide-react';
import {
  type ReactNode,
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { ErrorMessage } from './ErrorMessage';

interface FormFieldProps {
  title: string;
  description: string;
  children: ReactNode;
}

function FormField({ title, description, children }: FormFieldProps) {
  return (
    <Field
      orientation="horizontal"
      className="flex items-start justify-between"
    >
      <div>
        <FieldTitle className="text-base">{title}</FieldTitle>
        <FieldDescription className="text-xs">{description}</FieldDescription>
      </div>
      {children}
    </Field>
  );
}

interface StepperFieldProps {
  title: string;
  description: string;
  value: number | '';
  min: number;
  max: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDecrease: () => void;
  onIncrease: () => void;
  className?: string;
  isInvalid?: boolean;
  errorMessage?: string;
}

function StepperField({
  title,
  description,
  value,
  min,
  max,
  onChange,
  onDecrease,
  onIncrease,
  className,
  isInvalid,
  errorMessage,
}: StepperFieldProps) {
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const decreaseButtonRef = useRef<HTMLButtonElement>(null);
  const increaseButtonRef = useRef<HTMLButtonElement>(null);
  const valueRef = useRef(value);
  const minRef = useRef(min);
  const maxRef = useRef(max);
  const onDecreaseRef = useRef(onDecrease);
  const onIncreaseRef = useRef(onIncrease);

  // Keep refs in sync
  useEffect(() => {
    valueRef.current = value;
    minRef.current = min;
    maxRef.current = max;
    onDecreaseRef.current = onDecrease;
    onIncreaseRef.current = onIncrease;
  }, [value, min, max, onDecrease, onIncrease]);

  const startRepeating = useCallback((action: () => void) => {
    action();
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(action, 100);
    }, 500);
  }, []);

  const stopRepeating = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const decreaseBtn = decreaseButtonRef.current;

    if (decreaseBtn) {
      const handleDecreaseStart = (e: PointerEvent) => {
        e.preventDefault();
        startRepeating(() => {
          if (valueRef.current !== '' && valueRef.current > minRef.current) {
            onDecreaseRef.current();
          } else {
            stopRepeating();
          }
        });
      };
      const handleDecreaseEnd = () => {
        stopRepeating();
      };

      decreaseBtn.addEventListener('pointerdown', handleDecreaseStart);
      decreaseBtn.addEventListener('pointerup', handleDecreaseEnd);
      decreaseBtn.addEventListener('pointercancel', handleDecreaseEnd);

      return () => {
        decreaseBtn.removeEventListener('pointerdown', handleDecreaseStart);
        decreaseBtn.removeEventListener('pointerup', handleDecreaseEnd);
        decreaseBtn.removeEventListener('pointercancel', handleDecreaseEnd);
      };
    }
  }, [startRepeating, stopRepeating]);

  useEffect(() => {
    const increaseBtn = increaseButtonRef.current;

    if (increaseBtn) {
      const handleIncreaseStart = (e: PointerEvent) => {
        e.preventDefault();
        startRepeating(() => {
          if (valueRef.current === '' || valueRef.current < maxRef.current) {
            onIncreaseRef.current();
          } else {
            stopRepeating();
          }
        });
      };
      const handleIncreaseEnd = () => {
        stopRepeating();
      };

      increaseBtn.addEventListener('pointerdown', handleIncreaseStart);
      increaseBtn.addEventListener('pointerup', handleIncreaseEnd);
      increaseBtn.addEventListener('pointercancel', handleIncreaseEnd);

      return () => {
        increaseBtn.removeEventListener('pointerdown', handleIncreaseStart);
        increaseBtn.removeEventListener('pointerup', handleIncreaseEnd);
        increaseBtn.removeEventListener('pointercancel', handleIncreaseEnd);
      };
    }
  }, [startRepeating, stopRepeating]);

  return (
    <div className={className}>
      <FormField title={title} description={description}>
        <div className="flex flex-col items-end gap-1">
          <ButtonGroup>
            <Input
              type="number"
              value={value}
              onChange={onChange}
              aria-invalid={isInvalid}
              className="w-14 [appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <Button
              ref={decreaseButtonRef}
              variant="outline"
              size="icon"
              disabled={value === '' || value <= min}
              type="button"
              style={{ touchAction: 'none' }}
            >
              <Minus className="size-4" />
            </Button>
            <Button
              ref={increaseButtonRef}
              variant="outline"
              size="icon"
              disabled={value !== '' && value >= max}
              type="button"
              style={{ touchAction: 'none' }}
            >
              <Plus className="size-4" />
            </Button>
          </ButtonGroup>
          <FieldError
            className={`text-xs transition-all duration-300 ${
              isInvalid && errorMessage
                ? 'translate-y-0 opacity-100'
                : '-translate-y-1 opacity-0'
            }`}
          >
            {errorMessage || '\u00A0'}
          </FieldError>
        </div>
      </FormField>
    </div>
  );
}

interface PasswordFieldProps {
  title: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onToggleVisibility: () => void;
  isInvalid?: boolean;
  errorMessage?: string;
}

function PasswordField({
  title,
  value,
  onChange,
  showPassword,
  onToggleVisibility,
  isInvalid,
  errorMessage,
}: PasswordFieldProps) {
  return (
    <FormField
      title={`${title}`}
      description={`영문+숫자 ${LIMITS.PASSWORD_MIN}~${LIMITS.PASSWORD_MAX}자리 (선택)`}
    >
      <div className="flex flex-col items-end gap-1">
        <InputGroup className="h-9 w-46">
          <InputGroupInput
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            minLength={LIMITS.PASSWORD_MIN}
            maxLength={LIMITS.PASSWORD_MAX}
            aria-invalid={isInvalid}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              onClick={onToggleVisibility}
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
        <FieldError
          className={`w-full text-xs transition-all duration-300 ${
            isInvalid && errorMessage
              ? 'translate-y-0 opacity-100'
              : '-translate-y-1 opacity-0'
          }`}
        >
          {errorMessage || '\u00A0'}
        </FieldError>
      </div>
    </FormField>
  );
}

interface Props {
  onCancel: () => void;
  onCreate: (data: CreateCustomRoomRequest) => void;
  isLoading: boolean;
  error?: string;
}

export function CustomRoomForm({
  onCancel,
  onCreate,
  isLoading,
  error,
}: Props) {
  const [customRoomConfig, setCustomRoomConfig] =
    useState<CreateCustomRoomRequest>({
      maxPts: LIMITS.MAX_CAN_EDIT,
    });

  const [maxPtsInput, setMaxPtsInput] = useState<number | ''>(
    LIMITS.MAX_CAN_EDIT,
  );
  const [showRoomPassword, setShowRoomPassword] = useState(false);
  const [showHostPassword, setShowHostPassword] = useState(false);

  const validatePassword = (
    value: string | undefined,
  ): { isValid: boolean; error?: string } => {
    if (!value || value.trim() === '') return { isValid: true };
    const result = passwordSchema.safeParse(value);
    if (result.success) return { isValid: true };
    return { isValid: false, error: result.error.issues[0]?.message };
  };

  const roomPasswordValidation = validatePassword(
    customRoomConfig.roomPassword,
  );
  const hostPasswordValidation = validatePassword(
    customRoomConfig.hostPassword,
  );

  const isMaxPtsValid =
    maxPtsInput !== '' &&
    maxPtsInput >= LIMITS.MIN_PTS &&
    maxPtsInput <= LIMITS.MAX_PTS;

  const isFormValid =
    isMaxPtsValid &&
    roomPasswordValidation.isValid &&
    hostPasswordValidation.isValid;

  const handleCreateCustomRoom = () => {
    if (!isFormValid) return;

    const roomPassword = customRoomConfig.roomPassword?.trim() || undefined;
    const hostPassword = customRoomConfig.hostPassword?.trim() || undefined;

    onCreate({
      maxPts: customRoomConfig.maxPts,
      roomPassword,
      hostPassword,
    });
  };

  const handleChange = <K extends keyof CreateCustomRoomRequest>(
    field: K,
    value: CreateCustomRoomRequest[K],
  ) => {
    setCustomRoomConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaxPtsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '') {
      setMaxPtsInput('');
      return;
    }
    const val = parseInt(rawValue);
    if (!isNaN(val)) {
      const clampedVal = Math.min(
        Math.max(val, LIMITS.MIN_PTS),
        LIMITS.MAX_PTS,
      );
      setMaxPtsInput(clampedVal);
      handleChange('maxPts', clampedVal);
    }
  };

  const decreaseMaxPts = useCallback(() => {
    setMaxPtsInput((prev) => {
      const current = prev === '' ? LIMITS.MIN_PTS : prev;
      if (current <= LIMITS.MIN_PTS) {
        return current;
      }
      const newVal = Math.max(current - 1, LIMITS.MIN_PTS);
      queueMicrotask(() => {
        setCustomRoomConfig((c) => ({ ...c, maxPts: newVal }));
      });
      return newVal;
    });
  }, []);

  const increaseMaxPts = useCallback(() => {
    setMaxPtsInput((prev) => {
      const current = prev === '' ? LIMITS.MIN_PTS : prev;
      if (current >= LIMITS.MAX_PTS) {
        return current;
      }
      const newVal = Math.min(current + 1, LIMITS.MAX_PTS);
      queueMicrotask(() => {
        setCustomRoomConfig((c) => ({ ...c, maxPts: newVal }));
      });
      return newVal;
    });
  }, []);

  const handleRoomPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('roomPassword', e.target.value);
  };

  const handleHostPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange('hostPassword', e.target.value);
  };

  const toggleRoomPasswordVisibility = () => {
    setShowRoomPassword(!showRoomPassword);
  };

  const toggleHostPasswordVisibility = () => {
    setShowHostPassword(!showHostPassword);
  };

  return (
    <div className="flex h-full flex-col">
      <header className="border-border bg-accent/20 flex items-center gap-4 border-b p-4 dark:bg-zinc-700">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-accent/50 size-8"
          onClick={onCancel}
        >
          <ArrowLeft size={18} />
        </Button>
        <h4 className="text-foreground text-lg font-semibold">방 설정</h4>
      </header>

      <form
        className="flex h-full flex-col justify-between px-12 py-4 dark:bg-zinc-800"
        onSubmit={handleCreateCustomRoom}
      >
        <div className="flex flex-col gap-2">
          <StepperField
            title="참여 인원"
            description={`최소 ${LIMITS.MIN_PTS}명 ~ 최대 ${LIMITS.MAX_PTS}명`}
            value={maxPtsInput}
            min={LIMITS.MIN_PTS}
            max={LIMITS.MAX_PTS}
            onChange={handleMaxPtsChange}
            onDecrease={decreaseMaxPts}
            onIncrease={increaseMaxPts}
            isInvalid={maxPtsInput === ''}
            errorMessage="참여 인원을 입력해주세요"
          />

          <PasswordField
            title="방 비밀번호"
            value={customRoomConfig.roomPassword ?? ''}
            onChange={handleRoomPasswordChange}
            showPassword={showRoomPassword}
            onToggleVisibility={toggleRoomPasswordVisibility}
            isInvalid={!roomPasswordValidation.isValid}
            errorMessage={roomPasswordValidation.error}
          />

          <PasswordField
            title="호스트 비밀번호"
            value={customRoomConfig.hostPassword ?? ''}
            onChange={handleHostPasswordChange}
            showPassword={showHostPassword}
            onToggleVisibility={toggleHostPasswordVisibility}
            isInvalid={!hostPasswordValidation.isValid}
            errorMessage={hostPasswordValidation.error}
          />
        </div>
        <div className="space-y-2">
          <Button
            className="group w-full rounded-xl bg-blue-600 p-7 text-xl text-white shadow-md transition-all hover:bg-blue-700"
            onClick={handleCreateCustomRoom}
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-3">
                <Loader2 className="size-7 animate-spin" />
                생성 중
              </span>
            ) : (
              '방 생성하기'
            )}
          </Button>
          <ErrorMessage message={error} />
        </div>
      </form>
    </div>
  );
}
