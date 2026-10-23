import type { Task } from '../engine/task';
import { DragonFood } from './DragonFood';
import { DragonMap } from './DragonMap';
import { Treasury } from './Treasury';

export function TaskView({
  task,
  onAnswer,
  disabled,
}: {
  task: Task;
  onAnswer(n: number): void;
  disabled: boolean;
}) {
  switch (task.skillId) {
    case 'addsub':
      return <Treasury task={task} />;
    case 'compare':
      return <DragonMap task={task} onAnswer={onAnswer} disabled={disabled} />;
    case 'muldiv':
      return <DragonFood task={task} />;
  }
}
