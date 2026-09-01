import { forwardRef, type HTMLAttributes, useState, createContext, useContext } from 'react';
import { clsx } from 'clsx';

interface TabsContextValue {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
}

interface TabsProps {
  defaultValue: string;
  onChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ defaultValue, onChange, children, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onChange?.(tab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      <div className={clsx('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends HTMLAttributes<HTMLDivElement> {}

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      aria-orientation="horizontal"
      className={clsx('flex gap-1 bg-space-800 p-1 rounded-lg border border-space-700', className)}
      {...props}
    >
      {children}
    </div>
  )
);

TabsList.displayName = 'TabsList';

interface TabTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const TabTrigger = forwardRef<HTMLButtonElement, TabTriggerProps>(
  ({ className, value, disabled, icon, children, ...props }, ref) => {
    const { activeTab, onTabChange } = useTabsContext();
    const isActive = activeTab === value;

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        id={`tab-${value}`}
        disabled={disabled}
        onClick={() => !disabled && onTabChange(value)}
        className={clsx(
          'relative px-4 py-2 text-sm font-medium rounded-md transition-all duration-150 focus-visible-ring',
          isActive
            ? 'bg-space-900 text-cyan-400 shadow-sm'
            : 'text-space-400 hover:text-space-200 hover:bg-space-700',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {icon && <span className="flex items-center gap-2">{icon}</span>}
        {children}
      </button>
    );
  }
);

TabTrigger.displayName = 'TabTrigger';

interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${value}`}
        aria-labelledby={`tab-${value}`}
        className={clsx('mt-4 animate-in', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'TabsContent';