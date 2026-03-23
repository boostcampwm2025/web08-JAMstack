/**
 * [!NOTE]
 * 현재 사용하지 않음 (이동됨)
 * room-sidebar의 SettingsTabContent를 이용할 것
 */
import { useState, useEffect } from 'react';
import {
  RadixDialog as Dialog,
  RadixDialogContent as DialogContent,
  RadixDialogDescription as DialogDescription,
  RadixDialogHeader as DialogHeader,
  RadixDialogTitle as DialogTitle,
  RadixDialogTrigger as DialogTrigger,
} from '@codejam/ui';
import { RadixLabel as Label } from '@codejam/ui';
import { Button } from '@codejam/ui';
import { RadixInput as Input } from '@codejam/ui';
import { RadixSlider as Slider } from '@codejam/ui';
import { RadixSwitch as Switch } from '@codejam/ui';
import {
  Settings,
  RotateCcw,
  MousePointer2,
  UserCircle,
  Type,
  Activity,
} from 'lucide-react';
import { useSettings } from '@/shared/lib/hooks/useSettings';
import { toast } from '@codejam/ui';

export function SettingsDialog() {
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
  const [inputValue, setInputValue] = useState(fontSize.toString());

  // fontSize가 외부에서 변경되면 inputValue도 동기화
  useEffect(() => {
    setInputValue(fontSize.toString());
  }, [fontSize]);

  // Input 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      if (numValue > 30) {
        toast.error('폰트 크기는 최대 30px입니다');
      } else if (numValue < 10) {
        toast.error('폰트 크기는 최소 10px입니다');
      } else {
        setFontSize(numValue);
      }
    }
  };

  // Slider 변경 핸들러
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setFontSize(newValue);
    setInputValue(newValue.toString());
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs sm:px-3"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden lg:inline">Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Editor Settings</DialogTitle>
          <DialogDescription>
            에디터의 환경설정을 변경합니다. 변경 사항은 즉시 반영됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <h4 className="text-muted-foreground mb-1 text-sm font-medium">
            폰트
          </h4>
          {/* 폰트 크기 설정 */}
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="fontSize">폰트 크기</Label>
              <span className="text-muted-foreground text-xs">10px - 30px</span>
            </div>

            <div className="flex items-center gap-4">
              <Slider
                id="fontSize-slider"
                min={10}
                max={30}
                step={1}
                value={[fontSize]}
                onValueChange={handleSliderChange}
                className="flex-1"
              />

              <div className="flex min-w-18 items-center gap-2">
                <Input
                  id="fontSize"
                  type="number"
                  value={inputValue}
                  onChange={handleInputChange}
                  className="h-8 w-14 px-1 text-center"
                />
                <span className="text-muted-foreground text-sm">px</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-border my-2 border-t" />

        <div className="grid gap-4">
          <h4 className="text-muted-foreground mb-1 text-sm font-medium">
            커서 & 외관
          </h4>

          {/* 원격 커서 보이기/숨기기 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer2 className="text-muted-foreground h-4 w-4" />
              <Label htmlFor="show-cursor" className="cursor-pointer">
                다른 사용자의 커서 보기
              </Label>
            </div>
            <Switch
              id="show-cursor"
              checked={showRemoteCursor}
              onCheckedChange={toggleRemoteCursor}
            />
          </div>

          {/* Gutter 아바타 보이기/숨기기 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCircle className="text-muted-foreground h-4 w-4" />
              <Label htmlFor="show-gutter" className="cursor-pointer">
                줄 번호 옆 프로필 표시
              </Label>
            </div>
            <Switch
              id="show-gutter"
              checked={showGutterAvatars}
              onCheckedChange={toggleGutterAvatars}
            />
          </div>

          {/* 커서 이름 항상 보이기 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="text-muted-foreground h-4 w-4" />
              <Label htmlFor="show-labels" className="cursor-pointer">
                커서 이름표 항상 보기
              </Label>
            </div>
            <Switch
              id="show-labels"
              checked={alwaysShowCursorLabels}
              onCheckedChange={toggleCursorLabels}
            />
          </div>
        </div>

        <div className="border-border my-2 border-t" />

        <div className="grid gap-4">
          <h4 className="text-muted-foreground mb-1 text-sm font-medium">
            코드 실행
          </h4>

          {/* 코드 실행 출력 스트리밍 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="text-muted-foreground h-4 w-4" />
              <Label htmlFor="stream-output" className="cursor-pointer">
                실시간 출력
              </Label>
            </div>
            <Switch
              id="stream-output"
              checked={streamCodeExecutionOutput}
              onCheckedChange={toggleStreamCodeExecutionOutput}
            />
          </div>
        </div>

        {/* 하단 초기화 버튼 */}
        <div className="flex justify-end border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSettings}
            className="text-muted-foreground hover:text-red-500"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            초기화
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
