import React, { useState, useEffect, useRef } from 'react';
import { Tab } from '../types';
import { Button } from './Button';
import { audioService } from '../services/audioService';

interface TabEditorProps {
  initialTab?: Tab;
  onSave: (tab: Tab) => void;
  onCancel: () => void;
}

export const TabEditor: React.FC<TabEditorProps> = ({ initialTab, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialTab?.title || '未命名乐谱');
  const [artist, setArtist] = useState(initialTab?.artist || '我');
  
  // Grid Data: 4 strings x N steps
  // 1 row = 16 steps (usually 4 bars of 4/4 if 1 step = 1/4 note, or 2 bars if 1 step = 1/8 note)
  // Let's assume 1 step = 1/8 note. 16 steps = 2 bars of 4/4.
  const STEPS_PER_ROW = 16;

  const [grid, setGrid] = useState<(number | null)[][]>(
    initialTab?.content || Array(STEPS_PER_ROW * 2).fill([null, null, null, null])
  );
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const playIntervalRef = useRef<number | null>(null);

  const strings = ['A', 'E', 'C', 'G']; // Visual Order (Top to Bottom)
  const visualRowMap = [3, 2, 1, 0]; // Map visual row index to data index (G=0, C=1, E=2, A=3)

  // Chunk grid into rows for rendering
  const rows = [];
  for (let i = 0; i < grid.length; i += STEPS_PER_ROW) {
    rows.push({
      index: i / STEPS_PER_ROW,
      startIndex: i,
      data: grid.slice(i, i + STEPS_PER_ROW)
    });
  }

  const handleCellClick = (stepIndex: number, stringDataIndex: number) => {
    // Optional: click to cycle or just rely on input
  };

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>, absoluteStepIndex: number, stringDataIndex: number) => {
    const val = e.target.value;
    const newGrid = [...grid];
    const newStep = [...newGrid[absoluteStepIndex]];
    
    if (val === '') {
        newStep[stringDataIndex] = null;
    } else {
        const num = parseInt(val);
        if (!isNaN(num) && num >= 0 && num <= 25) {
            newStep[stringDataIndex] = num;
             // Play note immediately for feedback
             const singleNote = [null, null, null, null] as (number|null)[];
             singleNote[stringDataIndex] = num;
             audioService.playColumn(singleNote, 0.2);
        }
    }
    newGrid[absoluteStepIndex] = newStep;
    setGrid(newGrid);
  }

  const addRow = () => {
    const emptyStep = [null, null, null, null];
    setGrid([...grid, ...Array(STEPS_PER_ROW).fill(emptyStep)]);
  };

  const playTab = () => {
    if (isPlaying) {
      stopTab();
      return;
    }

    setIsPlaying(true);
    let step = 0;
    const bpm = 100;
    const stepDuration = 60 / bpm / 2; // Eighth notes

    // Initial play
    setCurrentStep(step);
    audioService.playColumn(grid[step], stepDuration);

    playIntervalRef.current = window.setInterval(() => {
      step++;
      if (step >= grid.length) {
        stopTab();
      } else {
        setCurrentStep(step);
        audioService.playColumn(grid[step], stepDuration);
      }
    }, stepDuration * 1000);
  };

  const stopTab = () => {
    if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
    setIsPlaying(false);
    setCurrentStep(-1);
  };

  useEffect(() => {
    return () => stopTab();
  }, []);

  const handleSave = () => {
    if (!title.trim()) {
        alert("请输入标题");
        return;
    }
    onSave({
      id: initialTab?.id || Date.now().toString(),
      title,
      artist,
      createdAt: initialTab?.createdAt || Date.now(),
      type: 'editor',
      content: grid
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 border-2 border-orange-100 min-h-[80vh] flex flex-col">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-orange-100 pb-4 gap-4">
        <div className="w-full sm:w-auto">
          <input
            className="text-2xl font-bold text-orange-900 placeholder-orange-300 border-none focus:ring-0 w-full bg-transparent p-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="歌曲标题"
          />
          <input
            className="text-sm text-gray-500 placeholder-gray-300 border-none focus:ring-0 w-full bg-transparent p-0 mt-1"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="艺术家/歌手"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-end">
           <Button variant="secondary" onClick={playTab} className="min-w-[100px]">
             {isPlaying ? '⏹ 停止' : '▶ 试听'}
           </Button>
           <Button onClick={handleSave} className="min-w-[100px]">💾 保存</Button>
           <Button variant="outline" onClick={onCancel}>取消</Button>
        </div>
      </div>

      {/* Sheet Content Area - Multi-row */}
      <div className="flex-1 overflow-y-auto space-y-12 pr-2">
        {rows.map((row) => (
            <div key={row.index} className="relative pt-4">
                {/* Visual Strings */}
                <div className="relative">
                     {/* Bar Lines Logic: Every 4 steps is a beat/quarter note? Let's say every 8 steps is a bar (4/4 time with 8th notes) */}
                     <div className="absolute inset-0 flex pointer-events-none">
                        {Array.from({ length: STEPS_PER_ROW / 8 + 1 }).map((_, barIdx) => (
                            <div 
                                key={barIdx} 
                                className="h-full border-r border-orange-800 opacity-20 absolute top-0"
                                style={{ left: `${(barIdx * 8 * (100 / STEPS_PER_ROW))}%` }}
                            ></div>
                        ))}
                        {/* Final closing bar line */}
                         <div className="absolute right-0 top-0 bottom-0 border-r-2 border-orange-800 opacity-40 h-full"></div>
                     </div>

                    {visualRowMap.map((stringDataIndex, stringVisualIndex) => (
                        <div key={stringDataIndex} className="h-12 relative flex items-center">
                            {/* String Line */}
                            <div className="absolute left-0 right-0 h-[2px] bg-orange-800 opacity-30"></div>
                            
                            {/* String Name (Only on first column of the row) */}
                            <div className="absolute -left-8 text-orange-400 font-bold text-xs w-6 text-right">
                                {strings[stringVisualIndex]}
                            </div>

                            {/* Steps in this row */}
                            <div className="flex w-full h-full relative">
                                {row.data.map((stepData, localStepIndex) => {
                                    const absoluteStepIndex = row.startIndex + localStepIndex;
                                    const noteValue = stepData[stringDataIndex];
                                    const isActive = currentStep === absoluteStepIndex;

                                    return (
                                        <div 
                                            key={absoluteStepIndex} 
                                            className={`
                                                flex-1 relative flex items-center justify-center
                                                ${isActive ? 'bg-orange-100/50' : ''}
                                            `}
                                        >
                                            <div className="relative w-8 h-8 flex items-center justify-center">
                                                {/* The Orange Note Visual */}
                                                <div className={`
                                                    absolute inset-0 rounded-full transition-all duration-200
                                                    ${noteValue !== null ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
                                                    bg-orange-500 shadow-md
                                                `}>
                                                    {/* Leaf detail for the Orange */}
                                                    <div className="absolute -top-1 right-0 w-3 h-3 bg-green-500 rounded-full rounded-bl-none transform -rotate-45"></div>
                                                </div>

                                                {/* Input Field */}
                                                <input
                                                    type="number"
                                                    value={noteValue === null ? '' : noteValue}
                                                    onChange={(e) => handleManualInput(e, absoluteStepIndex, stringDataIndex)}
                                                    className={`
                                                        w-full h-full text-center bg-transparent z-10 font-bold text-lg focus:outline-none
                                                        ${noteValue !== null ? 'text-white' : 'text-transparent hover:text-orange-300 hover:bg-white/50 rounded-full'}
                                                    `}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
        
        <div className="flex justify-center pb-8 pt-4">
             <button 
                onClick={addRow}
                className="group flex items-center gap-2 text-orange-400 hover:text-orange-600 font-bold transition-all px-6 py-3 rounded-full border-2 border-dashed border-orange-200 hover:border-orange-400 hover:bg-orange-50"
             >
                <span className="text-xl group-hover:scale-110 transition-transform">+</span> 
                <span>添加下一行 (Add Row)</span>
             </button>
        </div>
      </div>
    </div>
  );
};