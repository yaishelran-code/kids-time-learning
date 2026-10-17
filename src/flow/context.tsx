import { createContext, useContext } from 'react';
import type { Topic } from '../parent/state';
export type PracticeMeta = { topic: Topic; completed: boolean; index: number; hour?: number; minute?: number; kind?: string; stage?: string };
export const FlowContext = createContext<{ report: (meta: PracticeMeta) => void; nextTopic: () => void; nextLabel: string } | null>(null);
export const useFlow = () => useContext(FlowContext);
export const LessonContext = createContext<((mode: string) => void) | null>(null);
export const useLessonFlow = () => useContext(LessonContext);
