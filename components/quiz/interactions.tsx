'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, X } from 'lucide-react';
import { MathText } from '@/components/ui/math-text';

export function InteractiveJumble({ options, value, onChange }: { options: string[], value: string, onChange: (val: string) => void }) {
  const selectedItems: string[] = value ? value.split(' ') : [];
  const availableItems = options.filter((opt) => {
    // Count how many times this option is in selected
    const selectedCount = selectedItems.filter(i => i === opt).length;
    const totalCount = options.filter(i => i === opt).length;
    return selectedCount < totalCount;
  });

  const handleSelect = (item: string) => {
    const newItems = [...selectedItems, item];
    onChange(newItems.join(' '));
  };

  const handleRemove = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    onChange(newItems.join(' '));
  };

  return (
    <div className="space-y-6">
      {/* Answer Box */}
      <div className="min-h-[80px] p-4 border-2 border-dashed border-primary-300 bg-primary-50 dark:bg-primary-900/10 rounded-xl flex flex-wrap gap-2 items-center">
        {selectedItems.length === 0 && <span className="text-surface-400 text-sm">Pilih item di bawah secara berurutan...</span>}
        {selectedItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleRemove(idx)}
            className="flex items-center gap-1 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm shadow-sm hover:bg-danger-500 transition-colors"
          >
            <MathText content={item} />
            <X size={14} />
          </button>
        ))}
      </div>

      {/* Available Items Box */}
      <div className="flex flex-wrap gap-2 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
        {availableItems.length === 0 && <span className="text-surface-400 text-sm">Semua item telah dipilih</span>}
        {availableItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(item)}
            className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 px-3 py-2 rounded-lg text-sm shadow-sm hover:border-primary-400 transition-colors cursor-pointer"
          >
            <MathText content={item} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function InteractiveOrdering({ options, value, onChange }: { options: string[], value: string, onChange: (val: string) => void }) {
  // Essentially the same logic as jumble, but returns comma separated
  const selectedItems: string[] = value ? value.split(', ') : [];
  const availableItems = options.filter((opt) => !selectedItems.includes(opt));

  const handleSelect = (item: string) => {
    const newItems = [...selectedItems, item];
    onChange(newItems.join(', '));
  };

  const handleRemove = (index: number) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    onChange(newItems.join(', '));
  };

  return (
    <div className="space-y-6">
      <div className="min-h-[80px] p-4 border-2 border-dashed border-primary-300 bg-primary-50 dark:bg-primary-900/10 rounded-xl flex flex-col gap-2">
        {selectedItems.length === 0 && <span className="text-surface-400 text-sm">Klik item di bawah untuk mengurutkan...</span>}
        {selectedItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleRemove(idx)}
            className="flex items-center gap-2 bg-white dark:bg-surface-900 border border-primary-200 p-3 rounded-lg text-sm shadow-sm hover:bg-danger-50 dark:hover:bg-danger-900/20 hover:border-danger-300 transition-colors text-left"
          >
            <span className="font-bold text-primary-500 w-6">{idx + 1}.</span>
            <span className="flex-1"><MathText content={item} /></span>
            <X size={16} className="text-surface-400" />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
        {availableItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(item)}
            className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 px-4 py-2 rounded-lg text-sm shadow-sm hover:border-primary-400 transition-colors cursor-pointer"
          >
            <MathText content={item} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function InteractiveGrouping({ categories, items, value, onChange }: { categories: string[], items: {name: string, category: string}[], value: string, onChange: (val: string) => void }) {
  // Value format: "Karnivora:Harimau,Singa|Herbivora:Sapi"
  const parseValue = () => {
    if (!value) return {};
    const groups: Record<string, string[]> = {};
    value.split('|').forEach(groupStr => {
      const [cat, itemsStr] = groupStr.split(':');
      if (cat && itemsStr) {
        groups[cat] = itemsStr.split(',');
      }
    });
    return groups;
  };

  const selections = parseValue();
  const allSelectedItems = Object.values(selections).flat();
  const availableItems = items.filter(i => !allSelectedItems.includes(i.name));

  const [activeItem, setActiveItem] = useState<string | null>(null);

  const handleItemClick = (itemName: string) => {
    setActiveItem(itemName === activeItem ? null : itemName);
  };

  const handleCategoryClick = (category: string) => {
    if (activeItem) {
      const newSelections = { ...selections };
      if (!newSelections[category]) newSelections[category] = [];
      newSelections[category].push(activeItem);

      // Serialize
      const valStr = Object.entries(newSelections)
        .map(([cat, arr]) => `${cat}:${arr.join(',')}`)
        .join('|');
      
      onChange(valStr);
      setActiveItem(null);
    }
  };

  const handleRemove = (category: string, itemName: string) => {
    const newSelections = { ...selections };
    if (newSelections[category]) {
      newSelections[category] = newSelections[category].filter(i => i !== itemName);
      if (newSelections[category].length === 0) delete newSelections[category];
    }
    const valStr = Object.entries(newSelections)
      .map(([cat, arr]) => `${cat}:${arr.join(',')}`)
      .join('|');
    onChange(valStr);
  };

  return (
    <div className="space-y-6">
      {/* Available Items */}
      <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl flex flex-wrap gap-2 min-h-[60px]">
        {availableItems.length === 0 && <span className="text-surface-400 text-sm">Semua item telah dikelompokkan</span>}
        {availableItems.map((item, i) => (
          <button
            key={i}
            onClick={() => handleItemClick(item.name)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm shadow-sm transition-all cursor-pointer font-medium border",
              activeItem === item.name
                ? "bg-primary-600 text-white border-primary-600 ring-2 ring-primary-300"
                : "bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-700 hover:border-primary-400"
            )}
          >
            {item.name}
          </button>
        ))}
      </div>
      
      {activeItem && <p className="text-center text-sm text-primary-600 font-medium animate-pulse">👆 Klik salah satu kotak di bawah untuk memasukkan "{activeItem}"</p>}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat, idx) => (
          <div 
            key={idx}
            onClick={() => handleCategoryClick(cat)}
            className={cn(
              "min-h-[120px] p-4 border-2 rounded-xl transition-all",
              activeItem ? "border-primary-400 bg-primary-50/50 dark:bg-primary-900/10 cursor-pointer hover:bg-primary-100" : "border-surface-200 bg-surface-50 dark:bg-surface-800"
            )}
          >
            <h3 className="font-bold text-center mb-3 pb-2 border-b border-surface-200 dark:border-surface-700">{cat}</h3>
            <div className="flex flex-wrap gap-2">
              {(selections[cat] || []).map((itemName, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); handleRemove(cat, itemName); }}
                  className="flex items-center gap-1 bg-white dark:bg-surface-900 border border-surface-200 px-2 py-1 rounded text-xs shadow-sm hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200 transition-colors"
                >
                  {itemName} <X size={12} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function InteractiveImageOptions({ options, value, onChange }: { options: string[], value: string, onChange: (val: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {options.map((keyword, i) => {
        const isSelected = value === keyword;
        return (
          <button
            key={i}
            onClick={() => onChange(keyword)}
            className={cn(
              "relative rounded-xl overflow-hidden border-4 transition-all aspect-[4/3] bg-white cursor-pointer",
              isSelected ? "border-primary-500 shadow-md transform scale-[1.02]" : "border-surface-200 hover:border-primary-300"
            )}
          >
            <img 
              src={`https://loremflickr.com/400/300/${encodeURIComponent(keyword)}?lock=${i + 1}`}
              alt={keyword}
              className="w-full h-full object-cover"
            />
            {isSelected && (
              <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1 shadow-md">
                <CheckCircle size={20} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
