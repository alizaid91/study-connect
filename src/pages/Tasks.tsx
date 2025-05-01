import TaskBoard from '../components/TaskBoard';

const Task = () => {
  return (
    <div className="pt-4 h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <TaskBoard />
      </div>
    </div>
  );
};

export default Task; 