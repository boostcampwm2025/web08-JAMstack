import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@codejam/ui';
import {
  Calendar,
  Smile,
  Calculator,
  User,
  CreditCard,
  Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const meta = {
  title: 'Third-Party/Command',
  component: Command,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-[400px]">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile className="mr-2 h-4 w-4" />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <Calculator className="mr-2 h-4 w-4" />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};

export const Dialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((open) => !open);
        }
      };

      document.addEventListener('keydown', down);
      return () => document.removeEventListener('keydown', down);
    }, []);

    return (
      <>
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Press{' '}
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>J
            </kbd>{' '}
            to open the command menu
          </p>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
          >
            Open Command Dialog
          </button>
        </div>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Calendar className="mr-2 h-4 w-4" />
                <span>Calendar</span>
              </CommandItem>
              <CommandItem>
                <Smile className="mr-2 h-4 w-4" />
                <span>Search Emoji</span>
              </CommandItem>
              <CommandItem>
                <Calculator className="mr-2 h-4 w-4" />
                <span>Calculator</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
                <CommandShortcut>⌘B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    );
  },
};
