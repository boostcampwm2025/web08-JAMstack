import {
  Label,
  Input,
  Slider,
  Switch,
  Button,
  SidebarHeader,
} from '@codejam/ui';
import {
  RotateCcw,
  MousePointer2,
  UserCircle,
  Type,
  Activity,
} from 'lucide-react';
import { useSettings } from '@/shared/lib/hooks/useSettings';
import { PinButton } from './PinButton';

export function SettingsTabContent() {
  const {
    fontSize,
    setFontSize,
    resetSettings,
    showRemoteCursor,
    showGutterAvatars,
    alwaysShowCursorLabels,
    streamCodeExecutionOutput,
    toggleRemoteCursor,
    toggleGutterAvatars,
    toggleCursorLabels,
    toggleStreamCodeExecutionOutput,
  } = useSettings();

  const handleSliderChange = (value: number | readonly number[]) => {
    const v = Array.isArray(value) ? value[0] : value;
    setFontSize(v);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-x-hidden overflow-y-hidden">
      <SidebarHeader title="에디터 설정" action={<PinButton />} />
      <div className="flex h-full w-full flex-col justify-between">
        <div className="grid gap-6">
          <section>
            <h4 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
              폰트
            </h4>
            <div className="grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-2">
              <Label htmlFor="fontSize">크기</Label>
              <span className="text-muted-foreground text-xs">10 - 30px</span>
              <Slider
                min={10}
                max={30}
                step={1}
                value={[fontSize]}
                onValueChange={handleSliderChange}
              />
              <Input
                value={fontSize}
                readOnly
                className="h-6 w-10 justify-self-center text-center text-xs"
              />
            </div>
          </section>

          <div className="border-border/50 border-t" />

          <section>
            <h4 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
              커서 & 외관
            </h4>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <MousePointer2 size={16} />
                  다른 사용자의 커서 보기
                </div>
                <Switch
                  checked={showRemoteCursor}
                  onCheckedChange={toggleRemoteCursor}
                  className="data-checked:bg-brand-blue"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <UserCircle size={16} />줄 번호 옆 프로필 표시
                </div>
                <Switch
                  checked={showGutterAvatars}
                  onCheckedChange={toggleGutterAvatars}
                  className="data-checked:bg-brand-blue"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Type size={16} />
                  커서 이름표 항상 보기
                </div>
                <Switch
                  checked={alwaysShowCursorLabels}
                  onCheckedChange={toggleCursorLabels}
                  className="data-checked:bg-brand-blue"
                />
              </div>
            </div>
          </section>

          <div className="border-border/50 border-t" />

          <section>
            <h4 className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
              코드 실행
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Activity size={16} /> 실시간 출력
              </div>
              <Switch
                checked={streamCodeExecutionOutput}
                onCheckedChange={toggleStreamCodeExecutionOutput}
                className="data-checked:bg-brand-blue"
              />
            </div>
          </section>
        </div>

        <Button variant="destructive" size="lg" onClick={resetSettings}>
          <RotateCcw />
          설정 초기화
        </Button>
      </div>
    </div>
  );
}
