import React from 'react';
import { History, Trash2, ArrowRight, Play } from 'lucide-react';

export interface HistoryItem {
  id: string;
  text: string;
  date: string;
}

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (text: string) => void;
  onClear: () => void;
  onDelete: (id: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelect,
  onClear,
  onDelete,
}) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-stone-700">
          <History className="w-3.5 h-3.5 text-stone-400" />
          <span>최근 연습한 문장 ({history.length})</span>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-stone-400 hover:text-rose-600 transition-colors"
        >
          기록 전체 삭제
        </button>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all group"
          >
            <button
              type="button"
              onClick={() => onSelect(item.text)}
              className="text-left text-xs font-medium text-stone-800 hover:text-amber-700 truncate max-w-[80%] flex items-center space-x-2"
            >
              <Play className="w-3 h-3 text-stone-400 group-hover:text-amber-500 shrink-0" />
              <span className="truncate">{item.text}</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-all"
              title="삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
