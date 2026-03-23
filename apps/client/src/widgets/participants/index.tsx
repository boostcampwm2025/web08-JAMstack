import { useState, useMemo } from 'react';
import { Participant } from './components';
import { ParticipantsFilterBar } from './components/ParticipantsFilterBar';
import { SortControls } from './components/SortControls';
import { BulkActions } from './components/BulkActions';
import { usePtsStore } from '@/stores/pts';
import { useRoomStore } from '@/stores/room';
import { useSocketStore } from '@/stores/socket';
import { SOCKET_EVENTS, PERMISSION, ROLE, type Pt } from '@codejam/common';
import { SidebarHeader, toast, ScrollArea } from '@codejam/ui';
import type { SortKey } from './lib/types';
import type { FilterOption } from './types';
import { filterParticipants, sortParticipants } from './types';
import { usePermission } from '@/shared/lib/hooks/usePermission';
import { PinButton } from '@/widgets/room-sidebar/components/PinButton';

/**
 * 참가자 목록 위젯 메인 컴포넌트
 * - 실시간 참가자 목록 표시
 * - 검색, 정렬, 필터링 기능 제공
 * - 호스트의 경우 참가자 역할 관리 가능
 */
export function Participants() {
  const pts = usePtsStore((state) => state.pts);
  const { myPtId, roomCode } = useRoomStore();
  const { socket } = useSocketStore();
  const { can } = usePermission();

  // 상태 관리
  const [selectedFilters, setSelectedFilters] = useState<FilterOption[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('time');
  const [searchQuery, setSearchQuery] = useState('');

  // 필터링 및 정렬된 참가자 목록
  const { me, others, totalCount } = useMemo(() => {
    // 1. 필터 적용
    let filtered = filterParticipants(pts, selectedFilters);
    // 2. 검색 적용
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((pt) =>
        pt.nickname.toLowerCase().includes(query),
      );
    }
    // 3. 정렬 적용
    const sorted = sortParticipants(filtered, sortKey);
    // 3. me와 others 분리
    const me = myPtId ? sorted.find((pt) => pt.ptId === myPtId) : undefined;
    const others = sorted.filter((pt) => pt.ptId !== myPtId);
    return { me, others, totalCount: sorted.length };
  }, [pts, searchQuery, selectedFilters, sortKey, myPtId]);

  // 정렬 핸들러
  const handleSortChange = (key: SortKey) => {
    setSortKey(key);
  };

  // 일괄 권한 변경 핸들러
  const handleBulkRoleChange = (
    targetRole: typeof ROLE.EDITOR | typeof ROLE.VIEWER,
  ) => {
    if (!socket || !roomCode || !can(PERMISSION.MANAGE_ROLE)) return;

    const targetPtIds = others.map((pt) => pt.ptId);
    if (targetPtIds.length === 0) {
      const message =
        targetRole === ROLE.EDITOR
          ? '편집 권한을 부여할 참가자가 없습니다.'
          : '읽기 권한으로 변경할 참가자가 없습니다.';
      toast.info(message);
      return;
    }

    targetPtIds.forEach((ptId) => {
      socket.emit(SOCKET_EVENTS.UPDATE_ROLE_PT, {
        roomCode,
        ptId,
        role: targetRole,
      });
    });

    const successMessage =
      targetRole === ROLE.EDITOR
        ? `${targetPtIds.length}명에게 편집 권한을 부여했습니다.`
        : `${targetPtIds.length}명을 읽기 권한으로 변경했습니다.`;
    toast.success(successMessage);
  };

  const handleBulkEdit = () => handleBulkRoleChange(ROLE.EDITOR);
  const handleBulkView = () => handleBulkRoleChange(ROLE.VIEWER);

  return (
    <div className="flex h-full w-full flex-col space-y-2">
      <SidebarHeader title="참가자" count={totalCount} action={<PinButton />} />
      <ParticipantsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedFilters={selectedFilters}
        onFiltersChange={setSelectedFilters}
        sortControls={
          <SortControls sortKey={sortKey} onSortChange={handleSortChange} />
        }
        actions={
          <BulkActions
            isHost={can(PERMISSION.MANAGE_ROLE)}
            filteredCount={others.length}
            onBulkEdit={handleBulkEdit}
            onBulkView={handleBulkView}
          />
        }
      />
      <div className="min-h-0 flex-1">
        <ParticipantsSection count={totalCount} me={me} others={others} />
      </div>
    </div>
  );
}

function Divider() {
  return <div className="border-b border-gray-200 dark:border-gray-700" />;
}

function ParticipantsSection({
  count,
  me,
  others,
}: {
  count: number;
  me?: Pt;
  others: Pt[];
}) {
  if (count === 0) {
    return <NoSearchResult />;
  }

  return (
    <div className="flex h-full flex-col">
      {me && <Divider />}
      <Me me={me} />
      {others.length > 0 && <Divider />}
      <ParticipantList others={others} />
    </div>
  );
}

function NoSearchResult() {
  return (
    <div className="flex flex-1 items-center justify-center text-center">
      <p className="text-muted-foreground text-sm">검색 결과가 없습니다.</p>
    </div>
  );
}

function Me({ me }: { me?: Pt }) {
  if (!me) return null;

  return <Participant ptId={me.ptId} />;
}

function ParticipantList({ others }: { others: Pt[] }) {
  return (
    <ScrollArea className="min-h-0 flex-1">
      {others.map((p) => (
        <Participant key={p.ptId} ptId={p.ptId} />
      ))}
    </ScrollArea>
  );
}

// Re-export components only (for Fast Refresh compatibility)
export { Participant } from './components/Participant';
export { ParticipantAvatar, ParticipantMenu } from './ui';
