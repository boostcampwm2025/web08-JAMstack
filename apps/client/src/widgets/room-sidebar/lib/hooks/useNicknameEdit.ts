import { useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { LIMITS } from '@codejam/common';
import { usePtsStore } from '@/stores/pts';
import { socket } from '@/shared/api/socket';
import { SOCKET_EVENTS } from '@codejam/common';
import type { Pt } from '@codejam/common';

export function useNicknameEdit(me: Pt) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(me.nickname || '');
  const [error, setError] = useState<string | null>(null);

  const setPt = usePtsStore((state) => state.setPt);

  const handleClick = () => {
    setIsEditing(true);
    setValue(me.nickname || '');
    setError(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // 실시간 유효성 검사
    if (newValue.trim().length < LIMITS.NICKNAME_MIN) {
      setError(`최소 ${LIMITS.NICKNAME_MIN}글자 이상 입력하세요`);
    } else if (newValue.length > LIMITS.NICKNAME_MAX) {
      setError(`최대 ${LIMITS.NICKNAME_MAX}글자까지 입력 가능합니다`);
    } else {
      setError(null);
    }
  };

  const handleSubmit = () => {
    const currentNickname = me.nickname || '';
    const trimmedValue = value.trim();

    // 유효성 검사
    if (trimmedValue.length < LIMITS.NICKNAME_MIN) {
      setValue(currentNickname);
      setError(null);
      setIsEditing(false);
      return;
    }

    if (trimmedValue.length > LIMITS.NICKNAME_MAX) {
      setValue(currentNickname);
      setError(null);
      setIsEditing(false);
      return;
    }

    // 변경사항이 있을 때만 업데이트
    if (trimmedValue !== currentNickname) {
      setPt(me.ptId, { ...me, nickname: trimmedValue });

      socket.emit(SOCKET_EVENTS.UPDATE_NICKNAME_PT, {
        ptId: me.ptId,
        nickname: trimmedValue,
      });

      setValue(trimmedValue);
    }

    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
    if (e.key === 'Escape') {
      setValue(me.nickname || '');
      setError(null);
      setIsEditing(false);
    }
  };

  return {
    isEditing,
    value,
    error,
    handleClick,
    handleChange,
    handleSubmit,
    handleKeyDown,
  };
}
