import { DraggableLocation } from '@hello-pangea/dnd';

export interface DragEndResult {
  draggableId: string;
  type: string;
  source: DraggableLocation;
  destination: DraggableLocation | null;
  reason: 'DROP' | 'CANCEL';
}
